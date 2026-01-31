import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  AppwriteUser,
  ProfileRecord,
  ProfileUpsertInput,
  getCurrentUser,
  getProfileByUserId,
  signInWithEmailPassword,
  signOutCurrentSession,
  signUpWithEmailPassword,
  upsertProfile,
} from '../lib/appwrite';

const REQUIRED_PROFILE_FIELDS: Array<keyof Pick<ProfileRecord, 'fullName' | 'college' | 'university' | 'programme' | 'graduationYear'>> = [
  'fullName',
  'college',
  'university',
  'programme',
  'graduationYear',
];

const trimValue = (value: string | null) => (value ?? '').trim();

const isProfileComplete = (profile: ProfileRecord | null) => {
  if (!profile) {
    return false;
  }

  const hasRequiredFields = REQUIRED_PROFILE_FIELDS.every((field) => trimValue(profile[field]) !== '');
  return hasRequiredFields && profile.onboardingComplete;
};

interface AuthContextType {
  user: AppwriteUser | null;
  profile: ProfileRecord | null;
  loading: boolean;
  profileLoading: boolean;
  profileComplete: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  saveProfile: (input: ProfileUpsertInput) => Promise<{ error: Error | null }>;
  setPendingRedirect: (path: string | null) => void;
  consumePendingRedirect: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [pendingRedirect, setPendingRedirectState] = useState<string | null>(null);

  useEffect(() => {
    const storedRedirect = sessionStorage.getItem('pendingRedirect');
    if (storedRedirect) {
      setPendingRedirectState(storedRedirect);
    }
  }, []);

  const syncPendingRedirect = useCallback((value: string | null) => {
    if (value) {
      sessionStorage.setItem('pendingRedirect', value);
    } else {
      sessionStorage.removeItem('pendingRedirect');
    }
  }, []);

  const setPendingRedirect = useCallback(
    (path: string | null) => {
      setPendingRedirectState(path);
      syncPendingRedirect(path);
    },
    [syncPendingRedirect]
  );

  const consumePendingRedirect = useCallback(() => {
    const target = pendingRedirect;
    setPendingRedirect(null);
    return target;
  }, [pendingRedirect, setPendingRedirect]);

  const hydrateProfile = useCallback(async (nextUser: AppwriteUser | null) => {
    if (!nextUser) {
      setProfile(null);
      setProfileLoading(false);
      setProfileComplete(false);
      return;
    }

    setProfileLoading(true);
    const existingProfile = await getProfileByUserId(nextUser.$id);

    if (existingProfile) {
      setProfile(existingProfile);
      setProfileComplete(isProfileComplete(existingProfile));
      setProfileLoading(false);
      return;
    }

    const seededProfile = await upsertProfile(nextUser.$id, {
      fullName: nextUser.name ?? nextUser.email ?? null,
      role: 'user',
      onboardingComplete: false,
    });

    setProfile(seededProfile);
    setProfileComplete(isProfileComplete(seededProfile));
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await hydrateProfile(currentUser);
      setLoading(false);
    })();
  }, [hydrateProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      await signUpWithEmailPassword(email, password, fullName);
      await signInWithEmailPassword(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await hydrateProfile(currentUser);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [hydrateProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailPassword(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await hydrateProfile(currentUser);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [hydrateProfile]);

  const signOut = useCallback(async () => {
    await signOutCurrentSession();
    setUser(null);
    setProfile(null);
    setProfileComplete(false);
    setProfileLoading(false);
    setPendingRedirect(null);
  }, [setPendingRedirect]);

  const saveProfile = useCallback(
    async (input: ProfileUpsertInput) => {
      if (!user) {
        return { error: new Error('Not authenticated') };
      }

      setProfileLoading(true);

      try {
        const updated = await upsertProfile(user.$id, input);
        if (!updated) {
          setProfileLoading(false);
          return { error: new Error('Unable to update profile') };
        }
        setProfile(updated);
        setProfileComplete(isProfileComplete(updated));
        setProfileLoading(false);
        return { error: null };
      } catch (error) {
        setProfileLoading(false);
        return { error: error as Error };
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      profileComplete,
      signUp,
      signIn,
      signOut,
      isAdmin: profile?.role === 'admin',
      saveProfile,
      setPendingRedirect,
      consumePendingRedirect,
    }),
    [
      user,
      profile,
      loading,
      profileLoading,
      profileComplete,
      signUp,
      signIn,
      signOut,
      saveProfile,
      setPendingRedirect,
      consumePendingRedirect,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
