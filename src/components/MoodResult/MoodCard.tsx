import { Heart, Target, TrendingUp } from 'lucide-react';
import { MoodEntry } from '../../lib/supabase';

interface MoodCardProps {
  result: MoodEntry;
  onActionClick?: () => void;
}

export default function MoodCard({ result, onActionClick }: MoodCardProps) {
  const emotionIcons: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    neutral: '😐',
    angry: '😠',
    calm: '😌',
  };

  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div
      className="rounded-2xl p-6 shadow-xl transition-all duration-500 transform hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${result.color_theme}22 0%, ${result.color_theme}44 100%)`,
        borderLeft: `4px solid ${result.color_theme}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{emotionIcons[result.emotion]}</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 capitalize">{result.emotion}</h3>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp size={16} className="text-gray-600" />
              <span className="text-sm text-gray-600">{confidencePercent}% confidence</span>
            </div>
          </div>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: `${result.color_theme}33`,
            color: result.color_theme,
          }}
        >
          #{result.tag}
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <Heart size={20} className="text-gray-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Empathetic Response</h4>
              <p className="text-gray-700">{result.ai_message}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <Target size={20} className="text-gray-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Recommended Action</h4>
              <p className="text-gray-700 mb-3">{result.ai_action}</p>
              <button
                onClick={onActionClick}
                className="w-full py-2 rounded-lg font-medium transition-all hover:shadow-lg"
                style={{
                  backgroundColor: result.color_theme,
                  color: 'white',
                }}
              >
                Start Action
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        {new Date(result.created_at).toLocaleString()}
      </div>
    </div>
  );
}
