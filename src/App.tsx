import { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, MoodEntry } from './lib/supabase';
import LoginModal from './components/Auth/LoginModal';
import SignupModal from './components/Auth/SignupModal';
import ProfileSection from './components/Profile/ProfileSection';
import MoodInput from './components/MoodInput/MoodInput';
import MoodCard from './components/MoodResult/MoodCard';
import MoodHistoryChart from './components/MoodHistory/MoodHistoryChart';
import InsightsPanel from './components/Insights/InsightsPanel';
import AIAvatar from './components/AIAvatar/AIAvatar';

function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<MoodEntry | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [themeColor, setThemeColor] = useState('#84DCC6');

  useEffect(() => {
    if (user) {
      loadMoodHistory();
    }
  }, [user]);

  const loadMoodHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMoodHistory(data);
    }
  };

  const analyzeMood = async (text: string, source: 'text' | 'voice') => {
    if (!user) return;

    setAnalyzing(true);
    setCurrentResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, source }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();

      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          input_text: text,
          emotion: result.emotion,
          confidence: result.confidence,
          ai_message: result.message,
          ai_action: result.action,
          color_theme: result.color,
          tag: result.tag,
          source,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentResult(data);
      setThemeColor(result.color);
      await loadMoodHistory();
    } catch (error) {
      console.error('Error analyzing mood:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Brain size={48} className="animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Brain size={48} className="text-blue-600" />
                  <h1 className="text-5xl font-bold text-gray-900">MindMirror</h1>
                </div>
                <p className="text-xl text-gray-600 mb-2">Feel Heard, Fast.</p>
                <p className="text-gray-500">
                  AI-powered mood sensing with empathetic responses and actionable wellness guidance
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <Sparkles size={32} className="mx-auto mb-3 text-blue-600" />
                    <h3 className="font-bold text-gray-900 mb-2">AI-Powered Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Advanced emotion detection with voice support
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <Brain size={32} className="mx-auto mb-3 text-green-600" />
                    <h3 className="font-bold text-gray-900 mb-2">Smart Insights</h3>
                    <p className="text-sm text-gray-600">
                      Pattern recognition and personalized recommendations
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <div className="text-3xl mb-3">🎙️</div>
                    <h3 className="font-bold text-gray-900 mb-2">Voice Avatar</h3>
                    <p className="text-sm text-gray-600">
                      AI companion speaks your wellness guidance
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowSignup(true)}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl border-2 border-gray-200"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>
                  <strong>Note:</strong> MindMirror is not a medical tool. If you are in crisis,
                  contact local emergency services.
                </p>
              </div>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
        <SignupModal
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      </>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-1000"
      style={{
        background: `linear-gradient(135deg, ${themeColor}11 0%, ${themeColor}22 50%, ${themeColor}11 100%)`,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain size={40} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">MindMirror</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How are you feeling?</h2>
              <MoodInput onSubmit={analyzeMood} loading={analyzing} />
            </div>

            {analyzing && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center gap-4">
                  <Brain size={48} className="animate-pulse text-blue-600" />
                  <p className="text-gray-600 font-medium">Analyzing your mood...</p>
                </div>
              </div>
            )}

            {currentResult && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <AIAvatar
                    emotion={currentResult.emotion}
                    message={currentResult.ai_message}
                    voiceType={profile?.voice_preference}
                    moodEntryId={currentResult.id}
                  />
                </div>

                <MoodCard result={currentResult} />
              </div>
            )}

            {moodHistory.length > 0 && (
              <MoodHistoryChart entries={moodHistory} />
            )}
          </div>

          <div className="space-y-6">
            <ProfileSection />
            {moodHistory.length > 0 && <InsightsPanel entries={moodHistory} />}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-xl p-4">
          <p>
            <strong>Disclaimer:</strong> MindMirror provides supportive suggestions only. Not a
            substitute for professional mental health care.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
