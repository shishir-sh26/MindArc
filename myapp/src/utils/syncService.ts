import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { useMoodStore, MoodEntry } from '../store/moodStore';
import { useThoughtStore, ThoughtEntry } from '../store/thoughtStore';

export const syncUserDataFromFirestore = async (userId: string) => {
  try {
    console.log(`[Sync] Starting Firestore sync for user: ${userId}`);

    // 1. Sync Mood Tracker Logs
    const moodQuery = query(
      collection(db, 'tracker_logs'),
      where('user_id', '==', userId),
      limit(50)
    );
    const moodSnapshot = await getDocs(moodQuery);
    const moodEntries: MoodEntry[] = [];
    
    moodSnapshot.forEach((doc) => {
      const data = doc.data();
      moodEntries.push({
        id: doc.id,
        date: data.log_date || new Date().toISOString().split('T')[0],
        moodLevel: data.mood_level || 3,
        symptoms: data.symptoms || [],
        sleepHours: data.sleep_hours || 7,
        sleepQuality: data.sleep_quality || 'okay',
        thoughtDiary: data.thought_diary || '',
        timestamp: data.created_at ? Date.parse(data.created_at) : Date.now(),
      });
    });
    
    // Sort in-memory to be sure (descending timestamp)
    moodEntries.sort((a, b) => b.timestamp - a.timestamp);
    useMoodStore.getState().setEntries(moodEntries);
    console.log(`[Sync] Synced ${moodEntries.length} mood entries successfully.`);

    // 2. Sync Thought Diary Logs
    const thoughtQuery = query(
      collection(db, 'thought_logs'),
      where('user_id', '==', userId),
      limit(50)
    );
    const thoughtSnapshot = await getDocs(thoughtQuery);
    const thoughtEntries: ThoughtEntry[] = [];
    
    thoughtSnapshot.forEach((doc) => {
      const data = doc.data();
      thoughtEntries.push({
        id: doc.id,
        timestamp: data.created_at ? Date.parse(data.created_at) : Date.now(),
        situation: data.situation || '',
        automaticThought: data.automaticThought || '',
        emotion: data.emotion || '',
        intensity: data.intensity || 5,
        evidenceFor: data.evidenceFor || '',
        evidenceAgainst: data.evidenceAgainst || '',
        balancedThought: data.balancedThought || '',
      });
    });
    
    // Sort in-memory (descending timestamp)
    thoughtEntries.sort((a, b) => b.timestamp - a.timestamp);
    useThoughtStore.getState().setEntries(thoughtEntries);
    console.log(`[Sync] Synced ${thoughtEntries.length} thought entries successfully.`);

  } catch (error) {
    console.error('[Sync] Error synchronizing data from Firestore:', error);
  }
};
