# MindMirror - AI-Powered Mood Sensing & Wellness Companion

**Feel Heard, Fast.**

MindMirror is an empathetic web application that senses your mood from text or voice input and provides personalized emotional support through AI-powered analysis, voice-enabled recommendations, and actionable wellness guidance.

## Features

### Core Features
- **AI Mood Analysis**: Advanced emotion detection using GPT-4 with deterministic fallback classifier
- **Voice Input & Output**: Speak your feelings and receive spoken guidance from an AI avatar
- **Real-time Emotion Detection**: Analyzes text to detect emotions (happy, sad, anxious, calm, angry, neutral)
- **Empathetic Responses**: Contextual, supportive messages tailored to your emotional state
- **Actionable Micro-Exercises**: Quick wellness activities based on detected mood

### Unique Features
- **AI Voice Avatar**: Customizable AI companion that speaks recommendations with 4 voice personalities
- **Wellness Streak Tracking**: Gamified daily check-in system to build healthy habits
- **Pattern Recognition**: Smart insights that identify emotional trends and time-based patterns
- **Dominant Emotion Analysis**: Understand your most frequent emotional states
- **Visual Mood Themes**: Dynamic color themes that adapt to your current emotion

### Authentication & Security
- Secure email/password authentication via Supabase
- Row-level security (RLS) policies protecting all user data
- User profiles with customizable avatars and preferences
- Session management with automatic authentication state handling

### Data & Insights
- **Mood History**: Complete timeline of emotional check-ins with charts
- **Emotion Distribution**: Visual breakdown of your emotional patterns
- **Trend Analysis**: Tracks whether mood is improving, stable, or declining
- **Time Pattern Detection**: Identifies when you typically check in (morning, afternoon, evening, night)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for beautiful, responsive styling
- **Lucide React** for clean, modern icons
- **Web Speech API** for voice input and synthesis

### Backend
- **Supabase** for authentication and PostgreSQL database
- **Edge Functions** (Deno) for serverless mood analysis API
- **OpenAI GPT-4o-mini** for intelligent emotion detection
- **Row Level Security** for data protection

### Database Schema
- `user_profiles`: User information, preferences, and wellness streaks
- `mood_entries`: Complete mood analysis history
- `ai_voice_logs`: Voice interaction tracking

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (database already provisioned)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mindmirror
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are pre-configured in `.env`:
```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Usage Guide

### Getting Started

1. **Sign Up**: Create an account with email and password
   - Choose your user type (student, professional, educator, other)
   - Pick a unique username

2. **First Check-In**:
   - Type or speak how you're feeling (max 280 characters)
   - Click "Analyze" or use the microphone button for voice input
   - Wait for AI analysis

3. **View Results**:
   - See detected emotion with confidence score
   - Read empathetic AI response
   - Get actionable wellness exercise
   - Listen to AI avatar speak your guidance

4. **Track Progress**:
   - View mood history with charts
   - Monitor wellness streak
   - Discover emotional patterns and insights

### Demo Script (30-45 seconds)

**Opening**: "Hi, I'm [Name]. MindMirror is an AI-powered wellness companion that senses mood from text or voice and provides empathetic support with actionable guidance."

**Demo 1 - Anxious Mood**:
- Type: "I can't sleep, exam tomorrow"
- Show loading animation
- UI theme changes to amber
- AI avatar speaks breathing exercise recommendation
- Click "Start Action" to begin guided activity

**Demo 2 - Happy Mood**:
- Type: "I got an internship!"
- UI becomes bright blue/green
- Shows celebratory message and gratitude exercise
- Demonstrate mood history chart updating

**Demo 3 - Insights**:
- Show profile with wellness streak
- Display pattern recognition insights
- Highlight emotion distribution chart

**Closing**: "MindMirror combines AI emotion detection, voice interaction, and smart insights to support mental wellness. It's designed for students and professionals who want quick, empathetic check-ins. Remember, it's supportive guidance, not clinical advice."

## Unique Competitive Features

1. **Voice-Enabled AI Avatar**
   - Not just text responses - AI speaks to you
   - 4 personality types: empathetic, calm, energetic, wise
   - Real-time speech synthesis with customizable voice settings

2. **Wellness Gamification**
   - Streak tracking encourages daily emotional check-ins
   - Visual progress indicators with fire icon
   - Achievement recognition for consistency

3. **Intelligent Pattern Recognition**
   - Detects dominant emotions over time
   - Identifies mood trends (improving/declining/stable)
   - Discovers time-of-day patterns for check-ins
   - Proactive insights based on behavioral data

4. **Dual Input Methods**
   - Type your feelings for privacy
   - Speak naturally with Web Speech API
   - Real-time voice transcription

5. **Dynamic Theming**
   - UI colors adapt to detected emotion
   - Smooth gradient transitions
   - Emotion-specific visual feedback

## Privacy & Ethics

### Data Safety
- All user data is encrypted and protected by RLS policies
- Users can only access their own mood entries
- No raw text is logged in analytics without consent
- Voice logs are optional and user-controlled

### Ethical Use
- **Not a Medical Tool**: MindMirror provides supportive suggestions only
- **No Diagnosis**: Does not claim to diagnose mental health conditions
- **Crisis Resources**: Clear disclaimer directing users in crisis to professional help
- **Transparency**: Users understand when AI is providing responses

## API Documentation

### Analyze Endpoint

**URL**: `POST /functions/v1/analyze`

**Request Body**:
```json
{
  "text": "I'm feeling anxious about my exam",
  "source": "text" | "voice"
}
```

**Response**:
```json
{
  "emotion": "anxious",
  "confidence": 0.92,
  "message": "It's normal to feel anxious before an exam. Try a short breathing exercise.",
  "action": "4-4-6 breathing for 2 minutes",
  "color": "#FFB86B",
  "tag": "exam-anxiety"
}
```

**Features**:
- OpenAI GPT-4o-mini integration with temperature 0.0 for consistency
- Deterministic fallback classifier when API unavailable
- Input validation (max 500 characters)
- Strict JSON schema validation

## Development

### Project Structure
```
mindmirror/
├── src/
│   ├── components/
│   │   ├── Auth/              # Login and signup modals
│   │   ├── AIAvatar/          # Voice-enabled AI companion
│   │   ├── MoodInput/         # Text and voice input
│   │   ├── MoodResult/        # Emotion analysis display
│   │   ├── MoodHistory/       # Charts and history
│   │   ├── Profile/           # User profile and settings
│   │   └── Insights/          # Pattern recognition
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication state
│   ├── lib/
│   │   └── supabase.ts        # Database client
│   └── App.tsx                # Main application
├── supabase/
│   └── functions/
│       └── analyze/           # Mood analysis API
└── README.md
```

### Running Tests
```bash
npm run lint        # Check code quality
npm run typecheck   # Verify TypeScript types
npm run build       # Production build
```

### Environment Variables

Required variables (pre-configured):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

Optional (for enhanced features):
- `OPENAI_API_KEY`: For production AI analysis (fallback works without)

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-detects Vite configuration
4. Deploy automatically

Environment variables are already configured in Supabase.

### Build Commands
```bash
npm run build       # Creates dist/ folder
npm run preview     # Preview production build
```

## Accessibility

- **WCAG AA Compliant**: High contrast ratios for all text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Focus Indicators**: Clear visual focus states
- **Responsive Design**: Works on mobile, tablet, and desktop

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Voice Features Require**:
- Web Speech API support (Chrome, Edge, Safari)
- Microphone permissions

## Contributing

This is a competition project. Contributions welcome after judging period.

## License

MIT License - See LICENSE file for details

## Disclaimer

**MindMirror is not a substitute for professional mental health care.**

If you are experiencing a mental health crisis, please contact:
- Emergency Services: 911 (US) or your local emergency number
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741 (US)

## Contact & Support

For questions or feedback about MindMirror, please open an issue on GitHub.

---

**Built with care for mental wellness** 🧠✨
