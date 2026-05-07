import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, type Messaging } from 'firebase/messaging';
import { usersApi } from '@/lib/api/users';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let permissionRequested = false;

export function initializeFirebase() {
  if (typeof window === 'undefined') return;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !messagingSenderId || !appId) {
    return;
  }

  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      messagingSenderId,
      appId,
    });
  }

  messaging = getMessaging(app);
}

export async function requestNotificationPermission(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!messaging) return;
  if (permissionRequested) return;
  if (Notification.permission === 'denied') return;

  const stored = localStorage.getItem('fcm_permission_requested');
  if (stored) return;

  permissionRequested = true;
  localStorage.setItem('fcm_permission_requested', 'true');

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await usersApi.registerDeviceToken({ token, platform: 'web' });
    }
  } catch {
    // Silently fail - Firebase is optional
  }
}