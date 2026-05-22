# 🍃 MindArc — Mental Health & Wellness Suite

> **A premium, production-grade mobile wellness application** built with React Native (Expo) and a Python (FastAPI) AI backend. MindArc helps users track mental health, journal thoughts, practice mindfulness, monitor physical activity, and access emergency mental health support — all in English and Kannada.

---

## 📂 Project Architecture

```
MentalHealthApp/
├── myapp/                        # 📱 Mobile Frontend (React Native + Expo SDK 54)
│   ├── assets/
│   │   └── images/               # App icons, splash, and local audio files (.mp3)
│   ├── src/
│   │   ├── components/           # Reusable UI (ForestBackground, SettingsModal, Cards)
│   │   ├── data/                 # Static data (educational modules, yoga content)
│   │   ├── hooks/                # Custom React hooks (useTheme, usePedometer)
│   │   ├── i18n/                 # Bilingual translations (en.ts + kn.ts — Kannada)
│   │   ├── navigation/           # Stack + Bottom Tab navigators
│   │   ├── screens/              # All screen modules (Home, Auth, Tracker, Learn, Relax…)
│   │   ├── store/                # Global state (Zustand — mood, audio, activity, auth)
│   │   └── utils/                # Firebase, sync engine, notifications, audio controller
│   ├── .env.example              # ← Copy to .env and fill in your keys
│   ├── app.json                  # Expo config (EAS project ID, Android package, plugins)
│   └── tsconfig.json             # TypeScript compiler settings
│
└── backend/                      # 🤖 AI Backend (Python 3.12 + FastAPI + LangChain)
    ├── main.py                   # FastAPI server — Myth Buster & Lifestyle Coach endpoints
    ├── requirements.txt          # Python dependencies
    ├── .env.example              # ← Copy to .env and fill in your Gemini API keys
    └── README.md                 # Backend-specific notes
```

---

## ✨ Features

### 📱 Mobile App (`myapp/`)

| Feature | Description |
|---|---|
| **Daily Check-In & Mood Tracker** | Log mood (1–5), symptoms, sleep hours & quality, appetite level |
| **Mood History** | Interactive chart showing emotional trends over time |
| **CBT Thought Diary** | Structured Cognitive Behavioral Therapy reframing journal |
| **Nature Sounds** | 7 premium loopable soundscapes (Rain, Forest, Ocean, Stream, Thunder, Wind, Frogs) with floating playback bar |
| **Box Breathing** | Guided 4-4-4-4 paced breathing with animated visuals |
| **Yoga & Movement** | Curated Morning, Stretch & Sleep yoga programs via YouTube players |
| **Pedometer** | Real-time step counter using hardware accelerometer against user-set daily goals |
| **Interactive Learn Modules** | 6 CBT educational modules with animated simulations (Stress Meter, Ripple Effect, Myth Buster, Breathing Box, Bubble Pop) |
| **Crisis Support Hub** | Direct-call buttons for 5 Indian helplines (e112, Tele-MANAS, KIRAN, Vandrevala, AASRA) + personal therapist & custom contact |
| **Personal Dashboard** | Cloud-synced profile — name, bio, age, gender, step goal, water goal, focus area, workout preference |
| **Settings** | Inline profile editing, Dark/Light theme toggle, English/Kannada language switcher |
| **Streak System** | Daily check-in streak counter with broken-streak banner |
| **Bilingual (i18n)** | Full English & Kannada support across all screens, forms, and navigation |

### 🤖 AI Backend (`backend/`)

| Endpoint | Description |
|---|---|
| `POST /api/v1/myth-check` | AI Myth Buster — validates mental health myths via Google Gemini |
| `POST /api/v1/lifestyle-plan` | Lifestyle Wellness Coach — generates personalized Better Living Summary |
| `GET /health` | Health check ping |

### ☁️ Cloud & Auth

- **Firebase Authentication** — Email/Password + Google Sign-In
- **Firestore** — User profiles, mood tracker logs, thought diary entries
- **Zustand + AsyncStorage** — Offline-first with automatic Firestore sync on focus
- **Expo Notifications** — Daily check-in reminders & 2-hour wellness prompts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile Framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation 7 (Stack + Bottom Tabs) |
| State Management | Zustand + AsyncStorage persistence |
| Auth & Database | Firebase v11 (Auth + Firestore) |
| AI Backend | Python 3.12 + FastAPI + LangChain + Google Gemini 2.5 Flash |
| Audio | expo-av |
| Animations | react-native-reanimated + react-native-svg |
| Localization | react-i18next (en + kn) |
| Build | EAS Build (Expo Application Services) |

---

## 🚀 Setup & Running Locally

### Prerequisites
- **Node.js** v18 or later
- **Python** 3.11 or 3.12
- **uv** Python package manager (`pip install uv` or see [uv docs](https://docs.astral.sh/uv/))
- A **Firebase project** with Authentication and Firestore enabled
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repo

```bash
git clone https://github.com/shrinidhianchan/MentalHealthApp.git
cd MentalHealthApp
```

---

### 2. Run the Backend

```bash
cd backend
```

Copy and fill in the environment variables:
```bash
cp .env.example .env
# Edit .env with your Gemini API keys
```

Start the FastAPI server:
```bash
uv run python main.py
```
> Server starts at `http://localhost:8000`. Access the API docs at `http://localhost:8000/docs`.

---

### 3. Run the Mobile App

```bash
cd myapp
npm install
```

Copy and fill in the environment variables:
```bash
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_URL to your machine's local IP (e.g. http://192.168.1.100:8000)
```

Place your Firebase credentials file:
```
myapp/google-services.json   ← Android (download from Firebase Console)
```

Start the Expo dev server:
```bash
npx expo start
```
> Scan the QR code with **Expo Go** on your phone. Both devices must be on the same Wi-Fi network.

---

## 📦 Build an APK (Android)

MindArc uses **EAS Build** (Expo Application Services) for cloud-based APK generation — no Android SDK required locally.

### One-time setup
```bash
npm install -g eas-cli
eas login
```

### Build a preview APK (installable `.apk`)
```bash
cd myapp
eas build --platform android --profile preview
```

> The build runs on Expo's servers (~5–15 minutes). A download link for the `.apk` is provided on completion.

---

## 🔒 Security & Secrets

> ⚠️ **Never commit `.env` files or `google-services.json` to version control.**

The `.gitignore` at the project root automatically excludes:
- `myapp/.env` and `backend/.env` (your real API keys)
- `google-services.json` (Firebase Android credentials)
- `GoogleService-Info.plist` (Firebase iOS credentials)
- Python virtual environments (`.venv/`, `venv/`)
- Node modules, build artifacts, and IDE configs

Use the `.env.example` files as templates for onboarding new contributors.

---

## 📁 Key Environment Variables

### `myapp/.env`

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend URL (local IP or Render deployment) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth Web Client ID for Sign-In |
| `GOOGLE_API_KEY` | Gemini key (loaded by backend on Expo env export) |
| `GOOGLE_API_KEY_2` | Second Gemini key for Lifestyle Coach |

### `backend/.env`

| Variable | Description |
|---|---|
| `GOOGLE_API_KEY` | Gemini API key → Myth Buster endpoint |
| `GOOGLE_API_KEY_2` | Gemini API key → Lifestyle Coach endpoint |
| `EXPO_PUBLIC_API_URL` | Backend's own public URL (for CORS reference) |

---

## 🌐 Languages Supported

| Language | Code | Coverage |
|---|---|---|
| English | `en` | 100% |
| Kannada (ಕನ್ನಡ) | `kn` | 100% |

---

## 📋 Changelog Highlights

- **v1.2.0** — Full Kannada localization across all educational modules and simulations
- **v1.1.5** — Floating Nature Sounds playback bar above navigation
- **v1.1.0** — Crisis Hub with 5 Indian helplines + personal therapist/contact slots
- **v1.0.5** — Appetite tracking in Daily Check-In + library guidelines
- **v1.0.0** — Initial release with Mood Tracker, CBT Diary, Breathing, Nature Sounds, Yoga, Learn Modules

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with 🍃 care for mental wellness</p>
