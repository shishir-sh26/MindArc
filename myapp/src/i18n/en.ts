export const en = {
  auth: {
    logIn: 'Log In',
    signUp: 'Sign Up',
    welcomeBack: 'Welcome back. Please log in.',
    createAccount: 'Create your secure account.',
    email: 'Email Address',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    noAccount: "Don't have an account? ",
    hasAccount: "Already have an account? ",
    or: 'OR',
    continueWithGoogle: 'Continue with Google'
  },
  home: {
    greeting: 'Good {{time}},',
    friend: 'friend',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    howAreYou: 'How are you feeling today?',
    affirmations: {
      q0: "take it one breath at a time",
      q1: "you are exactly where you need to be",
      q2: "peace is a practice, not a destination",
      q3: "your potential to heal is infinite",
      q4: "allow yourself to rest",
      q5: "growth happens in the pauses",
      q6: "you are safe in this moment",
      q7: "inhale courage, exhale doubt",
      q8: "soften your shoulders, soften your heart",
      q9: "you are not your anxious thoughts"
    },
    relaxationCalming: 'Relaxation & Calming',
    trackingJournaling: 'Tracking & Journaling',
    yogaMovement: 'Yoga & Movement',
    breathing: 'BREATHING',
    guidedExercises: 'guided exercises',
    natureSounds: 'NATURE SOUNDS',
    calmMind: 'calm your mind',
    relaxHub: 'RELAX HUB',
    allRelaxingTools: 'all relaxing tools',
    dailyCheckIn: 'DAILY CHECK-IN',
    trackMood: 'track your mood',
    thoughtDiary: 'THOUGHT DIARY',
    logThoughts: 'log your thoughts',
    activity: 'ACTIVITY',
    dailyGoals: 'daily goals',
    library: 'LIBRARY',
    learnMentalHealth: 'learn about mental health',
    settings: 'Settings',
    moreActivities: 'View More Activities & Steps',
    educationSupport: 'Education & Support',
    learn: 'Learn',
    mentalWellness: 'mental wellness',
    crisisSupport: 'Crisis Support',
    getHelpNow: 'get help now',
    customAlertsTitle: "Custom Alerts",
    customAlertsSub: "Set a custom reminder. Choose between a one-time delay, an hourly nudge, or a daily repeating alert.",
    customAlertsTitlePlaceholder: "Notification Title (e.g. Time for water!)",
    customAlertsBodyPlaceholder: "Notification Body (e.g. Relax, stretch, and check your posture.)",
    notificationType: "NOTIFICATION TYPE:",
    oneTimeDelay: "One-time Delay",
    everyHour: "Every Hour",
    dailyAlert: "Daily Alert",
    scheduleButton: "SCHEDULE CUSTOM ALERT",
    errorTitle: "Error",
    successTitle: "Scheduled Successfully",
    invalidDelayError: "Please specify a valid delay in seconds.",
    delaySuccessMsg: "Your custom alert will trigger in {{delay}} seconds.",
    scheduleErrorMsg: "Could not schedule notification.",
    hourlySuccessMsg: "Hourly recurring notification has been registered.",
    invalidTimeError: "Please input a valid hour (0-23) and minute (0-59).",
    dailySuccessMsg: "Daily reminder scheduled repeating at {{time}}.",
    popUpDelay: "Pop up delay: {{delay}} seconds",
    dailyAlertTime: "Daily alert time: {{time}}",
    hourLabel: "HOUR (0-23)",
    minuteLabel: "MINUTE (0-59)",
    hourlyNudgeInfo: "This will nudge you every hour on the hour to take a breath, correct posture, or drink water."
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    signOut: 'Sign Out',
    english: 'English',
    kannada: 'ಕನ್ನಡ (Kannada)',
    close: 'Close',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode'
  },
  activity: {
    title: 'Activity',
    pedometer: 'Daily Steps',
    steps: 'Steps',
    goal: 'goal',
    notifications: 'Reminders & Notifications',
    dailyCheckInReminder: 'Daily Check-in Reminder',
    dailyCheckInReminderSub: 'Reminds you at 8:00 PM to log if you haven\'t checked in today',
    twoHourWellnessPrompts: '2-Hour Mindful Prompts',
    twoHourWellnessPromptsSub: 'Gentle nudges every 2 hours to do yoga, stretch, and relax',
    dailyReminder: 'Daily Reminder',
    remindToLog: 'Get a daily nudge to stay active (6:00 PM)',
    yoga: 'Yoga, Stretching & Exercises',
    yogaSub: 'Follow along with these relaxing yoga sessions.',
    min: 'min',
    level: 'Level',
    closeVideo: 'Close Video',
    sensor: 'Sensor:',
    editGoal: "Edit Goal",
    howItWorks: "How it works",
    setDailyGoal: "Set Daily Step Goal",
    save: "Save",
    cancel: "Cancel",
    invalidGoal: "Invalid Goal",
    invalidGoalDesc: "Please enter a valid step goal (e.g. 8000)",
    pedometerInfoTitle: "DSP Step Counter",
    pedometerInfoIntro: "To maximize your battery life and maintain orientation independence, Mind Matrix bypasses high-level OS pedometer APIs and processes raw accelerometer measurements using digital signal processing (DSP):",
    pedometerInfoSec1Title: "1. Euclidean Magnitude",
    pedometerInfoSec1Desc: "Converts 3-axis X, Y, and Z samples into a single scalar wave (Euclidean norm). This allows steps to be counted accurately regardless of how the phone is oriented in your pocket or hand.",
    pedometerInfoSec2Title: "2. Exponential Smoothing (50Hz)",
    pedometerInfoSec2Desc: "Filters out high-frequency sensor noise, hand tremors, or vehicle vibrations using a low-pass Exponential Moving Average filter at a strictly-regulated 50Hz frequency.",
    pedometerInfoSec3Title: "3. Dynamic Thresholding",
    pedometerInfoSec3Desc: "Maintains a rolling 1000ms window to dynamically determine the midpoint between maximum and minimum peaks. The threshold automatically adjusts to your walking or running speed.",
    pedometerInfoSec4Title: "4. Zero-Crossing Hysteresis",
    pedometerInfoSec4Desc: "Utilizes a deadband gap to prevent double-counting steps caused by minor micro-oscillations near the threshold line.",
    pedometerInfoSec5Title: "5. Rhythm State Machine",
    pedometerInfoSec5Desc: "Locks step counts only after validating a regular cadence rhythm (between 0.5 and 5 steps per second) for 2 consecutive cycles to quickly begin counting.",
    walkingTipsTitle: "How to Walk for Best Results",
    walkingTipsIntro: "The step counter uses your phone's accelerometer sensor. Follow these tips for accurate step tracking:",
    walkingTip1Title: "Keep Phone on Your Body",
    walkingTip1Desc: "Place your phone in your trouser pocket, jacket pocket, or hold it in your hand while walking. The sensor needs to feel your body's movement. Keeping it on a table or bag won't count steps.",
    walkingTip2Title: " Walk at a Steady Pace",
    walkingTip2Desc: "Walk naturally and consistently. The tracker needs at least 2 steady steps before it starts counting. Very slow shuffling or extremely fast sprinting may not register reliably.",
    walkingTip3Title: "⏱Don't Stop Too Long",
    walkingTip3Desc: "If you stop walking for more than 2.5 seconds, the tracker resets and needs 2 fresh steps to start counting again. Keep a continuous walking rhythm for best accuracy.",
    walkingTip4Title: "Avoid Shaking the Phone",
    walkingTip4Desc: "Random hand shaking, tapping, or phone vibrations are filtered out automatically. Only rhythmic walking or running motions are counted as steps.",
    walkingTip5Title: "Resets Daily at Midnight",
    walkingTip5Desc: "Your step count resets to 0 every day at midnight automatically. Steps are only counted while the app is open and running in the foreground.",
    walkingTip6Title: "Battery & Performance",
    walkingTip6Desc: "The step counter runs at 50Hz using minimal battery. It works regardless of phone orientation — portrait, landscape, or upside down.",
    gotIt: "Got it"
  },
  crisis: {
    title: 'Emergency Help',
    subtitle: 'You are not alone. Help is available.',
    call: 'Call Now',
    warning: 'If you are in immediate physical danger, please contact local emergency services immediately.',
    notAlone: 'You are not alone.',
    reachOut: 'There are people who want to listen and help. Reach out to one of the free support lines below.',
    error: 'Error',
    noCallSupport: 'Calling is not supported on this device.',
    personalTitle: 'Personal Support Numbers',
    nationalTitle: 'National Assistance (India)',
    therapistLabel: 'Therapist Contact',
    otherLabel: 'Other Emergency Contact',
    therapistPlaceholder: 'Add therapist number',
    otherPlaceholder: 'Add other number',
    notSet: 'Not configured yet',
    tapToEdit: 'Tap edit to add',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    successSave: 'Saved successfully!',
    helplines: {
      e112: {
        name: 'Primary National Emergency (112)',
        desc: 'India\'s primary emergency response system. This connects users directly to police, fire, and ambulance services.',
        hours: '24/7'
      },
      telemanas: {
        name: 'Tele-MANAS Helpline',
        desc: 'The official, toll-free 24/7 mental health helpline by the Government of India. It operates in 20+ languages and routes you to a local state cell (e.g., NIMHANS in Karnataka).',
        hours: '24/7'
      },
      kiran: {
        name: 'KIRAN Helpline',
        desc: 'A 24/7 toll-free mental health rehabilitation helpline launched by the Ministry of Social Justice and Empowerment.',
        hours: '24/7'
      },
      vandrevala: {
        name: 'Vandrevala Foundation',
        desc: 'A pan-India, 24/7 crisis intervention helpline managed by qualified psychologists.',
        hours: '24/7'
      },
      aasra: {
        name: 'AASRA NGO Helpline',
        desc: 'A 24/7 emotional support and crisis lifeline for suicide prevention.',
        hours: '24/7'
      }
    }
  },
  learn: {
    title: 'Library',
    subtitle: 'Educational modules to help you understand your mind.',
    readMore: 'Read Module',
    actionItems: "Action Items",
    keyTakeaways: "Key Takeaways",
    readLabel: "{{time}} read",
    levelTips: {
      low: {
        "0": "Maintenance is key: keep up with your daily mindfulness to stay balanced.",
        "1": "This is a great time for a light walk or reading to reinforce calm.",
        "2": "Acknowledge and appreciate your current state of mental clarity."
      },
      mid: {
        "0": "Notice where you're holding tension—usually shoulders, jaw, or neck.",
        "1": "A 5-minute 'reset' break can prevent your stress from escalating further.",
        "2": "Take small sips of water and practice one round of box breathing."
      },
      high: {
        "0": "PRIORITY: Stop what you are doing immediately and follow the Breathing Box below.",
        "1": "Splash cold water on your face—this helps trigger your body's natural relaxation reflex.",
        "2": "Immediate Grounding: Name 5 things you can see and 4 things you can touch right now."
      }
    },
    sim: {
      anxietyTitle: "Interactive Stress Meter",
      anxietyLowDesc: "Calm and relaxed. Heart rate is steady, breathing is deep.",
      anxietyMidDesc: "Alert and focused. Mild tension, slightly elevated heart rate.",
      anxietyHighDesc: "High stress. Rapid breathing, muscle tension, fight-or-flight activated.",
      low: "LOW",
      med: "MED",
      high: "HIGH",
      rippleTitle: "The Ripple Effect",
      rippleTrigger: "TRIGGER",
      mythTitle: "AI Myth Buster",
      mythDesc: "Enter a common myth or a thought you're unsure about, and our AI will clarify the medical fact.",
      mythPlaceholder: "Example: Anxiety is just a sign of weakness...",
      mythVerifyBtn: "VERIFY WITH AI",
      contactsTitle: "Professional Contacts",
      wellnessTitle: "Wellness Assessment",
      generateSummaryBtn: "GENERATE BETTER LIVING SUMMARY",
      retakeBtn: "RETAKE ASSESSMENT",
      gamesTitle: "Relieving Games",
      gamesSubtitle: "Interactive activities to help ground you in the present moment.",
      breathingBoxTitle: "Breathing Box",
      breathingBoxDesc: "Follow the box to regulate your heart rate.",
      popStressTitle: "Pop the Stress",
      popStressDesc: "Tap the bubbles to release tension.",
      mythLabel: "MYTH",
      factLabel: "FACT",
      inhale: "Inhale",
      hold: "Hold",
      exhale: "Exhale",
      rest: "Rest",
      rippleMindLabel: "MIND",
      rippleMindDesc: "Cognitive Overload: Your thoughts move faster than you can process. Focus shatters, and self-doubt begins to cloud your decision-making.",
      rippleBodyLabel: "BODY",
      rippleBodyDesc: "Somatic Response: High Cortisol leads to physical \"Armor\"—your muscles clench, your breath becomes shallow, and you may feel constant fatigue.",
      rippleLifeLabel: "LIFE",
      rippleLifeDesc: "Social Erosion: The cumulative weight leads to withdrawal. You may find yourself avoiding joys and distancing from those who support you most.",
      impact: "IMPACT:",
      aiError: "Error connecting to AI service. Please ensure the backend is running.",
      contactEmergency: "Emergency Services",
      contactSuicide: "National Suicide Prevention",
      contactPsychiatrist: "Dr. Aris (Psychiatrist)",
      contactTherapist: "Dr. Sarah (Therapist)",
      contactTextLine: "Crisis Text Line",
      personalizedPlan: "Your Personalized Plan",
      quest_sleep: "How many hours do you sleep?",
      quest_exercise: "Weekly physical activity?",
      quest_diet: "How would you describe your diet?",
      quest_caffeine: "Daily caffeine intake?",
      opt__5_hrs: "< 5 hrs",
      "opt_5-7_hrs": "5-7 hrs",
      "opt_7-9_hrs": "7-9 hrs",
      opt_9_hrs: "9+ hrs",
      opt_none: "None",
      "opt_1-2_days": "1-2 days",
      "opt_3-5_days": "3-5 days",
      opt_athletic: "Athletic",
      opt_balanced: "Balanced",
      opt_mostly_fast_food: "Mostly Fast Food",
      opt_irregular: "Irregular",
      "opt_vegan/special": "Vegan/Special",
      "opt_1-2_cups": "1-2 cups",
      "opt_3-5_cups": "3-5 cups",
      "opt_heavy_(5_)": "Heavy (5+)",
      myth1: "Anxiety is just weakness.",
      fact1: "Anxiety is a common medical condition related to brain chemistry and environmental stress.",
      myth2: "You should just force yourself to calm down.",
      fact2: "Forcing calm often increases stress. Acceptance and breathing techniques work better."
    },
    modules: {
      m1: {
        title: "What is Anxiety & Depression",
        category: "Knowledge",
        readTime: "5 min",
        content: "Anxiety and depression are two of the most common mental health conditions. While they are distinct, they often occur together and can significantly impact daily life. Anxiety is characterized by persistent worry or fear, while depression often involves a deep sense of sadness, hopelessness, or loss of interest.",
        sections: {
          s0: {
            heading: "Understanding Anxiety",
            content: "Anxiety is your body's natural response to stress. It's a feeling of fear or apprehension about what's to come. It becomes a concern when the feelings are intense, last for a long time, and interfere with your daily life.",
            tips: {
              "0": "Differentiate between normal worry and an anxiety disorder."
            }
          },
          s1: {
            heading: "Understanding Depression",
            content: "Depression is more than just feeling sad. It's a persistent feeling of emptiness or loss of interest in activities you once enjoyed. It can affect how you feel, think, and handle daily activities, such as sleeping, eating, or working.",
            tips: {
              "0": "It's a medical condition, not a sign of weakness."
            }
          }
        },
        tips: {
          "0": "Both are treatable with professional help, self-care, and support.",
          "1": "Recognizing the symptoms is the first step toward recovery.",
          "2": "You are not alone; millions of people manage these conditions daily."
        }
      },
      m2: {
        title: "Symptom Triggers",
        category: "Strategy",
        readTime: "4 min",
        content: "Triggers are specific events, thoughts, or environments that initiate or worsen symptoms of anxiety and depression. Understanding the 'Why' behind these triggers is crucial for building resilience.",
        sections: {
          s0: {
            heading: "The Root Causes",
            content: "Triggers rarely appear in a vacuum. They are often rooted in:\n\n• Biological factors (imbalanced neurotransmitters like Serotonin)\n• Environmental stressors (chronic work pressure, toxic relationships)\n• Past Traumas (conditioned responses to specific sounds or places)\n• Lifestyle habits (poor sleep, high caffeine, social isolation)",
            tips: {
              "0": "Your triggers are valid, even if they seem 'small' to others."
            }
          },
          s1: {
            heading: "Common Situational Triggers",
            content: "Social situations, tight deadlines, or even specific times of day (like Sunday evenings) can act as immediate triggers. Internal triggers include self-criticism or a perceived sense of failure.",
            tips: {
              "0": "Identify 'Sunday Scaries' or 'Morning Dread' as specific patterns."
            }
          }
        },
        tips: {
          "0": "Track your sleep—lack of rest lowers your 'Trigger Threshold'.",
          "1": "Notice early physical signs: jaw clenching, shallow breathing, or leg tapping.",
          "2": "The goal is management, not just elimination of triggers."
        }
      },
      m3: {
        title: "AI Myth vs Fact Checker",
        category: "Interactive",
        readTime: "Interactive",
        content: "There is a lot of misinformation about mental health. Use our AI-powered checker to verify any statement you've heard.",
        sections: {
          s0: {
            heading: "How it works",
            content: "Enter a statement you suspect might be a myth (e.g., 'Anxiety is just weakness') and our medical-grade AI will provide the clinical fact behind it.",
            tips: {
              "0": "Be specific for better results.",
              "1": "Use it to challenge negative self-talk."
            }
          }
        },
        tips: {
          "0": "AI results are for educational purposes.",
          "1": "Always consult a professional for medical advice.",
          "2": "Myths often perpetuate stigma—challenging them is the first step to healing."
        }
      },
      m4: {
        title: "Lifestyle Modifications",
        category: "Wellness",
        readTime: "Assessment",
        content: "Small changes in your daily routine can have a massive impact on your mental clarity and physical energy. Take our assessment to see where you can optimize.",
        sections: {
          s0: {
            heading: "The Power of Routine",
            content: "Our bodies thrive on predictability. Simple habits like a consistent sleep schedule and mindful eating can regulate your nervous system.",
            tips: {
              "0": "Start with one small change at a time.",
              "1": "Consistency over intensity."
            }
          }
        },
        tips: {
          "0": "Aim for 7-9 hours of quality sleep.",
          "1": "Incorporate 30 minutes of light activity daily.",
          "2": "Stay hydrated—your brain is 75% water!"
        }
      },
      m5: {
        title: "Where to Seek Help",
        category: "Support",
        readTime: "Emergency",
        content: "If you or someone you know is struggling or in crisis, help is available. Reach out to these professional resources and emergency hotlines.",
        sections: {
          s0: {
            heading: "Emergency Hotlines",
            content: "These services are available 24/7 and provide immediate crisis intervention.",
            tips: {
              "0": "National Suicide Prevention: 988",
              "1": "Crisis Text Line: Text HOME to 741741"
            }
          },
          s1: {
            heading: "Professional Directory",
            content: "Specialized doctors and therapists for long-term support.",
            tips: {
              "0": "Dr. Aris (Psychiatrist): +1-555-0123",
              "1": "Dr. Sarah (Therapist): +1-555-0456",
              "2": "Wellness Clinic: +1-555-0789"
            }
          }
        },
        tips: {
          "0": "In an immediate life-threatening emergency, always dial your local emergency number (e.g., 911).",
          "1": "Seeking help is a sign of strength, not weakness.",
          "2": "You don't have to go through this alone."
        }
      },
      m6: {
        title: "Healthy Appetite Recommendations",
        category: "Nutrition",
        readTime: "4 min",
        content: "An average healthy appetite is a natural balance of physical hunger cues that supports a normal lifestyle. Understanding your hunger signals, eating patterns, and emotional cues helps maintain a balanced relationship with food.",
        sections: {
          s0: {
            heading: "What a Normal Appetite Involves",
            content: "• Regular Eating Patterns: Eating 3 balanced meals (or consistent portions) daily without skipping.\n• Mindful Biofeedback: Eating in response to genuine physiological hunger (like stomach rumbling or mild low energy) rather than emotional triggers like anxiety, boredom, or stress.\n• Stable Energy: Experiencing steady, sustainable energy levels without severe mid-day fatigue or sudden food crashes.\n• Fullness Awareness: Understanding your body's fullness signals and stopping when you feel comfortably satisfied.",
            tips: {
              "0": "Listen to physical signs of hunger, not just clock time."
            }
          },
          s1: {
            heading: "When to Pay Attention",
            content: "Changes in appetite are often your body's early warning system for stress, anxiety, or physical health changes. Keeping a food and mood log can help identify connections between your emotions and eating habits.",
            tips: {
              "0": "If appetite remains persistently low, poor, or excessive for over 2 weeks, it could be a sign of increased stress, hormonal changes, or sleep loss. Consider checking in with a doctor or therapist."
            }
          }
        },
        tips: {
          "0": "Eat mindfully—slowing down allows your brain to register fullness.",
          "1": "Stay hydrated, as thirst is sometimes mistaken for hunger.",
          "2": "Maintain regular sleeping patterns, as sleep affects hunger hormones (leptin and ghrelin)."
        }
      }
    }
  },
  relax: {
    title: 'Relax',
    subtitle: 'Simple tools to help you find your calm.',
    boxBreathing: 'Box Breathing',
    boxBreathingSub: 'A 4-step breathing technique to reduce stress and regain focus.',
    natureSounds: 'Nature Sounds',
    natureSoundsSub: 'Immersive audio to quiet your mind.',
    meditation: 'Meditation',
    meditationSub: 'Guided mindfulness practices.',
    gamesTitle: "Relieving Games",
    gamesSubtitle: "Interactive activities to help ground you in the present moment.",
    howItWorks: "Why games?",
    whyGamesTitle: "WHY INTERACTIVE GAMES ARE NEEDED:",
    whyGamesBullet1: "**Grounding Exercise:** Relieving games shift the brain's focus away from internal anxious worry-loops and re-direct cognitive resources to active motor and visual coordinates.",
    whyGamesBullet2: "**Dopamine & Calming:** Interacting with simple physics, growth vectors, and tactile haptic bubbles triggers minor dopamine releases, down-regulating the nervous system from fight-or-flight response.",
    zenSproutTitle: "Zen Sprout Garden",
    zenSproutDesc: "Tap the watering can to nurture the sprout. Watch it grow and bloom!",
    waterPlant: "WATER PLANT",
    restartGarden: "RESTART GARDEN",
    stages: {
      seed: "Seed in Soil",
      seedHint: "Give it water to sprout",
      baby: "Baby Sprout",
      babyHint: "Keep watering to grow leaves",
      budding: "Budding Leaf",
      buddingHint: "Almost ready to bloom",
      blooming: "Blooming Flower",
      bloomingHint: "Beautiful! Garden is healthy!",
      lotus: "Golden Lotus",
      lotusHint: "Fully grown. Tap reset to start over."
    },
    balloonTitle: "Thought Balloon Release",
    balloonDesc: "Write a negative thought inside the balloon and tap release to set it free.",
    balloonPlaceholder: "Type your worry (e.g. Anxiety, Deadlines)",
    releaseWorry: "RELEASE WORRY",
    balloonDrift: "Watch your worry drift away into the sky...",
    getAnotherBalloon: "GET ANOTHER BALLOON"
  },
  breathing: {
    title: 'Box Breathing',
    subtitle: 'A simple technique to quickly physically calm down. Follow the circle.',
    prepare: 'prepare',
    inhale: 'inhale',
    hold: 'hold',
    exhale: 'exhale',
    endSession: 'End Session',
    begin: 'Begin',
    youDidWell: 'you did well.',
    completed: 'Completed',
    breathCycles: 'breath cycles',
    totalTime: 'Total Time:',
    done: 'Done',
    guideTitle: 'Breathing Techniques Guide',
    boxTitle: 'Box Breathing',
    boxDesc: "A clinical breathing technique used by Navy SEALs, athletes, and first responders to regain absolute composure and calm under high stress. By equalizing the duration of inhaling, holding, exhaling, and holding, it halts the body's fight-or-flight response and resets the autonomic nervous system.",
    sleepTitle: '4-7-8 Sleep Technique',
    sleepDesc: 'Developed by Dr. Andrew Weil, this pattern acts as a natural tranquilizer for the nervous system. By holding your breath for 7 seconds and exhaling slowly for 8 seconds, you force oxygen deep into your lungs and trigger the parasympathetic nervous system. Excellent for insomnia and severe anxiety relief.',
    coherentTitle: 'Coherent Breathing',
    coherentDesc: 'Also known as Resonant Breathing, this style focuses on balancing your breathing pace at exactly 5 seconds in and 5 seconds out. This pattern has been scientifically proven to optimize Heart Rate Variability (HRV), reduce blood pressure, and create a state of biological coherence and calm.',
  },
  sounds: {
    title: 'Nature Sounds',
    subtitle: 'Put on your headphones and drift away.',
    nowPlaying: 'Now Playing:',
    options: {
      rain: 'Heavy Rain',
      forest: 'Forest Birds',
      ocean: 'Ocean Waves',
      stream: 'Flowing Stream',
      thunders: 'Thunderstorm',
      wind: 'Winter Wind',
      frogs: 'Night Frogs'
    }
  },
  thoughtDiary: {
    title: 'Thought Diary',
    subtitle: 'Challenge negative thoughts.',
    newEntry: 'New Entry',
    theSituation: '1. The Situation',
    theSituationPlaceholder: 'What happened? Who, what, when, where?',
    negativeThought: '2. Automatic Thought',
    negativeThoughtPlaceholder: 'What went through your mind?',
    emotion: '3. Emotion & Intensity',
    emotionPlaceholder: 'E.g., Anxious, Sad, Angry',
    intensity: 'Intensity',
    evidenceFor: '4. Evidence FOR the thought',
    evidenceForPlaceholder: 'Facts that support this thought',
    evidenceAgainst: '5. Evidence AGAINST the thought',
    evidenceAgainstPlaceholder: 'Facts that contradict this thought',
    balancedThought: '6. Balanced Thought',
    balancedThoughtPlaceholder: 'A more realistic, balanced perspective',
    saveEntry: 'Save Entry',
    updateEntry: 'Update Entry'
  },
  tracker: {
    title: 'Daily Check-in',
    howAreYou: 'How are you feeling today?',
    symptoms: 'Any symptoms?',
    sleep: 'How did you sleep?',
    sleepHours: '{{hours}} hours',
    sleepLabel: 'Sleep',
    quality: 'Quality:',
    appetite: 'How is your appetite today?',
    appetiteLabel: 'Appetite',
    saveEntry: 'Save Entry',
    updateEntry: 'Update Entry',
    history: 'Mood History',
    viewTrends: 'view trends',
    hub: 'Tracker Hub',
    allTools: 'all tracking tools',
    sleepQuality: {
      poor: 'Poor',
      okay: 'Okay',
      good: 'Good',
      great: 'Great'
    },
    appetiteLevels: {
      poor: 'Poor',
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      excessive: 'Excessive'
    },
    appetiteGuideTitle: 'Healthy Appetite Recommendations',
    appetiteGuideIntro: 'An average healthy appetite is a natural balance of physical hunger cues that supports a normal lifestyle. Typically, a normal appetite involves:',
    appetiteGuidePoint1: '• Regular Eating Patterns: Eating 3 balanced meals (or consistent portions) daily without skipping.',
    appetiteGuidePoint2: '• Mindful Biofeedback: Eating in response to genuine physiological hunger (like stomach rumbling or mild low energy) rather than emotional triggers like anxiety, boredom, or stress.',
    appetiteGuidePoint3: '• Stable Energy: Experiencing steady, sustainable energy levels without severe mid-day fatigue or sudden food crashes.',
    appetiteGuidePoint4: '• Fullness Awareness: Understanding your body\'s fullness signals and stopping when you feel comfortably satisfied.',
    appetiteGuideWarning: 'Tip: If your appetite remains persistently low, poor, or excessive for over 2 weeks, it could be a sign of increased stress, hormonal changes, or sleep loss. Consider checking in with a doctor or therapist for professional support.'
  },
  navigation: {
    tooltips: {
      home: "Home: Quick Check-in & Calm Tools",
      learn: "Learn: Mindful Reading & Mental Health",
      track: "Track: Mood, Symptoms & Sleep Logs",
      thoughtDiary: "Thought Diary: CBT Cognitive Restructuring",
      relax: "Relax: Nature Sounds & Ambient Breathing",
      activity: "Activity: Daily Footsteps & Sensor Sandbox"
    }
  }
};
