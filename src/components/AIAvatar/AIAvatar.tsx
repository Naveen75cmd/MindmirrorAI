import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AIAvatarProps {
  emotion?: string;
  message?: string;
  voiceType?: 'empathetic' | 'calm' | 'energetic' | 'wise';
  moodEntryId?: string;
}

export default function AIAvatar({ emotion = 'neutral', message, voiceType = 'empathetic', moodEntryId }: AIAvatarProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { user, profile } = useAuth();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const avatarColors: Record<string, string> = {
    happy: 'from-yellow-400 to-orange-400',
    sad: 'from-blue-400 to-indigo-500',
    anxious: 'from-orange-400 to-red-400',
    neutral: 'from-gray-300 to-gray-400',
    angry: 'from-red-500 to-pink-500',
    calm: 'from-teal-400 to-green-400',
  };

  const voiceSettings = {
    empathetic: { rate: 0.9, pitch: 1.1 },
    calm: { rate: 0.8, pitch: 0.9 },
    energetic: { rate: 1.1, pitch: 1.2 },
    wise: { rate: 0.85, pitch: 0.95 },
  };

  const getVoiceMessage = () => {
    if (message) return message;

    const greetings = [
      "Hello! I'm here to support you on your wellness journey.",
      "Hi there! Let me know how you're feeling today.",
      "Welcome back! Ready to check in with your emotions?",
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const speak = async (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    if (isMuted) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = voiceSettings[voiceType] || voiceSettings.empathetic;

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    if (user && moodEntryId) {
      await supabase.from('ai_voice_logs').insert({
        user_id: user.id,
        mood_entry_id: moodEntryId,
        voice_text: text,
        voice_type: voiceType,
      });
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (message && !isMuted) {
      const timer = setTimeout(() => {
        speak(message);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${avatarColors[emotion] || avatarColors.neutral} shadow-lg flex items-center justify-center transition-all duration-500 ${
            isSpeaking ? 'scale-110 shadow-2xl' : 'scale-100'
          }`}
        >
          <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
        </div>

        {isSpeaking && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          </div>
        )}

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX size={20} className="text-gray-600" />
          ) : (
            <Volume2 size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">MindMirror AI</h3>
        <p className="text-sm text-gray-600">
          {profile?.voice_preference === 'empathetic' && 'Empathetic Voice'}
          {profile?.voice_preference === 'calm' && 'Calm Voice'}
          {profile?.voice_preference === 'energetic' && 'Energetic Voice'}
          {profile?.voice_preference === 'wise' && 'Wise Voice'}
          {!profile && 'Empathetic Voice'}
        </p>
      </div>

      {message && (
        <div className="flex gap-2">
          <button
            onClick={() => speak(getVoiceMessage())}
            disabled={isSpeaking}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isSpeaking ? 'Speaking...' : 'Replay'}
          </button>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
}
