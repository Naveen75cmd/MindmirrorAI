import { useState } from 'react';
import { User, Flame, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSection() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [voicePreference, setVoicePreference] = useState(profile?.voice_preference || 'empathetic');

  if (!user || !profile) return null;

  const handleSaveVoice = async () => {
    await updateProfile({ voice_preference: voicePreference });
    setIsEditing(false);
  };

  const avatarBgColors = {
    student: 'bg-blue-500',
    professional: 'bg-green-500',
    educator: 'bg-purple-500',
    other: 'bg-gray-500',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${avatarBgColors[profile.user_type]} flex items-center justify-center text-white text-2xl font-bold`}>
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
            <p className="text-sm text-gray-600 capitalize">{profile.user_type}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="text-gray-600 hover:text-red-600 transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame size={32} />
            <div>
              <p className="text-sm opacity-90">Wellness Streak</p>
              <p className="text-3xl font-bold">{profile.wellness_streak} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Settings size={18} />
            Voice Preference
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <select
              value={voicePreference}
              onChange={(e) => setVoicePreference(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="empathetic">Empathetic</option>
              <option value="calm">Calm</option>
              <option value="energetic">Energetic</option>
              <option value="wise">Wise</option>
            </select>
            <button
              onClick={handleSaveVoice}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <p className="text-gray-600 capitalize">{profile.voice_preference}</p>
        )}
      </div>
    </div>
  );
}
