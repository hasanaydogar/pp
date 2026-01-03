# Supabase Migrations

This directory contains database migration files for the portfolio tracker schema.

## Migration File Naming Convention

Migration files should follow this pattern:
```
YYYYMMDDHHMMSS_description.sql
```

Example: `20251130110000_create_portfolio_schema.sql`

## Running Migrations

### Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

3. Run migrations:
```bash
supabase db push
```

### Using Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste migration SQL
3. Run the migration

## Migration Order

Migrations are executed in chronological order based on the timestamp prefix. Ensure migrations are numbered sequentially.

## Rollback

To rollback a migration, create a new migration file that reverses the changes:
```
YYYYMMDDHHMMSS_rollback_description.sql
```

