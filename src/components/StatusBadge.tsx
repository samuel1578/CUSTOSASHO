import { NNSOrderStatus } from '../lib/appwrite';

interface StatusBadgeProps {
    status: NNSOrderStatus;
    className?: string;
}

const statusConfig: Record<NNSOrderStatus, { label: string; colorClasses: string; glowStyle: string }> = {
    pending_review: {
        label: 'Pending Review',
        colorClasses: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        glowStyle: '0 0 8px 2px rgba(234,179,8,0.5)',
    },
    in_design: {
        label: 'In Design',
        colorClasses: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        glowStyle: '0 0 8px 2px rgba(59,130,246,0.5)',
    },
    design_complete: {
        label: 'Design Complete',
        colorClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        glowStyle: '0 0 8px 2px rgba(168,85,247,0.5)',
    },
    awaiting_approval: {
        label: 'Awaiting Approval',
        colorClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        glowStyle: '0 0 8px 2px rgba(168,85,247,0.5)',
    },
    approved: {
        label: 'Approved',
        colorClasses: 'bg-green-500/20 text-green-300 border-green-500/40',
        glowStyle: '0 0 8px 2px rgba(34,197,94,0.5)',
    },
    revision_requested: {
        label: 'Revision Requested',
        colorClasses: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        glowStyle: '0 0 8px 2px rgba(249,115,22,0.5)',
    },
    in_production: {
        label: 'In Production',
        colorClasses: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        glowStyle: '0 0 8px 2px rgba(59,130,246,0.5)',
    },
    quality_check: {
        label: 'Quality Check',
        colorClasses: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        glowStyle: '0 0 8px 2px rgba(99,102,241,0.5)',
    },
    ready_for_pickup: {
        label: 'Ready for Pickup',
        colorClasses: 'bg-green-500/20 text-green-300 border-green-500/40',
        glowStyle: '0 0 8px 2px rgba(34,197,94,0.6)',
    },
    out_for_delivery: {
        label: 'Out for Delivery',
        colorClasses: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        glowStyle: '0 0 8px 2px rgba(6,182,212,0.5)',
    },
    delivered: {
        label: 'Delivered',
        colorClasses: 'bg-green-500/20 text-green-300 border-green-500/40',
        glowStyle: '0 0 8px 2px rgba(34,197,94,0.6)',
    },
    cancelled: {
        label: 'Cancelled',
        colorClasses: 'bg-red-500/20 text-red-300 border-red-500/40',
        glowStyle: '0 0 8px 2px rgba(239,68,68,0.5)',
    },
    on_hold: {
        label: 'On Hold',
        colorClasses: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        glowStyle: '0 0 8px 2px rgba(249,115,22,0.5)',
    },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${config.colorClasses} ${className}`}
            style={{ boxShadow: config.glowStyle }}
        >
            {config.label}
        </span>
    );
}
