import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, writeBatch, doc, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required config
const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
for (const key of required) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing Firebase config: ${key}. Check your .env file.`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Firestore with offline persistence enabled for disconnect resilience.
// Board state is cached in IndexedDB and synced when reconnected.
// Multi-tab support ensures multiple browser tabs work correctly.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// Dev-only: expose perf testing helpers on window
if (import.meta.env.DEV) {
  window.__perfTest = {
    async populate(count = 500, boardId = 'dev-board') {
      const colors = ['#FDE68A','#BFDBFE','#BBF7D0','#FECACA','#E9D5FF','#FED7AA'];
      const types = ['stickyNote','rectangle','circle','text','line'];
      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      let created = 0;
      while (created < count) {
        const batch = writeBatch(db);
        const end = Math.min(created + 500, count);
        for (let i = created; i < end; i++) {
          const ref = doc(collection(db, `boards/${boardId}/objects`));
          const type = types[rand(0, types.length - 1)];
          const color = colors[rand(0, colors.length - 1)];
          const x = rand(0, 5000);
          const y = rand(0, 3000);
          const base = { type, x, y, color, rotation: 0, zIndex: i + 1,
            createdBy: 'perf-test', updatedBy: 'perf-test',
            createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
          if (type === 'stickyNote') {
            Object.assign(base, { width: rand(150, 250), height: rand(120, 180), text: `Note ${i + 1}` });
          } else if (type === 'rectangle') {
            Object.assign(base, { width: rand(80, 200), height: rand(80, 200) });
          } else if (type === 'circle') {
            Object.assign(base, { radius: rand(30, 80) });
          } else if (type === 'text') {
            Object.assign(base, { text: `Text ${i + 1}`, fontSize: rand(14, 32), width: rand(100, 300) });
          } else if (type === 'line') {
            Object.assign(base, { width: rand(80, 250), strokeWidth: rand(2, 5) });
          }
          batch.set(ref, base);
        }
        await batch.commit();
        created = end;
        console.log(`Created ${created}/${count}`);
      }
      console.log('Done! Objects should appear on the board.');
    },

    async cleanup(boardId = 'dev-board') {
      const snap = await getDocs(collection(db, `boards/${boardId}/objects`));
      const docs = snap.docs;
      let deleted = 0;
      while (deleted < docs.length) {
        const batch = writeBatch(db);
        const end = Math.min(deleted + 500, docs.length);
        for (let i = deleted; i < end; i++) batch.delete(docs[i].ref);
        await batch.commit();
        deleted = end;
        console.log(`Deleted ${deleted}/${docs.length}`);
      }
      console.log('Cleaned up!');
    },
  };
  console.log('Perf helpers: __perfTest.populate(500) / __perfTest.cleanup()');
}

export default app;
