-- Add slug column to portfolios table for custom URL support
-- Migration: 20260113_add_portfolio_slug

-- Add slug column
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on user_id + slug combination
CREATE UNIQUE INDEX IF NOT EXISTS portfolios_user_slug_unique
ON portfolios(user_id, slug);

-- Generate slug for existing portfolios using Turkish character mapping
-- Step 1: Apply Turkish character replacements
UPDATE portfolios
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        regexp_replace(name, 'Ş', 's', 'g'),
                      'ş', 's', 'g'),
                    'Ğ', 'g', 'g'),
                  'ğ', 'g', 'g'),
                'Ü', 'u', 'g'),
              'ü', 'u', 'g'),
            'Ö', 'o', 'g'),
          'ö', 'o', 'g'),
        'Ç', 'c', 'g'),
      'ç', 'c', 'g'),
    'İ', 'i', 'g'),
  'ı', 'i', 'g')
)
WHERE slug IS NULL;

-- Step 2: Replace non-alphanumeric characters with dashes
UPDATE portfolios
SET slug = regexp_replace(slug, '[^a-z0-9]+', '-', 'g')
WHERE slug IS NOT NULL;

-- Step 3: Remove leading and trailing dashes
UPDATE portfolios
SET slug = regexp_replace(regexp_replace(slug, '^-+', ''), '-+$', '')
WHERE slug IS NOT NULL;

-- Step 4: Handle empty slugs (fallback to portfolio id prefix)
UPDATE portfolios
SET slug = 'portfolio-' || substr(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Add comment for documentation
COMMENT ON COLUMN portfolios.slug IS 'URL-friendly identifier for portfolio, unique per user';
