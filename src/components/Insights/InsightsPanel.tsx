import { Brain, Lightbulb, TrendingUp, Award } from 'lucide-react';
import { MoodEntry } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface InsightsPanelProps {
  entries: MoodEntry[];
}

export default function InsightsPanel({ entries }: InsightsPanelProps) {
  const { profile } = useAuth();

  const getMostCommonEmotion = () => {
    if (entries.length === 0) return null;
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
  };

  const getEmotionTrend = () => {
    if (entries.length < 3) return null;
    const recent = entries.slice(0, 3);
    const positiveEmotions = ['happy', 'calm'];
    const negativeEmotions = ['sad', 'anxious', 'angry'];

    const positiveCount = recent.filter((e) => positiveEmotions.includes(e.emotion)).length;
    const negativeCount = recent.filter((e) => negativeEmotions.includes(e.emotion)).length;

    if (positiveCount > negativeCount) return 'improving';
    if (negativeCount > positiveCount) return 'declining';
    return 'stable';
  };

  const getTimePattern = () => {
    if (entries.length < 5) return null;
    const hourCounts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    entries.forEach((entry) => {
      const hour = new Date(entry.created_at).getHours();
      if (hour >= 6 && hour < 12) hourCounts.morning++;
      else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
      else if (hour >= 17 && hour < 21) hourCounts.evening++;
      else hourCounts.night++;
    });

    return Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
  };

  const mostCommon = getMostCommonEmotion();
  const trend = getEmotionTrend();
  const timePattern = getTimePattern();

  const insights = [];

  if (mostCommon) {
    insights.push({
      icon: Brain,
      title: 'Dominant Emotion',
      description: `You've been feeling ${mostCommon[0]} most often (${mostCommon[1]} times).`,
      color: 'from-purple-500 to-pink-500',
    });
  }

  if (trend) {
    const trendMessages = {
      improving: 'Your mood has been trending positively recently!',
      declining: 'You might want to focus on self-care activities.',
      stable: 'Your emotional state has been consistent.',
    };
    insights.push({
      icon: TrendingUp,
      title: 'Recent Trend',
      description: trendMessages[trend],
      color: trend === 'improving' ? 'from-green-500 to-teal-500' : trend === 'declining' ? 'from-orange-500 to-red-500' : 'from-blue-500 to-indigo-500',
    });
  }

  if (timePattern) {
    insights.push({
      icon: Lightbulb,
      title: 'Time Pattern',
      description: `You check in most during the ${timePattern[0]}.`,
      color: 'from-yellow-500 to-orange-500',
    });
  }

  if (profile && profile.wellness_streak >= 3) {
    insights.push({
      icon: Award,
      title: 'Consistency Achievement',
      description: `Great job! You've maintained a ${profile.wellness_streak}-day wellness streak!`,
      color: 'from-pink-500 to-rose-500',
    });
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain size={24} />
          Insights
        </h3>
        <p className="text-gray-600">
          Keep tracking your moods to unlock personalized insights and patterns!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Brain size={24} />
        Your Insights
      </h3>

      <div className="grid gap-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-r ${insight.color} rounded-xl p-4 text-white`}
          >
            <div className="flex items-start gap-3">
              <insight.icon size={24} className="flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">{insight.title}</h4>
                <p className="text-sm opacity-90">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Pro Tip:</span> Regular mood tracking helps identify
          patterns and improve emotional awareness. Try to check in daily for best results!
        </p>
      </div>
    </div>
  );
}
