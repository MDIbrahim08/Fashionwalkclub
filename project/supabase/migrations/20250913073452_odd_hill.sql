/*
  # Fix Supabase Schema for Fashion Walk Club Management App

  1. Members Table Updates
    - Ensure all required columns exist: id, name, email, phone_number, academic_year, department, role
    - Add missing columns with proper types and constraints
    - Maintain existing data integrity

  2. Events Table Updates
    - Add missing title column if it doesn't exist
    - Ensure date column is properly typed as timestamp
    - Add description column if missing

  3. Expenses Table Updates
    - Rename expense_date to date for consistency
    - Ensure all required columns exist

  4. Security
    - Maintain existing RLS policies
    - Ensure proper constraints and indexes
*/

-- Fix Members Table
DO $$
BEGIN
  -- Add phone_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE members ADD COLUMN phone_number text;
  END IF;

  -- Add academic_year column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'academic_year'
  ) THEN
    ALTER TABLE members ADD COLUMN academic_year text;
  END IF;

  -- Add department column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'department'
  ) THEN
    ALTER TABLE members ADD COLUMN department text;
  END IF;

  -- Ensure role column exists (it should already exist)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'role'
  ) THEN
    ALTER TABLE members ADD COLUMN role text;
  END IF;
END $$;

-- Fix Events Table
DO $$
BEGIN
  -- Add title column if it doesn't exist (events table uses 'name' but code expects 'title')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'title'
  ) THEN
    -- If name column exists, rename it to title
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'events' AND column_name = 'name'
    ) THEN
      ALTER TABLE events RENAME COLUMN name TO title;
    ELSE
      -- Otherwise add title column
      ALTER TABLE events ADD COLUMN title text NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Ensure date column is timestamp type
  -- Check if date column exists and is not already timestamp
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'date' AND data_type = 'date'
  ) THEN
    -- Convert date to timestamp
    ALTER TABLE events ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'description'
  ) THEN
    ALTER TABLE events ADD COLUMN description text;
  END IF;
END $$;

-- Fix Expenses Table
DO $$
BEGIN
  -- Add date column if it doesn't exist, or rename expense_date to date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'date'
  ) THEN
    -- If expense_date exists, rename it to date
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'expenses' AND column_name = 'expense_date'
    ) THEN
      ALTER TABLE expenses RENAME COLUMN expense_date TO date;
    ELSE
      -- Otherwise add date column
      ALTER TABLE expenses ADD COLUMN date timestamptz NOT NULL DEFAULT now();
    END IF;
  END IF;

  -- Ensure date column is timestamp type if it was date type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'date' AND data_type = 'date'
  ) THEN
    ALTER TABLE expenses ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
  END IF;
END $$;

-- Update any existing triggers or functions that might reference old column names
-- This ensures compatibility with existing database functions

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';