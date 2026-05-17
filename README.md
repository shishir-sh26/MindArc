# 🍃 Mindarc Mental Health & Wellness Suite

Welcome to **Mindarc**, a premium, production-grade mental health and wellness application. Mindarc is designed to help users track their mental state, challenge negative thoughts via Cognitive Behavioral Therapy (CBT) practices, engage in mindfulness exercises, monitor daily physical activity, and obtain medical-grade AI wellness coaching.

The platform is architected with a **React Native (Expo) Mobile Frontend** and a high-performance **Python (FastAPI) Backend** integrated with Google Gemini AI models.

---

## 📂 Project Architecture

```
MentalHealthApp/
├── myapp/                  # Mobile Frontend (React Native + Expo)
│   ├── assets/             # Images, static logos, and local high-fidelity audio
│   ├── src/
│   │   ├── components/     # UI elements (Forest Background, Settings Modals, etc.)
│   │   ├── i18n/           # Internationalization (English & Kannada translations)
│   │   ├── navigation/     # Native navigation containers (Tabs & Stack)
│   │   ├── screens/        # Screen modules (Home, Auth, Learn, Relax, Activity)
│   │   ├── store/          # Local state stores (Zustand)
│   │   └── utils/          # Core utilities (Firebase, Sync Engines)
│   └── tsconfig.json       # TypeScript compiler settings
│
└── backend/                # LangChain & Gemini-powered FastAPI Backend
    ├── main.py             # Server endpoints & lazy-loading AI pipelines
    ├── requirements.txt    # Backend library list
    └── .env                # Gemini API tokens and backend secrets
```

---

## ✨ Features & Functionalities

### 📱 1. Mobile Frontend (`myapp`)
*   **Daily Check-In & Mood Tracker**:
    *   Log daily emotional scores ($1$ to $5$) using custom interactive sliders.
    *   Monitor standard somatic symptoms (Headache, Fatigue, Anxiety, Irritability).
    *   Record sleep duration and sleep quality (Poor, Okay, Good, Great).
    *   Analyze mental trends using the interactive **Mood History** graph showing full emotional shifts.
*   **CBT Thought Diary**:
    *   A structured cognitive-behavioral tool to identify and combat cognitive distortions.
    *   Fields for **Situation**, **Automatic Thought**, **Emotion & Intensity**, **Evidence FOR**, **Evidence AGAINST**, and a **Balanced Thought** rebuild.
*   **Immersive Nature Sounds**:
    *   Listen to premium, loopable nature audio tracks (**Heavy Rain**, **Forest Birds**, and **Ocean Waves**) stored locally in the app.
    *   Integrated with real-time audio mixers, volume controls, and playback engines (powered by `expo-av`).
*   **Box Breathing**:
    *   Perform paced 4-4-4-4 breathing exercises guided by fluid, interactive scale animations and cycle counters.
*   **Yoga & Movement**:
    *   Includes handpicked Morning, Stretch, and Sleep yoga programs using high-fidelity native YouTube players.
*   **Pedometer Step Tracking**:
    *   Uses native hardware accelerometer sensors to log real-time steps against custom daily goals.
    *   Configurable daily alerts that prompt users to stay active and log their checks at exactly 6:00 PM.
*   **Universal Bilingual Support**:
    *   Instantly switches the **entire** app (forms, logs, menus, system dialogs) between **English** and **Kannada** seamlessly without needing a restart.
*   **Light & Dark Theme Engine**:
    *   Vibrant, tailor-made visual profiles: custom Forest designs for light mode and soft, premium deep space gradients for dark mode.
*   **Crisis Emergency Hub**:
    *   Provides immediate, direct-call buttons linking users to free national mental health lifelines.
*   **User Profile Management (Cloud Sync)**:
    *   Fully customizable user profiles built directly inside the main settings panel.
    *   Users can update their **Display Name** and multiline **Personal Bio** directly in the app.
    *   Information is securely transmitted and stored in Firebase Firestore under the `users` collection, linked via their unique authenticated UID.

### 🤖 2. Intelligent Backend (`backend`)
*   **AI Wellness Assessment (Lifestyle Coach)**:
    *   Feeds screen times, sleep profiles, and caffeine counts to Google Gemini AI via LangChain.
    *   Generates a personalized **Better Living Summary** detailing strengths, optimization zones, and daily habit tips.
*   **AI Myth Buster**:
    *   Submit popular mental health myths or anxiety misconceptions.
    *   Gemini validates the query and returns a scientifically accurate **FACT** along with a medical-grade **EXPLANATION**.

### ☁️ 3. Authentication & Database Cloud Sync
*   **Firebase Authentication**: Includes secure Email/Password logins and unified Google Sign-In protocols.
*   **Zustand-to-Firestore Sync Engine**:
    *   Ensures full offline-first functionality.
    *   Whenever authentication states change on startup, the engine queries Firebase Firestore for the user's logged history (`tracker_logs` and `thought_logs`), parses them, and merges them directly into local in-memory stores.

---

## 🛠️ Security and Git Safety

### 🔒 Do we need to ignore `google-services.json`?
**Yes, absolutely!** 
The `google-services.json` file contains your private database keys, Firebase API tokens, database URIs, client identifiers, and project numbers. Committing this file to public version control (like GitHub) will expose your Firebase services to malicious API requests, database scrapers, and spam.

Mindarc uses a highly robust unified [.gitignore](file:///c:/projects/side-projects\new-mental-app\MentalHealthApp\.gitignore) located at the root of `MentalHealthApp/` which automatically ignores:
*   `google-services.json` and all copies (e.g. `google-services (1).json`)
*   Local environment sheets (`.env`, `myapp/.env`, `backend/.env`)
*   Python virtual environments (`.venv/`, `venv/`)
*   Dependency modules (`node_modules/`, `__pycache__/`)

---

## 🚀 Setup and How to Run

### 1. Prerequisite Environments
Ensure you have `Node.js (v18+)`, `Python (3.11 or 3.12)`, and the fast Python package installer `uv` installed.

---

### 2. Run the Backend (`backend/`)
1.  Navigate to the backend directory:
    ```bash
    cd MentalHealthApp/backend
    ```
2.  Create your local `.env` file (which is ignored by Git) based on the example:
    ```bash
    cp .env.example .env
    ```
3.  Add your keys inside `backend/.env`:
    ```env
    GOOGLE_API_KEY=your_gemini_api_key_here
    GOOGLE_API_KEY_2=your_gemini_api_key_here
    ```
4.  Launch the FastAPI server inside the `uv` environment:
    ```powershell
    uv run python main.py
    ```
    *The backend is now live and hot-reloading at `http://localhost:8000` (or your local IP `http://192.168.1.37:8000`).*

---

### 3. Run the Frontend Mobile App (`myapp/`)
1.  Navigate to the mobile directory:
    ```bash
    cd MentalHealthApp/myapp
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Add the network parameters in your `myapp/.env` file:
    ```env
    # Your host machine's Wi-Fi IPv4 address so the phone can connect
    EXPO_PUBLIC_API_URL=http://192.168.1.37:8000
    ```
4.  Start the Expo development server:
    ```bash
    npx expo start
    ```
5.  Scan the displayed QR code with the **Expo Go** application on your iOS or Android device. Both systems will communicate dynamically over the local Wi-Fi network!
