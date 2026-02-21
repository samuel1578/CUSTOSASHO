import { Account, Client, Databases, ID, Models, Query, Teams } from 'appwrite';

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
export const teams = client ? new Teams(client) : null;

export type AppwriteUser = Models.User<Models.Preferences>;

type RawProfileDocument = Models.Document & {
    userId: string;
    fullName?: string;
    role?: string;
    college?: string | null;
    university?: string | null;
    programme?: string | null;
    course?: string | null; // For schools that use text input instead of programme dropdown
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
    course: string | null; // For schools that use text input instead of programme dropdown
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
    course?: string | null; // For schools that use text input instead of programme dropdown
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
    course: document.course ?? null,
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
    ...(input.course !== undefined ? { course: input.course } : {}),
    ...(input.graduationYear !== undefined ? { graduationYear: parseInt(input.graduationYear || '0', 10) } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.onboardingComplete !== undefined ? { onboardingComplete: input.onboardingComplete } : {}),
});

export async function getProfileByUserId(userId: string): Promise<ProfileRecord | null> {
    if (!databases) return null;
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
    if (!databases) return null;
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
            course: input.course ?? '',
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
    if (!account) return null;
    try {
        return await account.get();
    } catch (error) {
        console.warn('Appwrite getCurrentUser failed', error);
        return null;
    }
};

export const signUpWithEmailPassword = (email: string, password: string, name?: string) => {
    if (!account) throw new Error('Appwrite account not initialized');
    return account.create(ID.unique(), email, password, name);
};

export const signInWithEmailPassword = (email: string, password: string) => {
    if (!account) throw new Error('Appwrite account not initialized');
    return account.createEmailPasswordSession(email, password);
};

export const signOutCurrentSession = () => {
    if (!account) throw new Error('Appwrite account not initialized');
    return account.deleteSession('current');
};

type PackageSelection = 'standard' | 'premium';

export interface DesignSubmissionInput {
    baseColor: string;
    packageChoice: PackageSelection;
    quote: string;
    additionalNotes: string;
    consentAccepted: boolean;
    graduatingClass?: string;
    facultyLogo?: string;
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

// ============================================
// NNS ORDERS TYPES & INTERFACES
// ============================================

const appwriteNNSOrdersCollectionId = import.meta.env.VITE_APPWRITE_NNS_ORDERS_COLLECTION_ID;

if (import.meta.env.PROD && !appwriteNNSOrdersCollectionId) {
    console.error('Missing Appwrite NNS Orders collection ID');
}

export type NNSOrderStatus =
    | 'pending_review'
    | 'in_design'
    | 'design_complete'
    | 'awaiting_approval'
    | 'approved'
    | 'revision_requested'
    | 'in_production'
    | 'quality_check'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'on_hold';

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type DeliveryMethod = 'pickup' | 'delivery' | 'courier';
export type ConsentStatus = 'pending' | 'granted' | 'withdrawn';

export interface StatusHistoryEntry {
    status: NNSOrderStatus;
    timestamp: string;
    updatedBy: string;
    updatedByName?: string;
    note?: string;
}

export interface DesignIteration {
    version: number;
    timestamp: string;
    designerNotes: string;
    fileUrls: string[];
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface CustomerFeedbackEntry {
    timestamp: string;
    message: string;
    type: 'approval' | 'revision' | 'comment';
    attachments?: string[];
}

type RawNNSOrderDocument = Models.Document & {
    userId: string;
    fullName: string;
    email: string;
    phone?: string | null;
    course: string;
    school: string;
    graduationYear?: string | null;
    designBrief: string;
    price: number;
    status: NNSOrderStatus;
    statusHistory?: string | null;
    submittedAt: string;
    lastStatusUpdate?: string | null;
    designIterations?: string | null;
    customerFeedback?: string | null;
    currentIteration?: number | null;
    designerNotes?: string | null;
    assignedTo?: string | null;
    assignedToName?: string | null;
    priority?: OrderPriority | null;
    adminNotes?: string | null;
    internalTags?: string | null;
    paymentStatus?: PaymentStatus | null;
    paymentMethod?: string | null;
    paidAt?: string | null;
    deliveryMethod?: DeliveryMethod | null;
    trackingNumber?: string | null;
    deliveredAt?: string | null;
    consentStatus?: ConsentStatus | null;
    consentGrantedAt?: string | null;
    deadline?: string | null;
};

export interface NNSOrderRecord {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string | null;
    course: string;
    school: string;
    graduationYear: string | null;
    designBrief: string;
    price: number;
    status: NNSOrderStatus;
    statusHistory: StatusHistoryEntry[];
    submittedAt: string;
    lastStatusUpdate: string | null;
    designIterations: DesignIteration[];
    customerFeedback: CustomerFeedbackEntry[];
    currentIteration: number;
    designerNotes: string | null;
    assignedTo: string | null;
    assignedToName: string | null;
    priority: OrderPriority;
    adminNotes: string | null;
    internalTags: string[];
    paymentStatus: PaymentStatus;
    paymentMethod: string | null;
    paidAt: string | null;
    deliveryMethod: DeliveryMethod;
    trackingNumber: string | null;
    deliveredAt: string | null;
    consentStatus: ConsentStatus;
    consentGrantedAt: string | null;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NNSOrderCreateInput {
    fullName: string;
    email: string;
    phone?: string;
    course: string;
    graduationYear?: string;
    designBrief: string;
}

export interface NNSOrderUpdateInput {
    fullName?: string;
    phone?: string;
    course?: string;
    graduationYear?: string;
    designBrief?: string;
    price?: number;
    status?: NNSOrderStatus;
    designerNotes?: string;
    assignedTo?: string;
    assignedToName?: string;
    priority?: OrderPriority;
    adminNotes?: string;
    paymentStatus?: PaymentStatus;
    paymentMethod?: string;
    paidAt?: string;
    deliveryMethod?: DeliveryMethod;
    trackingNumber?: string;
    deadline?: string;
}

export interface NNSOrderStatusUpdateInput {
    status: NNSOrderStatus;
    note?: string;
    updatedBy: string;
    updatedByName?: string;
}

export interface AddDesignIterationInput {
    designerNotes: string;
    fileUrls: string[];
    status: 'draft' | 'submitted';
}

export interface AddCustomerFeedbackInput {
    message: string;
    type: 'approval' | 'revision' | 'comment';
    attachments?: string[];
}

// Helper to parse JSON fields safely
const parseJsonField = <T>(field: string | null | undefined, defaultValue: T): T => {
    if (!field) return defaultValue;
    try {
        return JSON.parse(field) as T;
    } catch {
        return defaultValue;
    }
};

// Transform raw Appwrite document to typed NNSOrderRecord
const toNNSOrderRecord = (document: RawNNSOrderDocument): NNSOrderRecord => ({
    id: document.$id,
    userId: document.userId,
    fullName: document.fullName,
    email: document.email,
    phone: document.phone ?? null,
    course: document.course,
    school: document.school,
    graduationYear: document.graduationYear ?? null,
    designBrief: document.designBrief,
    price: document.price,
    status: document.status,
    statusHistory: parseJsonField<StatusHistoryEntry[]>(document.statusHistory, []),
    submittedAt: document.submittedAt,
    lastStatusUpdate: document.lastStatusUpdate ?? null,
    designIterations: parseJsonField<DesignIteration[]>(document.designIterations, []),
    customerFeedback: parseJsonField<CustomerFeedbackEntry[]>(document.customerFeedback, []),
    currentIteration: document.currentIteration ?? 0,
    designerNotes: document.designerNotes ?? null,
    assignedTo: document.assignedTo ?? null,
    assignedToName: document.assignedToName ?? null,
    priority: document.priority ?? 'normal',
    adminNotes: document.adminNotes ?? null,
    internalTags: parseJsonField<string[]>(document.internalTags, []),
    paymentStatus: document.paymentStatus ?? 'pending',
    paymentMethod: document.paymentMethod ?? null,
    paidAt: document.paidAt ?? null,
    deliveryMethod: document.deliveryMethod ?? 'pickup',
    trackingNumber: document.trackingNumber ?? null,
    deliveredAt: document.deliveredAt ?? null,
    consentStatus: document.consentStatus ?? 'pending',
    consentGrantedAt: document.consentGrantedAt ?? null,
    deadline: document.deadline ?? null,
    createdAt: document.$createdAt,
    updatedAt: document.$updatedAt,
});

// Serialize update input for Appwrite (only include defined fields)
const serializeNNSOrderUpdate = (input: NNSOrderUpdateInput) => {
    const payload: Record<string, any> = {};

    if (input.fullName !== undefined) payload.fullName = input.fullName;
    if (input.phone !== undefined) payload.phone = input.phone;
    if (input.course !== undefined) payload.course = input.course;
    if (input.graduationYear !== undefined) payload.graduationYear = input.graduationYear;
    if (input.designBrief !== undefined) payload.designBrief = input.designBrief;
    if (input.price !== undefined) payload.price = input.price;
    if (input.status !== undefined) payload.status = input.status;
    if (input.designerNotes !== undefined) payload.designerNotes = input.designerNotes;
    if (input.assignedTo !== undefined) payload.assignedTo = input.assignedTo;
    if (input.assignedToName !== undefined) payload.assignedToName = input.assignedToName;
    if (input.priority !== undefined) payload.priority = input.priority;
    if (input.adminNotes !== undefined) payload.adminNotes = input.adminNotes;
    if (input.paymentStatus !== undefined) payload.paymentStatus = input.paymentStatus;
    if (input.paymentMethod !== undefined) payload.paymentMethod = input.paymentMethod;
    if (input.paidAt !== undefined) payload.paidAt = input.paidAt;
    if (input.deliveryMethod !== undefined) payload.deliveryMethod = input.deliveryMethod;
    if (input.trackingNumber !== undefined) payload.trackingNumber = input.trackingNumber;
    if (input.deadline !== undefined) payload.deadline = input.deadline;

    return payload;
};

// ============================================
// NNS ORDERS - CRUD OPERATIONS
// ============================================

/**
 * Create a new NNS custom stole order
 */
export async function createNNSOrder(
    userId: string,
    input: NNSOrderCreateInput
): Promise<NNSOrderRecord | null> {
    if (!databases) return null;
    try {
        const now = new Date().toISOString();

        const initialStatusHistory: StatusHistoryEntry = {
            status: 'pending_review',
            timestamp: now,
            updatedBy: userId,
            note: 'Order submitted',
        };

        const payload = {
            userId,
            fullName: input.fullName,
            email: input.email,
            phone: input.phone ?? '',
            course: input.course,
            school: 'New Nation School',
            graduationYear: input.graduationYear ?? '',
            designBrief: input.designBrief,
            price: 120,
            status: 'pending_review' as NNSOrderStatus,
            statusHistory: JSON.stringify([initialStatusHistory]),
            submittedAt: now,
            lastStatusUpdate: now,
            designIterations: JSON.stringify([]),
            customerFeedback: JSON.stringify([]),
            currentIteration: 0,
            designerNotes: '',
            assignedTo: '',
            assignedToName: '',
            priority: 'normal' as OrderPriority,
            adminNotes: '',
            internalTags: JSON.stringify([]),
            paymentStatus: 'pending' as PaymentStatus,
            paymentMethod: '',
            paidAt: '',
            deliveryMethod: 'pickup' as DeliveryMethod,
            trackingNumber: '',
            deliveredAt: '',
            consentStatus: 'pending' as ConsentStatus,
            consentGrantedAt: '',
        };

        const document = await databases.createDocument<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            ID.unique(),
            payload
        );

        return toNNSOrderRecord(document);
    } catch (error) {
        console.error('Failed to create NNS order:', error);
        return null;
    }
}

/**
 * Get a single NNS order by ID
 */
export async function getNNSOrderById(orderId: string): Promise<NNSOrderRecord | null> {
    if (!databases) return null;
    try {
        const document = await databases.getDocument<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            orderId
        );

        return toNNSOrderRecord(document);
    } catch (error) {
        console.error('Failed to get NNS order:', error);
        return null;
    }
}

/**
 * List all NNS orders for a specific user
 */
export async function listNNSOrdersByUser(
    userId: string,
    limit: number = 25,
    offset: number = 0
): Promise<NNSOrderRecord[]> {
    if (!databases) return [];
    try {
        const result = await databases.listDocuments<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            [
                Query.equal('userId', userId),
                Query.orderDesc('submittedAt'),
                Query.limit(limit),
                Query.offset(offset),
            ]
        );

        return result.documents.map(toNNSOrderRecord);
    } catch (error) {
        console.error('Failed to list NNS orders by user:', error);
        return [];
    }
}

/**
 * List all NNS orders (for admin dashboard) - supports both call patterns
 */
export async function listAllNNSOrders(
    filtersOrLimit?: {
        status?: NNSOrderStatus;
        priority?: OrderPriority;
        assignedTo?: string;
        paymentStatus?: PaymentStatus;
    } | number,
    limitOrOffset?: number,
    offset?: number
): Promise<NNSOrderRecord[]> {
    if (!databases) return [];
    try {
        // Handle overload: if first param is number, it's limit
        let filters: any = {};
        let limit = 50;
        let offsetValue = 0;

        if (typeof filtersOrLimit === 'number') {
            limit = filtersOrLimit;
            offsetValue = limitOrOffset ?? 0;
        } else {
            filters = filtersOrLimit ?? {};
            limit = limitOrOffset ?? 50;
            offsetValue = offset ?? 0;
        }

        const queries: string[] = [
            Query.orderDesc('submittedAt'),
            Query.limit(limit),
            Query.offset(offsetValue),
        ];

        if (filters?.status) {
            queries.push(Query.equal('status', filters.status));
        }
        if (filters?.priority) {
            queries.push(Query.equal('priority', filters.priority));
        }
        if (filters?.assignedTo) {
            queries.push(Query.equal('assignedTo', filters.assignedTo));
        }
        if (filters?.paymentStatus) {
            queries.push(Query.equal('paymentStatus', filters.paymentStatus));
        }

        const result = await databases.listDocuments<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            queries
        );

        return result.documents.map(toNNSOrderRecord);
    } catch (error) {
        console.error('Failed to list all NNS orders:', error);
        return [];
    }
}

/**
 * Update NNS order status with history tracking
 */
export async function updateNNSOrderStatus(
    orderId: string,
    statusUpdate: NNSOrderStatusUpdateInput
): Promise<NNSOrderRecord | null> {
    if (!databases) return null;
    try {
        const currentOrder = await getNNSOrderById(orderId);
        if (!currentOrder) {
            throw new Error('Order not found');
        }

        const now = new Date().toISOString();

        const newHistoryEntry: StatusHistoryEntry = {
            status: statusUpdate.status,
            timestamp: now,
            updatedBy: statusUpdate.updatedBy,
            updatedByName: statusUpdate.updatedByName,
            note: statusUpdate.note,
        };

        const updatedHistory = [...currentOrder.statusHistory, newHistoryEntry];

        const payload = {
            status: statusUpdate.status,
            statusHistory: JSON.stringify(updatedHistory),
            lastStatusUpdate: now,
        };

        const document = await databases.updateDocument<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            orderId,
            payload
        );

        return toNNSOrderRecord(document);
    } catch (error) {
        console.error('Failed to update NNS order status:', error);
        return null;
    }
}

/**
 * Update NNS order fields (for admin)
 */
export async function updateNNSOrder(
    orderId: string,
    input: NNSOrderUpdateInput
): Promise<NNSOrderRecord | null> {
    if (!databases) return null;
    try {
        const payload = serializeNNSOrderUpdate(input);

        if (input.status !== undefined) {
            payload.lastStatusUpdate = new Date().toISOString();
        }

        const document = await databases.updateDocument<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            orderId,
            payload
        );

        return toNNSOrderRecord(document);
    } catch (error) {
        console.error('Failed to update NNS order:', error);
        return null;
    }
}

/**
 * Add a design iteration to an order
 */
export async function addDesignIteration(
    orderId: string,
    input: AddDesignIterationInput
): Promise<NNSOrderRecord | null> {
    if (!databases) return null;
    try {
        const currentOrder = await getNNSOrderById(orderId);
        if (!currentOrder) {
            throw new Error('Order not found');
        }

        const newVersion = currentOrder.currentIteration + 1;

        const newIteration: DesignIteration = {
            version: newVersion,
            timestamp: new Date().toISOString(),
            designerNotes: input.designerNotes,
            fileUrls: input.fileUrls,
            status: input.status,
        };

        const updatedIterations = [...currentOrder.designIterations, newIteration];

        const payload = {
            designIterations: JSON.stringify(updatedIterations),
            currentIteration: newVersion,
            status: input.status === 'submitted' ? 'awaiting_approval' : currentOrder.status,
        };

        const document = await databases.updateDocument<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            orderId,
            payload
        );

        return toNNSOrderRecord(document);
    } catch (error) {
        console.error('Failed to add design iteration:', error);
        return null;
    }
}

/**
 * Add customer feedback to an order
 */
export async function addCustomerFeedback(
    orderId: string,
    input: AddCustomerFeedbackInput
): Promise<NNSOrderRecord | null> {
    if (!databases) return null;
    try {
        const currentOrder = await getNNSOrderById(orderId);
        if (!currentOrder) {
            throw new Error('Order not found');
        }

        const newFeedback: CustomerFeedbackEntry = {
            timestamp: new Date().toISOString(),
            message: input.message,
            type: input.type,
            attachments: input.attachments,
        };

        const updatedFeedback = [...currentOrder.customerFeedback, newFeedback];

        let newStatus = currentOrder.status;
        if (input.type === 'approval') {
            newStatus = 'approved';
        } else if (input.type === 'revision') {
            newStatus = 'revision_requested';
        }

        const payload = {
            customerFeedback: JSON.stringify(updatedFeedback),
            ...(newStatus !== currentOrder.status ? { status: newStatus } : {}),
        };

        const document = await databases.updateDocument<RawNNSOrderDocument>(
            appwriteDatabaseId,
            appwriteNNSOrdersCollectionId,
            orderId,
            payload
        );

        return toNNSOrderRecord(document);
    } catch (error) {
        console.error('Failed to add customer feedback:', error);
        return null;
    }
}

/**
 * Get order count by status (for admin dashboard analytics)
 */
export async function getNNSOrderStatusCounts(): Promise<Record<NNSOrderStatus, number>> {
    try {
        const allOrders = await listAllNNSOrders({}, 1000, 0);

        const counts: Record<string, number> = {};
        allOrders.forEach((order) => {
            counts[order.status] = (counts[order.status] || 0) + 1;
        });

        return counts as Record<NNSOrderStatus, number>;
    } catch (error) {
        console.error('Failed to get status counts:', error);
        return {} as Record<NNSOrderStatus, number>;
    }
}

/**
 * Grant consent for all user's NNS orders
 * Updates all pending consent orders to granted status
 */
export async function grantNNSConsent(userId: string): Promise<boolean> {
    if (!databases) return false;
    try {
        // Get all user's orders with pending consent
        const userOrders = await listNNSOrdersByUser(userId, 1000, 0);
        const pendingConsentOrders = userOrders.filter(order => order.consentStatus === 'pending');

        if (pendingConsentOrders.length === 0) {
            console.log('No pending consent orders found for user');
            return true; // Already granted or no orders
        }

        const now = new Date().toISOString();

        // Update each order with granted consent
        const updatePromises = pendingConsentOrders.map(order =>
            databases.updateDocument<RawNNSOrderDocument>(
                appwriteDatabaseId,
                appwriteNNSOrdersCollectionId,
                order.id,
                {
                    consentStatus: 'granted' as ConsentStatus,
                    consentGrantedAt: now,
                }
            )
        );

        await Promise.all(updatePromises);

        console.log(`Granted consent for ${pendingConsentOrders.length} orders`);
        return true;
    } catch (error) {
        console.error('Failed to grant NNS consent:', error);
        return false;
    }
}

/**
 * Check if user has granted consent for NNS orders
 */
export async function hasNNSConsent(userId: string): Promise<boolean> {
    try {
        const userOrders = await listNNSOrdersByUser(userId, 1, 0);

        if (userOrders.length === 0) {
            return false; // No orders yet
        }

        // Check if any order has granted consent
        return userOrders.some(order => order.consentStatus === 'granted');
    } catch (error) {
        console.error('Failed to check NNS consent:', error);
        return false;
    }
}

/**
 * Check if current user is member of admin team
 */
export async function isUserInAdminTeam(): Promise<boolean> {
    if (!teams) return false;

    try {
        const teamsList = await teams.list();

        // Check if user is in any team named "admin" (case-insensitive)
        const adminTeam = teamsList.teams.find(
            team => team.name.toLowerCase() === 'admin'
        );

        return !!adminTeam;
    } catch (error) {
        console.error('Error checking admin team membership:', error);
        return false;
    }
}
