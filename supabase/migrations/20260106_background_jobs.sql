-- Background Jobs Table
-- Used for long-running tasks like historical data backfill

-- Job status enum
DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Job type enum
DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('snapshot_backfill', 'dividend_sync', 'price_sync');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Background jobs table
CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  job_type job_type NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  
  -- Progress tracking
  progress INTEGER DEFAULT 0, -- 0-100
  current_step TEXT,
  total_steps INTEGER,
  completed_steps INTEGER DEFAULT 0,
  
  -- Job configuration
  config JSONB DEFAULT '{}',
  
  -- Results
  result JSONB,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_background_jobs_user_id ON background_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_portfolio_id ON background_jobs(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_created_at ON background_jobs(created_at DESC);

-- RLS Policies
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
  ON background_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create jobs for themselves
CREATE POLICY "Users can create own jobs"
  ON background_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs (for cancellation)
CREATE POLICY "Users can update own jobs"
  ON background_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_background_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_background_jobs_updated_at ON background_jobs;
CREATE TRIGGER trigger_background_jobs_updated_at
  BEFORE UPDATE ON background_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_background_jobs_updated_at();

-- Comments
COMMENT ON TABLE background_jobs IS 'Queue for long-running background tasks';
COMMENT ON COLUMN background_jobs.progress IS 'Job progress percentage (0-100)';
COMMENT ON COLUMN background_jobs.current_step IS 'Human-readable current step description';
COMMENT ON COLUMN background_jobs.config IS 'Job-specific configuration (e.g., date range, symbols)';
COMMENT ON COLUMN background_jobs.result IS 'Job result data (e.g., created snapshot count)';
