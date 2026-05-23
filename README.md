# 🍃 MindArc — Mental Health & Wellness Suite

<p align="center">
  <img src="myapp/assets/images/splash-icon.png" width="120" height="120" alt="MindArc Logo" style="border-radius: 28px;" />
</p>

<p align="center">
  <strong>A high-fidelity, production-grade mobile wellness application</strong> designed to support mental health, encourage daily mindfulness, and monitor physical activity. Built with React Native (Expo) and a robust Python (FastAPI) AI backend powered by LangChain and Google Gemini.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2054-4630EB?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Zustand-443e38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 📌 Table of Contents
1. [✨ Features Dashboard](#-features-dashboard)
2. [📂 Project Architecture](#-project-architecture)
3. [⚡ Core Architecture & Engineering Highlights](#-core-architecture--engineering-highlights)
4. [🛠️ Technical Specifications & Tech Stack](#-technical-specifications--tech-stack)
5. [🚀 Setup & Local Development Quickstart](#-setup--local-development-quickstart)
6. [📦 Cloud compilation: APK Generation](#-cloud-compilation-apk-generation)
7. [🔒 Security, Secrets & gitignore Rules](#-security-secrets--gitignore-rules)
8. [🌐 Bilingual Localization (English & Kannada)](#-bilingual-localization-english--kannada)
9. [📋 Version History & Changelog](#-version-history--changelog)

---

## ✨ Features Dashboard

### 📱 Mobile Frontend (`myapp/`)
* **🍃 Elegant Botanical Visual Style**: Harmonious dark/light themes tailored with soft forest greens, custom gradients, and translucent glassmorphism.
* **📊 Daily Check-in & Mood Tracker**: Log mood (1–5), somatic symptoms (anxiety, fatigue, head pressure), sleep patterns (duration & quality), and appetite scales.
* **📈 Mood Analytics & Trends**: View interactive line charts mapping emotional logs over time to track triggers and recovery.
* **🧠 CBT Thought Diary**: Structured Cognitive Behavioral Therapy (CBT) journal designed to guide users through identifying automatic thoughts, examining evidence, and reframing them into balanced perspectives.
* **🎵 nature Sounds Relax Player**: Immersive, loopable high-quality background audio (Rain, Forest Birds, Ocean Waves, Stream, Thunder, Wind, Frogs) with a floating playback controller bar persistent across all tabs.
* **🧘 Animated Box Breathing**: A paced 4-4-4-4 deep breathing visualizer that smoothly guides inhale, hold, exhale, and rest cycles to regulate heart rate variability.
* **🏃 Real-time Step Counter**: Accesses the native hardware accelerometer to count daily footsteps against target goals, built with an auto-reset midnight scheduler.
* **🎥 Guided Movement & Yoga**: Embedded YouTube players presenting curated Morning Energy, Gentle Stretches, and Deep Sleep yoga sequences.
* **📚 Mind Library & Simulations**: Educational text modules addressing anxiety and depression, enriched with interactive widgets (Ripple Effect triggers, pop bubbles, box breathing grids).
* **🆘 Crisis Support Hub**: Direct-call buttons for 5 major toll-free national assistance helplines in India (112, Tele-MANAS, KIRAN, Vandrevala, AASRA) alongside slots for custom doctor/therapist contacts.

### 🤖 AI Backend (`backend/`)
* **🧠 AI Myth Buster (`POST /api/v1/myth-check`)**: Instantly cross-checks mental health myths and misconceptions against clinical science, generating factual, evidence-backed breakdowns using LangChain and Google Gemini.
* **📋 Lifestyle Coach (`POST /api/v1/lifestyle-plan`)**: Evaluates a user's habits (sleep, caffeine, activity, diet) to generate a personalized "Better Living Summary" complete with areas of strength, improvements, and a single daily routine hack.

---

## 📂 Project Architecture

```
MentalHealthApp/
├── myapp/                        # 📱 Mobile Frontend (React Native + Expo SDK 54)
│   ├── assets/
│   │   └── images/               # App icons, splash screens, and loopable nature audio (.mp3)
│   ├── src/
│   │   ├── components/           # Reusable UI (SkeletonLoader, ForestBackground, SettingsModal)
│   │   ├── data/                 # Static content (CBT modules data, yoga content)
│   │   ├── hooks/                # Custom React hooks (useTheme, usePedometer)
│   │   ├── i18n/                 # Bilingual translations (en.ts + kn.ts — Kannada)
│   │   ├── navigation/           # Composite Stack + Bottom Tab navigation configurations
│   │   ├── screens/              # Screen modules (Home, Auth, Tracker, Learn, Relax, Crisis)
│   │   ├── store/                # Persistent global state (Zustand: mood, thought, audio, user)
│   │   └── utils/                # Firebase configs, sync engine, local notification controllers
│   ├── .env.example              # Frontend environment variables template
│   ├── app.json                  # Expo config (EAS settings, Android packages, native plugins)
│   ├── eas.json                  # EAS build configurations (explicit Preview APK and Production AAB)
│   └── tsconfig.json             # TypeScript compiler settings
│
└── backend/                      # 🤖 AI Backend (Python 3.12 + FastAPI + LangChain)
    ├── main.py                   # FastAPI server entrypoint (AI Myth Buster & Lifestyle Coach)
    ├── requirements.txt          # Python dependencies
    └── .env.example              # Backend environment variables template
```

---

## ⚡ Core Architecture & Engineering Highlights

MindArc is engineered with modern mobile development best practices to ensure buttery-smooth performance, robust offline usability, and high-fidelity aesthetics:

### 1. Shimmering Skeleton Loading Screens
Instead of generic, jarring circular loading spinners that make an app feel laggy, MindArc incorporates an advanced shimmering **Skeleton Loading System**:
* Powered by `react-native-reanimated` for battery-friendly, hardware-accelerated fluid breathing animations (shifting opacity smoothly between `0.35` and `0.65`).
* Custom structural layout skeleton ([SkeletonLoader.tsx](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/components/common/SkeletonLoader.tsx)) mimics the exact layout of complex screens (such as headers, check-in banners, grid items, and cards).
* Injected into [RootNavigator.tsx](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/navigation/RootNavigator.tsx). Upon app launch, the user instantly sees the glowing forest-themed skeleton cards while Firebase Authentication resolves, resulting in an exceptionally responsive startup experience.

### 2. Offline-First Persistent Caching Architecture
To guarantee that the app operates smoothly regardless of network quality, we implemented a full offline-first caching and background syncing pipeline:
* **Zustand + AsyncStorage persistence** caches mood logs, thought journals, pedometer step counts, and active preferences directly on your device.
* **Persistent User Store** ([userStore.ts](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/store/userStore.ts)) caches personal profile metrics (Name, Bio, Focus Areas, Water/Step Goals). Navigating to profile pages loads fields **instantly** without waiting for network calls.
* **Optimistic UI Updates**: Editing settings or profile details updates local state and returns the user to their screen **instantly**. Firebase synchronization is fired as a background promise without blocking the UI thread.
* **Background Cloud Sync**: Toggling screens triggers a silent background fetch that polls Firestore for updates, syncing changes to the local device storage in the background.

### 3. Redesigned Premium Profile UI
The Settings profile card is redesigned with modern, responsive high-fidelity layout guidelines:
* **Initial Avatar Badge**: If no profile image exists, it extracts the first character of your name (e.g. `S` for `Shishir`) and renders it inside a glowing, rounded botanical green circle with a translucent background overlay.
* **Bio Callout Card**: Wraps your personal quote or bio inside a neat callout card featuring a thick left-border accent bar (`borderLeftWidth: 4`).
* **Symmetric 2x2 Info Grid**: Arranges Age, Gender, Step Goal, and Focus Area into clean, rounded 2x2 grid cards with uniform sizing, uppercase micro-labels, and distinct emojis.
* **Vertical Stacked Action Buttons**: Stacks `Edit Goals & Wellness` and `Update Name & Bio` vertically as full-width pills, eliminating horizontal overlap and text wrapping on compact screen sizes.

### 4. Dynamic localizations & Hermes String Key Fix
In React Native engines (like Hermes), parsing objects with nested numeric keys (like `home.affirmations.0`) can trigger lookup issues or array casting inside `i18next`. This caused the dynamic daily affirmation quote to fail to translate, transparently falling back to English.
* **The Fix**: Restructured translation tables to utilize flat, string-prefixed keys `q0` through `q9` in both [en.ts](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/i18n/en.ts) and [kn.ts](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/i18n/kn.ts).
* Resolved in [HomeScreen.tsx](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/screens/home/HomeScreen.tsx) to query via `{t('home.affirmations.q' + quoteIndex)}`, guaranteeing a seamless, dynamic translation to Kannada instantly when the setting is toggled.

### 5. Live Render Backend & Slash Normalization
To prevent dynamic Wi-Fi IP address shifting (which causes local connections like `http://192.168.1.37:8000` to break during local development), the frontend AI features are configured to fall back to the live, highly-available Render production API:
* **The Fix**: Implemented automatic URL normalization in [ModuleDetailScreen.tsx](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/screens/learn/ModuleDetailScreen.tsx) to check and strip trailing slashes:
  ```typescript
  const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://mentalhealthapp-11.onrender.com';
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  ```
  This guarantees that regardless of whether the environment variable is loaded or formatted with a trailing slash, the fetch URL resolves cleanly without double slashes (`//`).

---

## 🛠️ Technical Specifications & Tech Stack

| Component | Technology / Library |
|---|---|
| **Mobile Core** | React Native (Expo SDK 54) |
| **Language** | TypeScript (Strict Compilation Mode) |
| **UI Styling** | Vanilla React Native StyleSheet (Tailored dark/light palette) |
| **Navigation** | React Navigation 7 (Bottom Tabs + Native Stack) |
| **State & Cache** | Zustand + AsyncStorage Persistence |
| **Auth & Database** | Firebase v11 (Authentication + Cloud Firestore) |
| **AI Backend** | Python 3.12 + FastAPI + LangChain + Google Gemini 2.5 Flash |
| **Audio Engine** | `expo-av` (Loopable background background streams) |
| **Animations** | `react-native-reanimated` + `react-native-svg` |
| **Localization** | `react-i18next` + `i18next` (Full English/Kannada) |
| **Build Pipeline** | EAS Build (Expo Application Services) |

---

## 🚀 Setup & Local Development Quickstart

### Prerequisites
* **Node.js** v18 or later
* **Python** 3.11 or 3.12
* **uv** Python package manager (`pip install uv`)
* A **Firebase project** with Email/Password Auth & Firestore enabled
* A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository
```bash
git clone https://github.com/shrinidhianchan/MentalHealthApp.git
cd MentalHealthApp
```

---

### 2. Run the FastAPI Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the environment variables template and fill in your Gemini API keys:
   ```bash
   cp .env.example .env
   # Edit .env with your GOOGLE_API_KEY and GOOGLE_API_KEY_2 keys
   ```
3. Start the FastAPI server:
   ```bash
   uv run python main.py
   ```
   > 🚀 FastAPI server starts locally at `http://localhost:8000`. You can inspect the interactive swagger documentation at `http://localhost:8000/docs`.

---

### 3. Run the Mobile Frontend

1. Navigate to the frontend folder and install packages:
   ```bash
   cd ../myapp
   npm install
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   # Edit .env and fill in your Firebase and Supabase keys
   ```
3. > [!NOTE]
   > For Android prebuilds and Google Sign-in to run successfully on a device, you need your Firebase `google-services.json` file. Download it from your Firebase Console and save it in the `myapp/` root directory. It is already added to `.gitignore` and is completely safe from being committed!

4. Start the Expo Dev Server:
   ```bash
   npx expo start
   ```
5. Scan the QR code using the **Expo Go** application on your Android or iOS device (ensure both your computer and phone are connected to the same local Wi-Fi network).

---

## 📦 Cloud Compilation: APK Generation

MindArc uses **EAS Build** (Expo Application Services) to securely compile your Android APK in the cloud, bypassing the need to install Android Studio or the Android SDK locally.

1. **Install EAS CLI and Log In**:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. **Build your installable APK**:
   ```bash
   cd myapp
   eas build --platform android --profile preview
   ```
3. **EAS Prompts**:
   * Choose **Yes** when prompted to let Expo configure your Android keystore and credentials automatically.
4. **Get the APK**:
   EAS will compile your project in the cloud. Upon completion, a **scan-to-install QR code** and a direct download link for the `.apk` file will be printed in the terminal!

---

## 🔒 Security, Secrets & gitignore Rules

> [!IMPORTANT]
> **Never commit `.env` configuration files, Firebase credentials, or Google signing keys to public GitHub repositories.**

MindArc has a unified, rigorous [.gitignore](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/.gitignore) file configured at the project root which excludes all of the following:
* `myapp/.env` & `backend/.env` (contains active API secrets & Database tokens)
* `myapp/google-services.json` (Firebase Android app secrets)
* `GoogleService-Info.plist` (Firebase iOS credentials)
* Python virtual environments (`.venv/`, `venv/`)
* Node packages, system directories, build files, and local IDE configs (`.vscode/`, `.idea/`)

---

## 🌐 Bilingual Localization: English & Kannada

MindArc supports 100% full translation coverage for both English and Kannada, allowing users in Karnataka to engage with their daily wellness in their native language:

| Language | Code | Translation Files |
|---|---|---|
| **English** | `en` | [en.ts](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/i18n/en.ts) |
| **Kannada (ಕನ್ನಡ)** | `kn` | [kn.ts](file:///c:/projects/side-projects/new-mental-app/MentalHealthApp/myapp/src/i18n/kn.ts) |

Translations apply dynamically to:
* All bottom navigation tabs & tooltips.
* Mood logging parameters, somatic symptoms, sleep ratings, and appetite guidelines.
* Every educational module chapter, section headings, and interactive simulations.
* Daily affirmation quote cards.
* Settings panel selections, forms, and input fields.

---

## 📋 Version History & Changelog

* **v1.3.0 (Latest)**:
  * Implemented reanimated **Shimmering Skeleton Loader Screen** on app startup.
  * Added **Zustand + AsyncStorage persistent caching** for offline-first User Profiles.
  * Redesigned a premium, symmetric 2x2 profile grid and verticalstacked buttons in Settings.
  * Resolved Hermes localized numeric key translation bug using flat `q0`-`q9` key structures.
  * Refactored AI Myth Checker & Lifestyle Plan API calls to target Render hosted API with slash normalization.
* **v1.2.0**: Added bilingual translation support (English + Kannada) across all screens and forms.
* **v1.1.5**: Integrated persistent nature sounds floating playback bar.
* **v1.1.0**: Added Emergency Crisis Support page with Indian national helplines and custom therapist slots.
* **v1.0.5**: Implemented Appetite tracking indicators inside mood tracker logs and library modules.
* **v1.0.0**: Initial launch featuring Mood Tracker, CBT Thought Diary, Box Breathing, and Guided Yoga.

---

<p align="center">
  Built with 🍃 care and precision for mental wellness
</p>
