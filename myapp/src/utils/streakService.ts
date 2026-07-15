import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { useMoodStore } from '../store/moodStore';

/**
 * Returns true if lastDateStr is exactly the day before currentDateStr.
 * Formats: YYYY-MM-DD
 */
export const isYesterday = (lastDateStr: string, currentDateStr: string): boolean => {
  const lastDate = new Date(lastDateStr);
  const currentDate = new Date(currentDateStr);
  lastDate.setHours(12, 0, 0, 0);
  currentDate.setHours(12, 0, 0, 0);
  const diffTime = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

/**
 * Returns true if lastDateStr is either today or yesterday relative to currentDateStr.
 */
export const isTodayOrYesterday = (lastDateStr: string, currentDateStr: string): boolean => {
  if (lastDateStr === currentDateStr) return true;
  return isYesterday(lastDateStr, currentDateStr);
};

/**
 * Reconstructs a user's streak history and current streak count from their existing raw logs.
 * Used when a user has raw log data but no cached user_streaks document yet.
 */
export const reconstructStreak = async (userId: string) => {
  try {
    console.log(`[StreakService] Reconstructing streak from raw logs for user: ${userId}`);
    const trackerQuery = query(collection(db, 'users', userId, 'tracker_logs'));
    const thoughtQuery = query(collection(db, 'users', userId, 'thought_logs'));

    const [trackerSnap, thoughtSnap] = await Promise.all([
      getDocs(trackerQuery),
      getDocs(thoughtQuery)
    ]);

    const datesSet = new Set<string>();
    const detailsMap: Record<string, any> = {};

    trackerSnap.forEach((doc) => {
      const data = doc.data();
      const date = data.log_date;
      if (date) {
        datesSet.add(date);
        if (!detailsMap[date]) {
          detailsMap[date] = { date, recorded: true, activities: {} };
        }
        detailsMap[date].activities['tracker'] = {
          timestamp: data.created_at || new Date().toISOString(),
          details: {
            symptomsCount: data.symptoms ? data.symptoms.length : 0,
            sleepHours: data.sleep_hours || 7,
            sleepQuality: data.sleep_quality || 'okay',
            hasThoughtDiary: !!data.thought_diary
          }
        };
      }
    });

    thoughtSnap.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.created_at;
      if (createdAt) {
        const date = createdAt.split('T')[0];
        datesSet.add(date);
        if (!detailsMap[date]) {
          detailsMap[date] = { date, recorded: true, activities: {} };
        }
        if (!detailsMap[date].activities['thought']) {
          detailsMap[date].activities['thought'] = {
            timestamp: createdAt,
            details: {
              situation: data.situation || '',
              intensity: data.intensity || 5
            }
          };
        }
      }
    });

    const uniqueDates = Array.from(datesSet).sort((a, b) => b.localeCompare(a)); // Newest first

    if (uniqueDates.length === 0) {
      return { current_streak: 0, last_post_date: '', streak_broken: false };
    }

    const today = new Date().toISOString().split('T')[0];
    const newestDate = uniqueDates[0];

    // Write compiled history docs to Firestore
    for (const date of uniqueDates) {
      await setDoc(doc(db, 'users', userId, 'user_streaks', 'streak', 'history', date), detailsMap[date]);
    }

    // Check if the streak is broken (newest post is older than yesterday)
    if (!isTodayOrYesterday(newestDate, today)) {
      return { current_streak: 0, last_post_date: newestDate, streak_broken: true };
    }

    // Streak is active! Count consecutive days backwards
    let streakCount = 1;
    let currentDate = newestDate;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = uniqueDates[i];
      if (isYesterday(prevDate, currentDate)) {
        streakCount++;
        currentDate = prevDate;
      } else if (prevDate === currentDate) {
        continue;
      } else {
        break; // Gap detected
      }
    }

    return { current_streak: streakCount, last_post_date: newestDate, streak_broken: false };
  } catch (err) {
    console.warn('[StreakService] Warning during streak reconstruction (offline/network issue):', err);
    return { current_streak: 0, last_post_date: '', streak_broken: false };
  }
};

/**
 * Synchronizes the user's streak document from Firestore.
 * Performs real-time validation of whether the streak has been broken.
 */
export const syncStreakData = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const streakDocRef = doc(db, 'users', userId, 'user_streaks', 'streak');
    const streakDocSnap = await getDoc(streakDocRef);

    let streak = 0;
    let streakBroken = false;
    let lastPostDate = '';

    if (streakDocSnap.exists()) {
      const data = streakDocSnap.data();
      streak = data.current_streak || 0;
      streakBroken = data.streak_broken || false;
      lastPostDate = data.last_post_date || '';

      // Validate if the streak has broken in the meantime
      if (lastPostDate !== '' && !isTodayOrYesterday(lastPostDate, today)) {
        streak = 0;
        streakBroken = true;

        // Save updated broken state to database
        await setDoc(streakDocRef, {
          current_streak: 0,
          streak_broken: true,
          updated_at: new Date().toISOString()
        }, { merge: true });
        
        console.log(`[StreakService] Verified streak is broken. Reset database streak to 0 for user ${userId}.`);
      }
    } else {
      // Reconstruct streak from pre-existing raw logs
      const reconstructed = await reconstructStreak(userId);
      streak = reconstructed.current_streak;
      streakBroken = reconstructed.streak_broken;
      lastPostDate = reconstructed.last_post_date;

      if (lastPostDate !== '') {
        const payload = {
          user_id: userId,
          current_streak: streak,
          last_post_date: lastPostDate,
          streak_broken: streakBroken,
          updated_at: new Date().toISOString()
        };
        await setDoc(streakDocRef, payload);
        console.log(`[StreakService] Created reconstructed streak document for user ${userId}`);
      }
    }

    // Update local Zustand store
    const store = useMoodStore.getState();
    store.setStreak(streak);
    store.setStreakBroken(streakBroken);

    // Sync last 7 days of daily activities history
    const historyQuery = query(
      collection(db, 'users', userId, 'user_streaks', 'streak', 'history'),
      orderBy('date', 'desc'),
      limit(7)
    );
    const historySnapshot = await getDocs(historyQuery);
    const historyMap: Record<string, any> = {};
    historySnapshot.forEach((doc) => {
      historyMap[doc.id] = doc.data();
    });
    store.setStreakHistory(historyMap);

    console.log(`[StreakService] Synced streak details successfully. Current: ${streak}, Broken: ${streakBroken}`);
  } catch (error) {
    console.warn('[StreakService] Warning syncing user streak (offline/network issue):', error);
  }
};

/**
 * Records a new check-in/activity, recalculates the daily streak, and saves to Firestore.
 */
export const updateUserStreak = async (
  userId: string,
  date: string,
  activityType: 'mood' | 'tracker' | 'thought',
  details?: any
) => {
  try {
    console.log(`[StreakService] Recording activity [${activityType}] on ${date} for user: ${userId}`);
    const streakDocRef = doc(db, 'users', userId, 'user_streaks', 'streak');
    const streakDocSnap = await getDoc(streakDocRef);

    let currentStreak = 0;
    let lastPostDate = '';

    if (streakDocSnap.exists()) {
      const data = streakDocSnap.data();
      currentStreak = data.current_streak || 0;
      lastPostDate = data.last_post_date || '';
    } else {
      // Fallback: Check if there's pre-existing logs
      const reconstructed = await reconstructStreak(userId);
      currentStreak = reconstructed.current_streak;
      lastPostDate = reconstructed.last_post_date;
    }

    let newStreak = currentStreak;
    if (lastPostDate === '') {
      // First ever post!
      newStreak = 1;
    } else if (lastPostDate === date) {
      // Already posted today! Streak remains at its current value (re-activating if it was 0)
      newStreak = currentStreak === 0 ? 1 : currentStreak;
    } else if (isYesterday(lastPostDate, date)) {
      // Posted yesterday! Increment streak
      newStreak = currentStreak + 1;
    } else {
      // Gapped post! Restart streak at 1
      newStreak = 1;
    }

    // Save main streak doc
    const streakPayload = {
      user_id: userId,
      current_streak: newStreak,
      last_post_date: date,
      streak_broken: false,
      updated_at: new Date().toISOString()
    };
    await setDoc(streakDocRef, streakPayload);

    // Save history doc under subcollection: user_streaks/{userId}/history/{date}
    const dayDocRef = doc(db, 'users', userId, 'user_streaks', 'streak', 'history', date);
    const dayDocSnap = await getDoc(dayDocRef);

    let activities: Record<string, any> = {};
    if (dayDocSnap.exists()) {
      activities = dayDocSnap.data().activities || {};
    }

    // Append/merge details
    activities[activityType] = {
      timestamp: new Date().toISOString(),
      details: details || {}
    };

    const historyPayload = {
      date: date,
      recorded: true,
      activities: activities,
      updated_at: new Date().toISOString()
    };
    await setDoc(dayDocRef, historyPayload);

    // Update Zustand store
    const store = useMoodStore.getState();
    store.setStreak(newStreak);
    store.setStreakBroken(false);

    // Sync latest 7 days of daily history
    const historyQuery = query(
      collection(db, 'users', userId, 'user_streaks', 'streak', 'history'),
      orderBy('date', 'desc'),
      limit(7)
    );
    const historySnapshot = await getDocs(historyQuery);
    const historyMap: Record<string, any> = {};
    historySnapshot.forEach((doc) => {
      historyMap[doc.id] = doc.data();
    });
    store.setStreakHistory(historyMap);

    console.log(`[StreakService] Saved activity and updated streak to: ${newStreak}`);
  } catch (error) {
    console.warn('[StreakService] Warning updating user streak (offline/network issue):', error);
  }
};
