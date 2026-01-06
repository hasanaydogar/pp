/**
 * Backfill Service
 * Handles historical snapshot backfill operations
 */

import { createClient } from '@/lib/supabase/server';
import { 
  fetchMultipleHistoricalPrices, 
  getNearestPriceForDate,
  HistoricalPrice 
} from './historical-price-service';
import { formatSnapshotDate } from '@/lib/types/snapshot';

export interface BackfillConfig {
  portfolioId: string;
  userId: string;
  daysBack: number;
}

export interface BackfillProgress {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  error?: string;
  result?: {
    snapshotsCreated: number;
    snapshotsSkipped: number;
    errors: string[];
  };
}

interface AssetHolding {
  symbol: string;
  currency: string;
  quantity: number;
  purchaseDate: string;
}

interface DailyHolding {
  date: string;
  assets: Array<{
    symbol: string;
    quantity: number;
    price: number;
    value: number;
  }>;
  cashValue: number;
  totalValue: number;
}

/**
 * Start a backfill job
 */
export async function startBackfillJob(config: BackfillConfig): Promise<string> {
  const supabase = await createClient();
  
  // Create job record
  const { data: job, error } = await supabase
    .from('background_jobs')
    .insert({
      user_id: config.userId,
      portfolio_id: config.portfolioId,
      job_type: 'snapshot_backfill',
      status: 'pending',
      config: {
        days_back: config.daysBack,
      },
      progress: 0,
      current_step: 'İş kuyruğa eklendi',
    })
    .select('id')
    .single();
  
  if (error || !job) {
    throw new Error(`Failed to create job: ${error?.message}`);
  }
  
  return job.id;
}

/**
 * Update job progress
 */
export async function updateJobProgress(
  jobId: string,
  updates: Partial<BackfillProgress>
): Promise<void> {
  const supabase = await createClient();
  
  const updateData: Record<string, unknown> = {};
  
  if (updates.status) updateData.status = updates.status;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.currentStep) updateData.current_step = updates.currentStep;
  if (updates.completedSteps !== undefined) updateData.completed_steps = updates.completedSteps;
  if (updates.totalSteps !== undefined) updateData.total_steps = updates.totalSteps;
  if (updates.error) updateData.error_message = updates.error;
  if (updates.result) updateData.result = updates.result;
  
  if (updates.status === 'running' && !updateData.started_at) {
    updateData.started_at = new Date().toISOString();
  }
  
  if (updates.status === 'completed' || updates.status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }
  
  await supabase
    .from('background_jobs')
    .update(updateData)
    .eq('id', jobId);
}

/**
 * Execute backfill job
 * This is the main function that processes the backfill
 */
export async function executeBackfillJob(jobId: string): Promise<void> {
  const supabase = await createClient();
  
  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('background_jobs')
      .select('*, portfolio:portfolios(*)')
      .eq('id', jobId)
      .single();
    
    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`);
    }
    
    const portfolioId = job.portfolio_id;
    const daysBack = job.config?.days_back || 30;
    
    // Update status to running
    await updateJobProgress(jobId, {
      status: 'running',
      currentStep: 'Portföy verileri yükleniyor...',
      progress: 5,
    });
    
    // Get portfolio assets with transactions
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select(`
        id,
        symbol,
        quantity,
        average_buy_price,
        created_at,
        transactions(
          id,
          type,
          amount,
          price,
          date
        )
      `)
      .eq('portfolio_id', portfolioId);
    
    if (assetsError) {
      throw new Error(`Failed to fetch assets: ${assetsError.message}`);
    }
    
    // Get cash positions
    const { data: cashPositions, error: cashError } = await supabase
      .from('cash_positions')
      .select('id, currency, amount')
      .eq('portfolio_id', portfolioId);
    
    if (cashError) {
      throw new Error(`Failed to fetch cash: ${cashError.message}`);
    }
    
    // Get cash position IDs for this portfolio
    const cashPositionIds = (cashPositions || []).map((cp: { id?: string }) => cp.id).filter(Boolean);
    
    // Get cash transactions for historical cash values
    let cashTransactions: Array<{ date: string; type: string; amount: number }> = [];
    if (cashPositionIds.length > 0) {
      const { data: txData, error: cashTxError } = await supabase
        .from('cash_transactions')
        .select('date, type, amount')
        .in('cash_position_id', cashPositionIds)
        .order('date', { ascending: true });
      
      if (cashTxError) {
        console.warn('Failed to fetch cash transactions:', cashTxError.message);
      } else {
        cashTransactions = txData || [];
      }
    }
    
    const baseCurrency = job.portfolio?.base_currency || 'TRY';
    
    await updateJobProgress(jobId, {
      currentStep: 'Geçmiş fiyatlar çekiliyor...',
      progress: 10,
    });
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Get unique symbols
    const symbols = (assets || []).map(a => ({
      symbol: a.symbol,
      currency: baseCurrency,
    }));
    
    if (symbols.length === 0) {
      await updateJobProgress(jobId, {
        status: 'completed',
        progress: 100,
        currentStep: 'Tamamlandı - varlık bulunamadı',
        result: {
          snapshotsCreated: 0,
          snapshotsSkipped: 0,
          errors: [],
        },
      });
      return;
    }
    
    // Fetch historical prices for all symbols
    let fetchProgress = 10;
    const historicalPrices = await fetchMultipleHistoricalPrices(
      symbols,
      startDate,
      endDate,
      (current, total, symbol) => {
        const progressPercent = 10 + Math.floor((current / total) * 40);
        updateJobProgress(jobId, {
          currentStep: `Fiyat çekiliyor: ${symbol} (${current}/${total})`,
          progress: progressPercent,
        });
      }
    );
    
    await updateJobProgress(jobId, {
      currentStep: 'Günlük değerler hesaplanıyor...',
      progress: 50,
    });
    
    // Generate dates to process
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(formatSnapshotDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Get existing snapshots
    const { data: existingSnapshots } = await supabase
      .from('portfolio_snapshots')
      .select('snapshot_date')
      .eq('portfolio_id', portfolioId)
      .gte('snapshot_date', formatSnapshotDate(startDate));
    
    const existingDates = new Set(existingSnapshots?.map(s => s.snapshot_date) || []);
    
    // Process each date
    let snapshotsCreated = 0;
    let snapshotsSkipped = 0;
    const errors: string[] = [];
    
    // Build asset transaction history for quantity tracking
    const assetQuantityHistory = buildAssetQuantityHistory(assets || []);
    
    // Calculate current cash value
    const currentCashValue = (cashPositions || []).reduce(
      (sum, cp) => sum + Number(cp.amount),
      0
    );
    
    // Build cash history from transactions
    const cashHistory = buildCashHistory(cashTransactions || [], currentCashValue);
    
    console.log(`[Backfill] Processing ${dates.length} dates, existing snapshots: ${existingDates.size}`);
    console.log(`[Backfill] Existing dates:`, Array.from(existingDates));
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      
      // Skip weekends (markets closed)
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log(`[Backfill] Skipping ${date} - weekend`);
        snapshotsSkipped++;
        continue;
      }
      
      // Skip if snapshot already exists
      if (existingDates.has(date)) {
        console.log(`[Backfill] Skipping ${date} - already exists`);
        snapshotsSkipped++;
        continue;
      }
      
      try {
        // Calculate portfolio value for this date
        let assetsValue = 0;
        
        for (const asset of assets || []) {
          // Get quantity held on this date
          const quantity = getQuantityOnDate(
            asset.symbol,
            date,
            assetQuantityHistory
          );
          
          if (quantity <= 0) continue;
          
          // Get price for this date
          const priceData = historicalPrices.get(asset.symbol);
          const nearestPrice = priceData 
            ? getNearestPriceForDate(priceData, date)
            : null;
          
          if (nearestPrice) {
            assetsValue += quantity * nearestPrice.price;
          } else {
            // Fallback to average buy price
            assetsValue += quantity * Number(asset.average_buy_price);
          }
        }
        
        // Get cash value for this date
        const cashValue = getCashOnDate(date, cashHistory);
        const totalValue = assetsValue + cashValue;
        
        console.log(`[Backfill] ${date}: assetsValue=${assetsValue.toFixed(2)}, cashValue=${cashValue.toFixed(2)}, totalValue=${totalValue.toFixed(2)}`);
        
        // Skip if total value is 0 (portfolio didn't exist yet)
        if (totalValue <= 0) {
          console.log(`[Backfill] Skipping ${date} - total value is 0`);
          snapshotsSkipped++;
          continue;
        }
        
        // Create snapshot
        const { error: insertError } = await supabase
          .from('portfolio_snapshots')
          .insert({
            portfolio_id: portfolioId,
            snapshot_date: date,
            total_value: totalValue,
            assets_value: assetsValue,
            cash_value: cashValue,
            daily_change: 0, // Will be calculated after all inserts
            daily_change_percent: 0,
          });
        
        if (insertError) {
          errors.push(`${date}: ${insertError.message}`);
        } else {
          snapshotsCreated++;
        }
      } catch (err) {
        errors.push(`${date}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      
      // Update progress
      const progressPercent = 50 + Math.floor(((i + 1) / dates.length) * 40);
      if (i % 5 === 0) {
        await updateJobProgress(jobId, {
          currentStep: `Snapshot oluşturuluyor: ${date} (${i + 1}/${dates.length})`,
          progress: progressPercent,
          completedSteps: i + 1,
          totalSteps: dates.length,
        });
      }
    }
    
    // Calculate daily changes
    await updateJobProgress(jobId, {
      currentStep: 'Günlük değişimler hesaplanıyor...',
      progress: 95,
    });
    
    await calculateDailyChanges(portfolioId);
    
    // Mark as completed
    await updateJobProgress(jobId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Tamamlandı',
      result: {
        snapshotsCreated,
        snapshotsSkipped,
        errors: errors.slice(0, 10), // Limit error count
      },
    });
    
  } catch (error) {
    await updateJobProgress(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      currentStep: 'Hata oluştu',
    });
  }
}

/**
 * Build quantity history for each asset based on transactions
 */
function buildAssetQuantityHistory(
  assets: Array<{
    symbol: string;
    quantity: number;
    created_at: string;
    transactions?: Array<{
      type: string;
      amount: number; // In transactions table, quantity is stored as 'amount'
      date: string;
    }>;
  }>
): Map<string, Array<{ date: string; quantity: number }>> {
  const history = new Map<string, Array<{ date: string; quantity: number }>>();
  
  for (const asset of assets) {
    const transactions = asset.transactions || [];
    const changes: Array<{ date: string; change: number }> = [];
    
    // Sort transactions by date
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    for (const tx of sorted) {
      // 'amount' in transactions table represents quantity
      const change = tx.type === 'BUY' 
        ? Number(tx.amount) 
        : -Number(tx.amount);
      changes.push({ date: tx.date.split('T')[0], change });
    }
    
    // Build cumulative quantity by date
    let runningQuantity = 0;
    const quantityByDate: Array<{ date: string; quantity: number }> = [];
    
    for (const c of changes) {
      runningQuantity += c.change;
      quantityByDate.push({ date: c.date, quantity: runningQuantity });
    }
    
    // If no transactions, assume current quantity from start
    if (quantityByDate.length === 0 && Number(asset.quantity) > 0) {
      const createdDate = asset.created_at.split('T')[0];
      console.log(`[Backfill] Asset ${asset.symbol}: No transactions, using created_at=${createdDate}, quantity=${asset.quantity}`);
      quantityByDate.push({
        date: createdDate,
        quantity: Number(asset.quantity),
      });
    } else if (transactions.length > 0) {
      console.log(`[Backfill] Asset ${asset.symbol}: ${transactions.length} transactions, final quantity=${runningQuantity}`);
    }
    
    history.set(asset.symbol, quantityByDate);
  }
  
  return history;
}

/**
 * Get quantity of an asset on a specific date
 */
function getQuantityOnDate(
  symbol: string,
  date: string,
  history: Map<string, Array<{ date: string; quantity: number }>>
): number {
  const assetHistory = history.get(symbol);
  if (!assetHistory || assetHistory.length === 0) return 0;
  
  const targetDate = new Date(date).getTime();
  
  // Find the most recent quantity on or before the target date
  let quantity = 0;
  for (const h of assetHistory) {
    if (new Date(h.date).getTime() <= targetDate) {
      quantity = h.quantity;
    } else {
      break;
    }
  }
  
  return quantity;
}

/**
 * Build cash history from transactions
 */
function buildCashHistory(
  transactions: Array<{
    date: string;
    type: string;
    amount: number;
  }>,
  currentBalance: number
): Array<{ date: string; balance: number }> {
  // Work backwards from current balance
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const history: Array<{ date: string; balance: number }> = [];
  let balance = currentBalance;
  
  // Current date
  history.push({ date: formatSnapshotDate(new Date()), balance });
  
  for (const tx of sorted) {
    // Reverse the transaction to get previous balance
    const amount = Number(tx.amount);
    if (tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND') {
      balance -= amount;
    } else if (tx.type === 'WITHDRAWAL' || tx.type === 'FEE') {
      balance += amount;
    }
    
    history.push({ date: tx.date.split('T')[0], balance });
  }
  
  // Sort by date ascending
  return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get cash balance on a specific date
 */
function getCashOnDate(
  date: string,
  history: Array<{ date: string; balance: number }>
): number {
  if (history.length === 0) return 0;
  
  const targetDate = new Date(date).getTime();
  
  // Find the most recent balance on or before the target date
  let balance = 0;
  for (const h of history) {
    if (new Date(h.date).getTime() <= targetDate) {
      balance = h.balance;
    } else {
      break;
    }
  }
  
  return Math.max(0, balance);
}

/**
 * Calculate daily changes for all snapshots
 */
async function calculateDailyChanges(portfolioId: string): Promise<void> {
  const supabase = await createClient();
  
  // Get all snapshots ordered by date
  const { data: snapshots, error } = await supabase
    .from('portfolio_snapshots')
    .select('id, snapshot_date, total_value')
    .eq('portfolio_id', portfolioId)
    .order('snapshot_date', { ascending: true });
  
  if (error || !snapshots || snapshots.length < 2) return;
  
  // Update each snapshot with daily change
  for (let i = 1; i < snapshots.length; i++) {
    const previous = snapshots[i - 1];
    const current = snapshots[i];
    
    const prevValue = Number(previous.total_value);
    const currValue = Number(current.total_value);
    const dailyChange = currValue - prevValue;
    const dailyChangePercent = prevValue > 0 ? (dailyChange / prevValue) * 100 : 0;
    
    await supabase
      .from('portfolio_snapshots')
      .update({
        daily_change: dailyChange,
        daily_change_percent: dailyChangePercent,
      })
      .eq('id', current.id);
  }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<BackfillProgress | null> {
  const supabase = await createClient();
  
  const { data: job, error } = await supabase
    .from('background_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  
  if (error || !job) return null;
  
  return {
    jobId: job.id,
    status: job.status,
    progress: job.progress || 0,
    currentStep: job.current_step || '',
    completedSteps: job.completed_steps || 0,
    totalSteps: job.total_steps || 0,
    error: job.error_message,
    result: job.result,
  };
}

/**
 * Get latest job for a portfolio
 */
export async function getLatestJobForPortfolio(
  portfolioId: string,
  jobType: string = 'snapshot_backfill'
): Promise<BackfillProgress | null> {
  const supabase = await createClient();
  
  const { data: job, error } = await supabase
    .from('background_jobs')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('job_type', jobType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !job) return null;
  
  return {
    jobId: job.id,
    status: job.status,
    progress: job.progress || 0,
    currentStep: job.current_step || '',
    completedSteps: job.completed_steps || 0,
    totalSteps: job.total_steps || 0,
    error: job.error_message,
    result: job.result,
  };
}
