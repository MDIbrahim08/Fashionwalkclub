/*
  # Add missing columns to members table

  1. New Columns
    - `phone_number` (text, nullable) - Member's phone number
    - `academic_year` (text, nullable) - Member's academic year
    - `department` (text, nullable) - Member's department

  2. Notes
    - The `role` column already exists in the schema
    - All new columns are nullable to allow existing records to remain valid
    - Uses IF NOT EXISTS checks to prevent errors if columns already exist
*/

-- Add phone_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE members ADD COLUMN phone_number text;
  END IF;
END $$;

-- Add academic_year column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'academic_year'
  ) THEN
    ALTER TABLE members ADD COLUMN academic_year text;
  END IF;
END $$;

-- Add department column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'department'
  ) THEN
    ALTER TABLE members ADD COLUMN department text;
  END IF;
END $$;