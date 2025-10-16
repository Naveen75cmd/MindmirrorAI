import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader } from 'lucide-react';

interface MoodInputProps {
  onSubmit: (text: string, source: 'text' | 'voice') => void;
  loading: boolean;
}

export default function MoodInput({ onSubmit, loading }: MoodInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!voiceSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !loading) {
      onSubmit(text.trim(), isListening ? 'voice' : 'text');
      setText('');
    }
  };

  const examples = [
    "I'm feeling anxious about my exam tomorrow...",
    "Just got an internship offer!",
    "Can't seem to focus today",
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what you're feeling..."
            className="w-full px-4 py-3 pr-24 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
            rows={4}
            maxLength={280}
            disabled={loading || isListening}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                disabled={loading}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Analyze mood"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{text.length} / 280</span>
          {isListening && (
            <span className="text-red-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              Listening...
            </span>
          )}
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setText(example)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
