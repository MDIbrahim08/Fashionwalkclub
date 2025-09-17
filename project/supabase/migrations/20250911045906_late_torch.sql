/*
  # Fashion Walk Club Database Schema

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `role` (text)
      - `academic_year` (text)
      - `department` (text)
      - `email` (text, required, unique)
      - `phone` (text)
      - `created_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `event_date` (timestamp, required)
      - `created_at` (timestamp)
    
    - `meetings`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `agenda` (text)
      - `meeting_date` (timestamp, required)
      - `created_at` (timestamp)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `item` (text, required)
      - `amount` (numeric, required)
      - `category` (text, required)
      - `expense_date` (date, required)
      - `created_at` (timestamp)
    
    - `gallery`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_url` (text, required)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `message` (text, required)
      - `type` (text, required)
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access (admin only)
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text,
  academic_year text,
  department text,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  agenda text,
  meeting_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  expense_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now, since we're using admin authentication)
CREATE POLICY "Allow all operations on members" ON members FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on meetings" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations on gallery" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true);