import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  user_type: 'student' | 'professional' | 'educator' | 'other';
  voice_preference: 'empathetic' | 'calm' | 'energetic' | 'wise';
  wellness_streak: number;
  last_checkin: string | null;
  created_at: string;
  updated_at: string;
};

export type MoodEntry = {
  id: string;
  user_id: string;
  input_text: string;
  emotion: 'happy' | 'sad' | 'anxious' | 'neutral' | 'angry' | 'calm';
  confidence: number;
  ai_message: string;
  ai_action: string;
  color_theme: string;
  tag: string;
  source: 'text' | 'voice';
  created_at: string;
};

export type AIVoiceLog = {
  id: string;
  user_id: string;
  mood_entry_id: string | null;
  voice_text: string;
  voice_type: string;
  created_at: string;
};
