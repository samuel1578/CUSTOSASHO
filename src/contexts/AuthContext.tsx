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
  isUserInAdminTeam,
} from '../lib/appwrite';
import { SIMPLE_INPUT_SCHOOLS } from '../lib/constants';
import { TenantProvider } from './TenantContext';

const isProfileComplete = (profile: ProfileRecord | null) => {
  if (!profile) {
    return false;
  }

  const trimValue = (value: string | null) => (value ?? '').trim();

  // Check basic required fields
  const basicFields = ['fullName', 'university', 'graduationYear'];
  const hasBasicFields = basicFields.every((field) => trimValue(profile[field as keyof ProfileRecord] as string) !== '');

  if (!hasBasicFields || !profile.onboardingComplete) {
    return false;
  }

  // Check school-specific required fields
  const isSimpleInputSchool = profile.university && SIMPLE_INPUT_SCHOOLS.includes(profile.university as any);

  if (isSimpleInputSchool) {
    // For simple input schools, require course and gender fields
    return trimValue(profile.course) !== '' && trimValue(profile.gender) !== '';
  } else {
    // For University of Ghana, require college and programme
    return trimValue(profile.college) !== '' && trimValue(profile.programme) !== '';
  }
};

interface AuthContextType {
  user: AppwriteUser | null;
  profile: ProfileRecord | null;
  loading: boolean;
  profileLoading: boolean;
  profileComplete: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; isAdmin?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isAdmin?: boolean }>;
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
  const [isAdmin, setIsAdmin] = useState(false);
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

  const hydrateProfile = useCallback(async (nextUser: AppwriteUser | null): Promise<boolean> => {
    if (!nextUser) {
      setProfile(null);
      setProfileLoading(false);
      setProfileComplete(false);
      setIsAdmin(false);
      return false;
    }

    setProfileLoading(true);

    // Check admin team membership
    const adminStatus = await isUserInAdminTeam();
    setIsAdmin(adminStatus);

    const existingProfile = await getProfileByUserId(nextUser.$id);

    if (existingProfile) {
      setProfile(existingProfile);
      setProfileComplete(isProfileComplete(existingProfile));
      setProfileLoading(false);
      return adminStatus;
    }

    const seededProfile = await upsertProfile(nextUser.$id, {
      fullName: nextUser.name ?? nextUser.email ?? null,
      role: 'user',
      onboardingComplete: false,
    });

    setProfile(seededProfile);
    setProfileComplete(isProfileComplete(seededProfile));
    setProfileLoading(false);
    return adminStatus;
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
      const adminStatus = await hydrateProfile(currentUser);
      return { error: null, isAdmin: adminStatus };
    } catch (error) {
      return { error: error as Error };
    }
  }, [hydrateProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailPassword(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const adminStatus = await hydrateProfile(currentUser);
      return { error: null, isAdmin: adminStatus };
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
    setIsAdmin(false);
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
      isAdmin,
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
      isAdmin,
      saveProfile,
      setPendingRedirect,
      consumePendingRedirect,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      <TenantProvider>
        {children}
      </TenantProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
