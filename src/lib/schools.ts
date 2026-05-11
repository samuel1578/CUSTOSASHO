import { Query, Models, ID } from 'appwrite';
import { databases, storage } from './appwrite';

const appwriteDatabaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const appwriteSchoolsCollectionId = import.meta.env.VITE_APPWRITE_SCHOOLS_COLLECTION_ID;
const appwriteSchoolAssetsBucketId = import.meta.env.VITE_APPWRITE_SCHOOL_ASSETS_BUCKET_ID;

export interface SchoolRecord {
    $id: string;
    slug: string;
    name: string;
    portalType: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    isActive: boolean;
    orderCollectionId: string;
    features: string[];
    adminEmail: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Internal type for raw Appwrite document mapping
 */
type RawSchoolDocument = Models.Document & {
    slug: string;
    name: string;
    portalType: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    isActive: boolean;
    orderCollectionId: string;
    features: string[];
    adminEmail: string;
};

/**
 * Maps a raw Appwrite document to the SchoolRecord interface
 */
const toSchoolRecord = (doc: RawSchoolDocument): SchoolRecord => ({
    $id: doc.$id,
    slug: doc.slug,
    name: doc.name,
    portalType: doc.portalType,
    logoUrl: doc.logoUrl,
    primaryColor: doc.primaryColor,
    secondaryColor: doc.secondaryColor,
    isActive: doc.isActive,
    orderCollectionId: doc.orderCollectionId,
    features: doc.features || [],
    adminEmail: doc.adminEmail,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
});

/**
 * Fetch all documents from the schools collection where isActive is true
 * Ordered by name ascending
 */
export async function listActiveSchools(): Promise<SchoolRecord[]> {
    if (!databases || !appwriteDatabaseId || !appwriteSchoolsCollectionId) {
        console.warn('Appwrite databases or configuration missing for schools');
        return [];
    }

    try {
        const result = await databases.listDocuments<RawSchoolDocument>(
            appwriteDatabaseId,
            appwriteSchoolsCollectionId,
            [
                Query.equal('isActive', true),
                Query.orderAsc('name'),
            ]
        );

        return result.documents.map(toSchoolRecord);
    } catch (error) {
        console.error('Failed to list active schools:', error);
        return [];
    }
}

/**
 * Query the schools collection for a document where slug matches
 */
export async function getSchoolBySlug(slug: string): Promise<SchoolRecord | null> {
    if (!databases || !appwriteDatabaseId || !appwriteSchoolsCollectionId) {
        return null;
    }

    try {
        const result = await databases.listDocuments<RawSchoolDocument>(
            appwriteDatabaseId,
            appwriteSchoolsCollectionId,
            [
                Query.equal('slug', slug),
                Query.limit(1),
            ]
        );

        const doc = result.documents[0];
        return doc ? toSchoolRecord(doc) : null;
    } catch (error) {
        console.error(`Failed to get school by slug: ${slug}`, error);
        return null;
    }
}

/**
 * Query the schools collection for a document where name matches exactly
 * Backward compatibility for profile.university field
 */
export async function getSchoolByName(name: string): Promise<SchoolRecord | null> {
    if (!databases || !appwriteDatabaseId || !appwriteSchoolsCollectionId) {
        return null;
    }

    try {
        const result = await databases.listDocuments<RawSchoolDocument>(
            appwriteDatabaseId,
            appwriteSchoolsCollectionId,
            [
                Query.equal('name', name),
                Query.limit(1),
            ]
        );

        const doc = result.documents[0];
        return doc ? toSchoolRecord(doc) : null;
    } catch (error) {
        console.error(`Failed to get school by name: ${name}`, error);
        return null;
    }
}

/**
 * Fetches ALL schools regardless of isActive
 */
export async function listAllSchools(): Promise<SchoolRecord[]> {
    if (!databases || !appwriteDatabaseId || !appwriteSchoolsCollectionId) {
        return [];
    }
    try {
        const result = await databases.listDocuments<RawSchoolDocument>(
            appwriteDatabaseId,
            appwriteSchoolsCollectionId,
            [Query.orderAsc('name')]
        );
        return result.documents.map(toSchoolRecord);
    } catch (error) {
        console.error('Failed to list all schools:', error);
        return [];
    }
}

/**
 * Creates a new document in the schools collection
 */
export async function createSchool(data: Omit<SchoolRecord, '$id' | 'createdAt' | 'updatedAt'>): Promise<SchoolRecord | null> {
    if (!databases || !appwriteDatabaseId || !appwriteSchoolsCollectionId) {
        return null;
    }
    try {
        const document = await databases.createDocument<RawSchoolDocument>(
            appwriteDatabaseId,
            appwriteSchoolsCollectionId,
            ID.unique(),
            data
        );
        return toSchoolRecord(document);
    } catch (error) {
        console.error('Failed to create school:', error);
        return null;
    }
}

/**
 * Updates an existing schools document by $id
 */
export async function updateSchool(id: string, data: Partial<SchoolRecord>): Promise<SchoolRecord | null> {
    if (!databases || !appwriteDatabaseId || !appwriteSchoolsCollectionId) {
        return null;
    }
    try {
        const document = await databases.updateDocument<RawSchoolDocument>(
            appwriteDatabaseId,
            appwriteSchoolsCollectionId,
            id,
            data
        );
        return toSchoolRecord(document);
    } catch (error) {
        console.error('Failed to update school:', error);
        return null;
    }
}

/**
 * Deletes a schools document by $id
 */
export async function deleteSchool(id: string): Promise<void> {
    if (!databases || !appwriteDatabaseId || !appwriteSchoolsCollectionId) {
        return;
    }
    try {
        await databases.deleteDocument(appwriteDatabaseId, appwriteSchoolsCollectionId, id);
    } catch (error) {
        console.error('Failed to delete school:', error);
        throw error;
    }
}

/**
 * Uploads a file to VITE_APPWRITE_SCHOOL_ASSETS_BUCKET_ID
 */
export async function uploadSchoolLogo(file: File): Promise<string> {
    if (!storage || !appwriteSchoolAssetsBucketId) {
        throw new Error('Storage or Bucket ID not configured');
    }
    try {
        const result = await storage.createFile(appwriteSchoolAssetsBucketId, ID.unique(), file);
        const url = storage.getFileView(appwriteSchoolAssetsBucketId, result.$id);
        return url.toString();
    } catch (error) {
        console.error('Failed to upload school logo:', error);
        throw error;
    }
}
