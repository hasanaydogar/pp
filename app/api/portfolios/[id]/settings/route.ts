import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  UpdatePortfolioSettingsSchema, 
  DEFAULT_PORTFOLIO_SETTINGS,
  PortfolioSettings 
} from '@/lib/types/portfolio-settings';

// GET - Get portfolio settings (returns defaults if none exist)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Fetch settings
    const { data: settings, error: settingsError } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .single();
    
    // If no settings exist, return defaults
    if (settingsError || !settings) {
      return NextResponse.json({
        data: {
          portfolio_id: portfolioId,
          ...DEFAULT_PORTFOLIO_SETTINGS,
          is_default: true,
        },
      });
    }
    
    return NextResponse.json({
      data: {
        ...settings,
        is_default: false,
      },
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update or create portfolio settings (upsert)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Parse and validate body
    const body = await request.json();
    const validated = UpdatePortfolioSettingsSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('portfolio_settings')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .single();
    
    let result;
    
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('portfolio_settings')
        .update(validated.data)
        .eq('portfolio_id', portfolioId)
        .select()
        .single();
    } else {
      // Insert new settings with defaults
      result = await supabase
        .from('portfolio_settings')
        .insert({
          portfolio_id: portfolioId,
          ...DEFAULT_PORTFOLIO_SETTINGS,
          ...validated.data,
        })
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Error saving settings:', result.error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
    
    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
