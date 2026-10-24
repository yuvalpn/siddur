// שם ומספר גרסת המטמון (עדכון הגרסה ירענן את הקבצים במכשיר)
const CACHE_NAME = 'siddur-cache-v1';

// רשימת כל הקבצים שיישמרו מקומית במכשיר לעבודה ללא אינטרנט
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './data/shacharit.json',
  './data/mincha.json',
  './data/arvit.json',
  './data/musaf.json',
  './data/insertions.json',
  'https://cdn.jsdelivr.net/npm/@hebcal/core@5.7.0/dist/bundle.min.js'
];

// שלב ההתקנה: שמירת כל הקבצים במטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('טוען קבצים למטמון אופליין...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// שלב הפעלת גרסה חדשה: מחיקת מטמונים ישנים אם עודכנה הגרסה
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// יירוט בקשות רשת: אם הקובץ קיים במטמון נספק אותו מיידית (גם באופליין)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // במקרה של ניתוק רשת לקובץ שאינו במטמון
        console.warn('אין חיבור רשת והקובץ לא במטמון:', event.request.url);
      });
    })
  );
});
