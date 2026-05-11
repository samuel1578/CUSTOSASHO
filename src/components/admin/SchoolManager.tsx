import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Upload, Globe, Mail, Palette, Layers } from 'lucide-react';
import {
    SchoolRecord,
    listAllSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    uploadSchoolLogo
} from '../../lib/schools';

type ViewType = 'list' | 'edit' | 'create';

const AVAILABLE_FEATURES = [
    'consent',
    'iterations',
    'status-history',
    'design-brief',
    'college-hierarchy',
    'programme-selection',
    'installments'
];

export function SchoolManager() {
    const [schools, setSchools] = useState<SchoolRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewType>('list');
    const [selectedSchool, setSelectedSchool] = useState<SchoolRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<SchoolRecord>>({
        name: '',
        slug: '',
        portalType: 'nss-type',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        isActive: true,
        adminEmail: '',
        features: [],
        logoUrl: '',
        orderCollectionId: ''
    });

    useEffect(() => {
        loadSchools();
    }, []);

    const loadSchools = async () => {
        setLoading(true);
        const data = await listAllSchools();
        setSchools(data);
        setLoading(false);
    };

    const handleEdit = (school: SchoolRecord) => {
        setSelectedSchool(school);
        setFormData(school);
        setView('edit');
    };

    const handleCreate = () => {
        setSelectedSchool(null);
        setFormData({
            name: '',
            slug: '',
            portalType: 'nss-type',
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            isActive: true,
            adminEmail: '',
            features: [],
            logoUrl: '',
            orderCollectionId: ''
        });
        setView('create');
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadSchoolLogo(file);
            setFormData(prev => ({ ...prev, logoUrl: url }));
        } catch (error) {
            alert('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => {
            const features = prev.features || [];
            if (features.includes(feature)) {
                return { ...prev, features: features.filter(f => f !== feature) };
            } else {
                return { ...prev, features: [...features, feature] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (view === 'create') {
                await createSchool(formData as Omit<SchoolRecord, '$id' | 'createdAt' | 'updatedAt'>);
            } else if (view === 'edit' && selectedSchool) {
                await updateSchool(selectedSchool.$id, formData);
            }
            setView('list');
            loadSchools();
        } catch (error) {
            alert('Failed to save school');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (school: SchoolRecord) => {
        if (!window.confirm(`Are you sure you want to delete ${school.name}?`)) return;

        try {
            await deleteSchool(school.$id);
            loadSchools();
        } catch (error) {
            alert('Failed to delete school');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Loading schools...</div>;
    }

    if (view === 'list') {
        return (
            <div className="min-h-0 rounded-xl sm:rounded-2xl border border-border-subtle/40 bg-app-surface/70 p-4 sm:p-6 lg:p-8 backdrop-blur transition-colors">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-text-primary">School Management</h2>
                        <p className="text-sm text-text-secondary">Configure portals and branding for all institutions.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="btn-accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-text-inverted transition-transform hover:scale-105"
                    >
                        <Plus className="h-4 w-4" />
                        Add New School
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {schools.map(school => (
                        <div key={school.$id} className="group relative rounded-2xl border border-border-subtle/40 bg-app-surface/60 p-6 transition-all hover:border-accent-primary/40">
                            <div className="mb-4 flex items-center justify-between">
                                <div
                                    className="h-16 w-16 overflow-hidden rounded-xl border border-border-subtle/40 bg-white p-2"
                                    style={{ backgroundColor: !school.logoUrl ? school.primaryColor : 'white' }}
                                >
                                    {school.logoUrl ? (
                                        <img src={school.logoUrl} alt={school.name} className="h-full w-full object-contain" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/50">LOGO</div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${school.portalType === 'ug-type' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {school.portalType}
                                    </span>
                                    {['ug', 'nns'].includes(school.slug) && (
                                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-text-primary">{school.name}</h3>
                            <p className="text-xs text-text-secondary">Slug: {school.slug}</p>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${school.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-xs text-text-secondary">{school.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(school)}
                                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-app-elevated hover:text-accent-primary"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    {!['ug', 'nns'].includes(school.slug) && (
                                        <button
                                            onClick={() => handleDelete(school)}
                                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-app-elevated hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-0 rounded-xl sm:rounded-2xl border border-border-subtle/40 bg-app-surface/70 p-4 sm:p-6 lg:p-8 backdrop-blur transition-colors">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-text-primary">
                        {view === 'create' ? 'Create New School' : `Edit ${selectedSchool?.name}`}
                    </h2>
                    <p className="text-sm text-text-secondary">Define portal behavior and brand assets.</p>
                </div>
                <button onClick={() => setView('list')} className="text-text-secondary hover:text-text-primary">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/40 p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent-primary">
                            <Globe className="h-4 w-4" /> Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">School Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-lg border border-border-subtle/40 bg-app-surface py-2 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Slug</label>
                                <input
                                    type="text"
                                    required
                                    disabled={view === 'edit'}
                                    value={formData.slug}
                                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                    className="w-full rounded-lg border border-border-subtle/40 bg-app-surface py-2 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Portal Type</label>
                                <select
                                    value={formData.portalType}
                                    onChange={e => setFormData(prev => ({ ...prev, portalType: e.target.value }))}
                                    className="w-full rounded-lg border border-border-subtle/40 bg-app-surface py-2 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                                >
                                    <option value="nss-type">NSS Type (Custom Orders)</option>
                                    <option value="ug-type">UG Type (Submissions)</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Admin Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.adminEmail}
                                        onChange={e => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                                        className="w-full rounded-lg border border-border-subtle/40 bg-app-surface py-2 pl-10 pr-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 rounded border-border-subtle text-accent-primary"
                                />
                                <span className="text-sm text-text-primary">Is Portal Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/40 p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent-primary">
                            <Palette className="h-4 w-4" /> Branding & Assets
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Primary Color</label>
                                    <input
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={e => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="h-10 w-full cursor-pointer rounded-lg border border-border-subtle/40 bg-app-surface p-1"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Secondary Color</label>
                                    <input
                                        type="color"
                                        value={formData.secondaryColor}
                                        onChange={e => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                        className="h-10 w-full cursor-pointer rounded-lg border border-border-subtle/40 bg-app-surface p-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Logo Asset</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-border-subtle/40 bg-white p-2">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Preview" className="h-full w-full object-contain" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-text-secondary">No Logo</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-subtle/40 bg-app-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-app-elevated">
                                            <Upload className="h-4 w-4" />
                                            {uploading ? 'Uploading...' : 'Upload New Logo'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Features */}
                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/40 p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent-primary">
                            <Layers className="h-4 w-4" /> Enabled Features
                        </h3>
                        <div className="grid gap-3">
                            {AVAILABLE_FEATURES.map(feature => (
                                <label key={feature} className="flex items-center gap-3 cursor-pointer rounded-lg border border-border-subtle/20 bg-app-surface/40 p-3 transition-colors hover:bg-app-surface/60">
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.includes(feature)}
                                        onChange={() => toggleFeature(feature)}
                                        className="h-4 w-4 rounded border-border-subtle text-accent-primary"
                                    />
                                    <span className="text-sm font-medium capitalize text-text-primary">{feature.replace('-', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Order Config */}
                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/40 p-6">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent-primary">Data Configuration</h3>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-text-secondary">Order Collection ID</label>
                            <input
                                type="text"
                                value={formData.orderCollectionId}
                                onChange={e => setFormData(prev => ({ ...prev, orderCollectionId: e.target.value }))}
                                placeholder="appwrite_collection_id"
                                className="w-full rounded-lg border border-border-subtle/40 bg-app-surface py-2 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="btn-accent-gradient flex-1 rounded-lg py-3 text-sm font-bold text-text-inverted transition-transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : (view === 'create' ? 'Create School' : 'Save Changes')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className="flex-1 rounded-lg border border-border-subtle/40 bg-app-elevated/60 py-3 text-sm font-bold text-text-primary transition-colors hover:bg-app-elevated"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
