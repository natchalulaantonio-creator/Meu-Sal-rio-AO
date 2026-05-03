import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  getDocFromServer,
  initializeFirestore,
  increment,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Using initializeFirestore instead of getFirestore to pass settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  signInWithPopup,
  signOut,
  getDocFromServer,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  increment,
  getDocs
};

// Test connection with a longer timeout/retry handled gracefully
async function testConnection() {
  try {
    // Try to get a document with a timeout implicit in the getDocFromServer call which is usually 10s
    // We catch and log but don't let it crash the module initialization if possible
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection test: Success");
  } catch (error) {
    // We check for the specific message but also generic reachability issues
    if (error instanceof Error) {
       if (error.message.includes('Could not reach Cloud Firestore backend') || 
           error.message.includes('the client is offline')) {
         console.warn("Firestore appears to be offline or unreachable. Check your network or Firebase console.");
       } else if (error.message.includes('Missing or insufficient permissions')) {
         // This is actually "success" in terms of reachability - we hit the server and it told us NO
         console.log("Firestore connection test: Reachable (Permissions Denied as expected if rules are strict)");
       } else {
         console.error("Firestore connectivity error:", error.message);
       }
    }
  }
}
// Run it after some delay to not block initial load
setTimeout(testConnection, 2000);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
