import { useEffect, useState } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import { MoodEntry } from '../../lib/supabase';

interface MoodHistoryChartProps {
  entries: MoodEntry[];
}

export default function MoodHistoryChart({ entries }: MoodHistoryChartProps) {
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    });
    setEmotionCounts(counts);
  }, [entries]);

  const emotionColors: Record<string, string> = {
    happy: '#7AD1FF',
    sad: '#6C7BFF',
    anxious: '#FFB86B',
    neutral: '#E6EEF7',
    angry: '#FF6B6B',
    calm: '#84DCC6',
  };

  const emotionIcons: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    neutral: '😐',
    angry: '😠',
    calm: '😌',
  };

  const maxCount = Math.max(...Object.values(emotionCounts), 1);

  const recentEntries = entries.slice(0, 7).reverse();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={24} />
          Mood History
        </h3>
        <span className="text-sm text-gray-600">{entries.length} total entries</span>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700">Emotion Distribution</h4>
        <div className="space-y-2">
          {Object.entries(emotionCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([emotion, count]) => (
              <div key={emotion} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{emotionIcons[emotion]}</span>
                    <span className="capitalize font-medium">{emotion}</span>
                  </span>
                  <span className="text-gray-600">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: emotionColors[emotion],
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {recentEntries.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <Calendar size={18} />
            Recent Check-ins
          </h4>
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emotionIcons[entry.emotion]}</span>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{entry.emotion}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${emotionColors[entry.emotion]}33`,
                    color: emotionColors[entry.emotion],
                  }}
                >
                  {Math.round(entry.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No mood entries yet.</p>
          <p className="text-sm">Start by analyzing your first mood!</p>
        </div>
      )}
    </div>
  );
}
