import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getJobStatus } from '@/lib/services/backfill-service';

// GET - Get job status by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get job and verify ownership
    const { data: job, error: jobError } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();
    
    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const status = await getJobStatus(jobId);
    
    return NextResponse.json({
      data: status,
    });
    
  } catch (error) {
    console.error('Job status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update job status to cancelled
    const { error: updateError } = await supabase
      .from('background_jobs')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('user_id', user.id)
      .in('status', ['pending', 'running']);
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Job cancelled',
    });
    
  } catch (error) {
    console.error('Job cancel API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
