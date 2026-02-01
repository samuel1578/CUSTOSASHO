import { Account, Client, Databases, ID, Models, Query } from 'appwrite';

const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const appwriteDatabaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const appwriteProfileCollectionId = import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID;

// Only throw errors if we're in production and these aren't set
if (import.meta.env.PROD && (!appwriteEndpoint || !appwriteProjectId)) {
    console.error('Missing Appwrite environment variables');
}

if (import.meta.env.PROD && (!appwriteDatabaseId || !appwriteProfileCollectionId)) {
    console.error('Missing Appwrite profile database configuration');
}

const client = appwriteEndpoint && appwriteProjectId
    ? new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId)
    : null;

export const account = client ? new Account(client) : null;
export const databases = client ? new Databases(client) : null;

export type AppwriteUser = Models.User<Models.Preferences>;

type RawProfileDocument = Models.Document & {
    userId: string;
    fullName?: string;
    role?: string;
    college?: string | null;
    university?: string | null;
    programme?: string | null;
    graduationYear?: number | null;
    phone?: string | null;
    onboardingComplete?: boolean;
};

export interface ProfileRecord {
    id: string;
    userId: string;
    fullName: string | null;
    role: 'user' | 'admin';
    college: string | null;
    university: string | null;
    programme: string | null;
    graduationYear: string | null;
    phone: string | null;
    onboardingComplete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileUpsertInput {
    fullName?: string | null;
    role?: 'user' | 'admin';
    college?: string | null;
    university?: string | null;
    programme?: string | null;
    graduationYear?: string | null;
    phone?: string | null;
    onboardingComplete?: boolean;
}

const toProfileRecord = (document: RawProfileDocument): ProfileRecord => ({
    id: document.$id,
    userId: document.userId,
    fullName: document.fullName ?? null,
    role: document.role === 'admin' ? 'admin' : 'user',
    college: document.college ?? null,
    university: document.university ?? null,
    programme: document.programme ?? null,
    graduationYear: document.graduationYear ? document.graduationYear.toString() : null,
    phone: document.phone ?? null,
    onboardingComplete: Boolean(document.onboardingComplete),
    createdAt: document.$createdAt,
    updatedAt: document.$updatedAt,
});

const serializeProfileInput = (input: ProfileUpsertInput) => ({
    ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.college !== undefined ? { college: input.college } : {}),
    ...(input.university !== undefined ? { university: input.university } : {}),
    ...(input.programme !== undefined ? { programme: input.programme } : {}),
    ...(input.graduationYear !== undefined ? { graduationYear: parseInt(input.graduationYear || '0', 10) } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.onboardingComplete !== undefined ? { onboardingComplete: input.onboardingComplete } : {}),
});

export async function getProfileByUserId(userId: string): Promise<ProfileRecord | null> {
    try {
        const result = await databases.listDocuments<RawProfileDocument>(
            appwriteDatabaseId,
            appwriteProfileCollectionId,
            [Query.equal('userId', userId), Query.limit(1)]
        );

        const document = result.documents[0];
        return document ? toProfileRecord(document) : null;
    } catch (error) {
        console.warn('Appwrite getProfileByUserId failed', error);
        return null;
    }
}

export async function upsertProfile(userId: string, input: ProfileUpsertInput): Promise<ProfileRecord | null> {
    try {
        // Check for existing profile first
        const existing = await getProfileByUserId(userId);

        if (existing) {
            // Update existing profile
            const payload = serializeProfileInput(input);
            const document = await databases.updateDocument<RawProfileDocument>(
                appwriteDatabaseId,
                appwriteProfileCollectionId,
                existing.id,
                payload
            );
            return toProfileRecord(document);
        }

        // Create new profile with all required fields
        const createPayload = {
            userId,
            fullName: input.fullName ?? '',
            role: input.role ?? 'user',
            college: input.college ?? '',
            university: input.university ?? '',
            programme: input.programme ?? '',
            graduationYear: parseInt(input.graduationYear || '0', 10),
            phone: input.phone ?? '',
            onboardingComplete: input.onboardingComplete ?? false,
        };

        const document = await databases.createDocument<RawProfileDocument>(
            appwriteDatabaseId,
            appwriteProfileCollectionId,
            ID.unique(),
            createPayload
        );

        return toProfileRecord(document);
    } catch (error) {
        console.error('Appwrite upsertProfile failed', error);

        // If creation failed due to duplicate, try to get the existing profile
        if (error && typeof error === 'object' && 'type' in error && error.type === 'document_already_exists') {
            console.log('Profile already exists, attempting to retrieve it');
            return await getProfileByUserId(userId);
        }

        // Return null on other errors
        return null;
    }
}

export const getCurrentUser = async (): Promise<AppwriteUser | null> => {
    try {
        return await account.get();
    } catch (error) {
        console.warn('Appwrite getCurrentUser failed', error);
        return null;
    }
};

export const signUpWithEmailPassword = (email: string, password: string, name?: string) =>
    account.create(ID.unique(), email, password, name);

export const signInWithEmailPassword = (email: string, password: string) =>
    account.createEmailPasswordSession(email, password);

export const signOutCurrentSession = () => account.deleteSession('current');

type PackageSelection = 'standard' | 'premium';

export interface DesignSubmissionInput {
    baseColor: string;
    stripeStyle: string;
    packageChoice: PackageSelection;
    quote: string;
    additionalNotes: string;
    consentAccepted: boolean;
    contact: {
        fullName: string;
        email: string;
        phone: string;
        course: string;
        graduationYear: string;
    };
}

export interface DesignSubmissionRecord extends DesignSubmissionInput {
    id: string;
    userId: string;
    createdAt: string;
}

type SubmissionStore = Record<string, DesignSubmissionRecord[]>;

const submissions: SubmissionStore = {};

const createId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `submission-${Math.random().toString(36).slice(2, 10)}`;
};

export async function saveDesignSubmission(userId: string, payload: DesignSubmissionInput) {
    const record: DesignSubmissionRecord = {
        id: createId(),
        userId,
        createdAt: new Date().toISOString(),
        ...payload,
    };

    if (!submissions[userId]) {
        submissions[userId] = [];
    }

    submissions[userId] = [record, ...submissions[userId]];

    console.info('Appwrite placeholder save', record);
    return record;
}

export async function listDesignSubmissionsByUser(userId: string) {
    return submissions[userId] ?? [];
}

export async function listAllDesignSubmissions() {
    return Object.values(submissions).flat();
}
