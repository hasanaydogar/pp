import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  startBackfillJob, 
  executeBackfillJob,
  getLatestJobForPortfolio 
} from '@/lib/services/backfill-service';
import { z } from 'zod';

const StartBackfillSchema = z.object({
  portfolio_id: z.string().uuid(),
  days_back: z.number().min(7).max(365).default(30),
});

// POST - Start a new backfill job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse body
    const body = await request.json();
    const validated = StartBackfillSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }
    
    const { portfolio_id, days_back } = validated.data;
    
    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolio_id)
      .eq('user_id', user.id)
      .single();
    
    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    // Check if there's already a running job
    const existingJob = await getLatestJobForPortfolio(portfolio_id);
    if (existingJob && (existingJob.status === 'pending' || existingJob.status === 'running')) {
      return NextResponse.json(
        { 
          error: 'A backfill job is already running for this portfolio',
          job: existingJob 
        },
        { status: 409 }
      );
    }
    
    // Start the job
    const jobId = await startBackfillJob({
      portfolioId: portfolio_id,
      userId: user.id,
      daysBack: days_back,
    });
    
    // Execute the job in the background
    // Note: In production, you'd use a proper queue system
    // For now, we'll use a fire-and-forget approach
    executeBackfillJob(jobId).catch(err => {
      console.error('Backfill job failed:', err);
    });
    
    return NextResponse.json({
      success: true,
      job_id: jobId,
      message: 'Backfill job started',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Backfill API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get latest job status for a portfolio
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolio_id');
    
    if (!portfolioId) {
      return NextResponse.json({ error: 'portfolio_id is required' }, { status: 400 });
    }
    
    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();
    
    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    const job = await getLatestJobForPortfolio(portfolioId);
    
    return NextResponse.json({
      data: job,
    });
    
  } catch (error) {
    console.error('Job status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
