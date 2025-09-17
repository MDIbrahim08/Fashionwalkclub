/*
  # Complete Schema Fix for Fashion Walk Club Management App

  1. New Tables
    - Ensures all required tables exist with proper structure
    - `members` table with all required columns
    - `events` table with proper timestamp handling
    - `expenses` table with correct structure
    - `meetings` table for meeting management
    - `gallery` table for image management
    - `notifications` table for system notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (as per existing setup)

  3. Functions
    - Update timestamp trigger function
    - Notification trigger functions for events and meetings
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone_number text,
  academic_year text,
  department text,
  role text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns to members if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'phone_number') THEN
    ALTER TABLE members ADD COLUMN phone_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'academic_year') THEN
    ALTER TABLE members ADD COLUMN academic_year text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'department') THEN
    ALTER TABLE members ADD COLUMN department text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'role') THEN
    ALTER TABLE members ADD COLUMN role text;
  END IF;
END $$;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date timestamptz NOT NULL,
  time time,
  location text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fix events table structure
DO $$
BEGIN
  -- Rename name to title if name exists and title doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'name') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'title') THEN
    ALTER TABLE events RENAME COLUMN name TO title;
  END IF;
  
  -- Add title if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'title') THEN
    ALTER TABLE events ADD COLUMN title text NOT NULL DEFAULT 'Untitled Event';
    ALTER TABLE events ALTER COLUMN title DROP DEFAULT;
  END IF;
  
  -- Add description if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'description') THEN
    ALTER TABLE events ADD COLUMN description text;
  END IF;
  
  -- Convert date column to timestamptz if it's not already
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date' AND data_type != 'timestamp with time zone') THEN
    ALTER TABLE events ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
  END IF;
END $$;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Fix expenses table structure
DO $$
BEGIN
  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'item') THEN
    ALTER TABLE expenses ADD COLUMN item text NOT NULL DEFAULT 'Expense Item';
    ALTER TABLE expenses ALTER COLUMN item DROP DEFAULT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'amount') THEN
    ALTER TABLE expenses ADD COLUMN amount numeric NOT NULL DEFAULT 0;
    ALTER TABLE expenses ALTER COLUMN amount DROP DEFAULT;
  END IF;
  
  -- Convert date column to timestamptz if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'date' AND data_type != 'timestamp with time zone') THEN
    ALTER TABLE expenses ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
  END IF;
END $$;

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time time,
  location text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching existing setup)
DO $$
BEGIN
  -- Members policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Allow all operations on members') THEN
    CREATE POLICY "Allow all operations on members" ON members FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  
  -- Events policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Allow all operations on events') THEN
    CREATE POLICY "Allow all operations on events" ON events FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  
  -- Expenses policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Allow all operations on expenses') THEN
    CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  
  -- Meetings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Allow all operations on meetings') THEN
    CREATE POLICY "Allow all operations on meetings" ON meetings FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  
  -- Gallery policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gallery' AND policyname = 'Allow all operations on gallery') THEN
    CREATE POLICY "Allow all operations on gallery" ON gallery FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  
  -- Notifications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow all operations on notifications') THEN
    CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace notification functions
CREATE OR REPLACE FUNCTION notify_event_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (title, message, type)
  VALUES (
    'New Event Created',
    'Event "' || NEW.title || '" has been scheduled for ' || NEW.date::text,
    'event'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION notify_meeting_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (title, message, type)
  VALUES (
    'New Meeting Scheduled',
    'Meeting "' || NEW.title || '" has been scheduled for ' || NEW.date::text,
    'meeting'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS event_created_notification ON events;
CREATE TRIGGER event_created_notification
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_created();

DROP TRIGGER IF EXISTS meeting_created_notification ON meetings;
CREATE TRIGGER meeting_created_notification
  AFTER INSERT ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION notify_meeting_created();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';