# Database Migrations

This folder contains SQL migration files for the Supabase database. These migrations should be run manually in the Supabase Dashboard SQL Editor.

## How to Use

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of a migration file
4. Paste into the SQL Editor
5. Run the query

## Migration Files

Run migrations in numerical order:

1. `001_initial_schema.sql` - Creates accounts table and user types
2. Additional migrations will be added as needed

## Important Notes

- This folder is in `.gitignore` for security
- Never commit sensitive data or credentials
- Always test migrations in a development environment first
- Keep migrations idempotent when possible (use `IF NOT EXISTS`, etc.)
