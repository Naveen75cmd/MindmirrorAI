/*
  # MindMirror Database Schema

  ## Overview
  Creates the complete database structure for MindMirror app with user authentication,
  mood tracking, and profile management.

  ## New Tables

  1. **user_profiles**
     - `id` (uuid, references auth.users)
     - `username` (text, unique)
     - `avatar_url` (text, nullable)
     - `user_type` (text) - student, professional, educator, other
     - `voice_preference` (text) - preferred AI voice
     - `wellness_streak` (integer) - consecutive days of check-ins
     - `last_checkin` (date)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **mood_entries**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `input_text` (text) - user's mood text
     - `emotion` (text) - detected emotion
     - `confidence` (numeric)
     - `ai_message` (text) - empathetic response
     - `ai_action` (text) - recommended action
     - `color_theme` (text) - hex color
     - `tag` (text) - emotion tag
     - `source` (text) - text or voice
     - `created_at` (timestamptz)

  3. **ai_voice_logs**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `mood_entry_id` (uuid, references mood_entries)
     - `voice_text` (text) - what the AI said
     - `voice_type` (text) - voice character used
     - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  user_type text NOT NULL DEFAULT 'student' CHECK (user_type IN ('student', 'professional', 'educator', 'other')),
  voice_preference text DEFAULT 'empathetic' CHECK (voice_preference IN ('empathetic', 'calm', 'energetic', 'wise')),
  wellness_streak integer DEFAULT 0,
  last_checkin date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  input_text text NOT NULL,
  emotion text NOT NULL CHECK (emotion IN ('happy', 'sad', 'anxious', 'neutral', 'angry', 'calm')),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  ai_message text NOT NULL,
  ai_action text NOT NULL,
  color_theme text NOT NULL,
  tag text NOT NULL,
  source text DEFAULT 'text' CHECK (source IN ('text', 'voice')),
  created_at timestamptz DEFAULT now()
);

-- Create ai_voice_logs table
CREATE TABLE IF NOT EXISTS ai_voice_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mood_entry_id uuid REFERENCES mood_entries ON DELETE CASCADE,
  voice_text text NOT NULL,
  voice_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created ON mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_emotion ON mood_entries(emotion);
CREATE INDEX IF NOT EXISTS idx_ai_voice_logs_user ON ai_voice_logs(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for mood_entries
CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_voice_logs
CREATE POLICY "Users can view own voice logs"
  ON ai_voice_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice logs"
  ON ai_voice_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle wellness streak
CREATE OR REPLACE FUNCTION update_wellness_streak()
RETURNS TRIGGER AS $$
DECLARE
  profile_record RECORD;
  days_since_last integer;
BEGIN
  SELECT * INTO profile_record FROM user_profiles WHERE id = NEW.user_id;
  
  IF profile_record.last_checkin IS NULL THEN
    UPDATE user_profiles SET wellness_streak = 1, last_checkin = CURRENT_DATE WHERE id = NEW.user_id;
  ELSE
    days_since_last := CURRENT_DATE - profile_record.last_checkin;
    
    IF days_since_last = 1 THEN
      UPDATE user_profiles SET wellness_streak = profile_record.wellness_streak + 1, last_checkin = CURRENT_DATE WHERE id = NEW.user_id;
    ELSIF days_since_last > 1 THEN
      UPDATE user_profiles SET wellness_streak = 1, last_checkin = CURRENT_DATE WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wellness streak on new mood entry
CREATE TRIGGER update_streak_on_mood_entry
  AFTER INSERT ON mood_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_wellness_streak();