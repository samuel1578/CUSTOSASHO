import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { SchoolRecord, getSchoolByName } from '../lib/schools';
import { useAuth } from './AuthContext';

interface TenantContextType {
    tenantConfig: SchoolRecord | null;
    tenantLoading: boolean;
    isNSSType: boolean;
    isUGType: boolean;
    refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [tenantConfig, setTenantConfig] = useState<SchoolRecord | null>(null);
    const [tenantLoading, setTenantLoading] = useState(false);

    const fetchTenant = useCallback(async () => {
        if (!profile?.university) {
            setTenantConfig(null);
            setTenantLoading(false);
            return;
        }

        setTenantLoading(true);
        try {
            const config = await getSchoolByName(profile.university);
            if (!config) {
                console.warn(`Tenant configuration not found for school: ${profile.university}`);
            }
            setTenantConfig(config);
        } catch (error) {
            console.error('Error fetching tenant config:', error);
            setTenantConfig(null);
        } finally {
            setTenantLoading(false);
        }
    }, [profile?.university]);

    useEffect(() => {
        fetchTenant();
    }, [fetchTenant]);

    const value = useMemo(() => ({
        tenantConfig,
        tenantLoading,
        isNSSType: tenantConfig?.portalType === 'nss-type',
        isUGType: tenantConfig?.portalType === 'ug-type',
        refreshTenant: fetchTenant
    }), [tenantConfig, tenantLoading, fetchTenant]);

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
