import { NNSOrderStatus } from '../lib/appwrite';

interface StatusBadgeProps {
    status: NNSOrderStatus;
    className?: string;
}

const statusConfig: Record<NNSOrderStatus, { label: string; colorClasses: string }> = {
    pending_review: {
        label: 'Pending Review',
        colorClasses: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    },
    in_design: {
        label: 'In Design',
        colorClasses: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    design_complete: {
        label: 'Design Complete',
        colorClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    awaiting_approval: {
        label: 'Awaiting Approval',
        colorClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    approved: {
        label: 'Approved',
        colorClasses: 'bg-green-500/20 text-green-300 border-green-500/40',
    },
    revision_requested: {
        label: 'Revision Requested',
        colorClasses: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
    in_production: {
        label: 'In Production',
        colorClasses: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    quality_check: {
        label: 'Quality Check',
        colorClasses: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    ready_for_pickup: {
        label: 'Ready for Pickup',
        colorClasses: 'bg-green-500/20 text-green-300 border-green-500/40',
    },
    out_for_delivery: {
        label: 'Out for Delivery',
        colorClasses: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    delivered: {
        label: 'Delivered',
        colorClasses: 'bg-green-500/20 text-green-300 border-green-500/40',
    },
    cancelled: {
        label: 'Cancelled',
        colorClasses: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    on_hold: {
        label: 'On Hold',
        colorClasses: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${config.colorClasses} ${className}`}
        >
            {config.label}
        </span>
    );
}
