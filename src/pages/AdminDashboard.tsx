import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Layers,
  ShieldCheck,
  Users,
  Search,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  X,
  Copy,
  Mail,
  Printer,
  AlertTriangle,
  Calendar,
  Image,
  Settings
} from 'lucide-react';
import {
  DesignSubmissionRecord,
  listAllDesignSubmissions,
  NNSOrderRecord,
  listAllNNSOrders,
  updateNNSOrderStatus,
  updateNNSOrder,
  NNSOrderStatus,
  OrderPriority,
  PaymentStatus,
  DeliveryMethod,
  NNSOrderUpdateInput
} from '../lib/appwrite';
import {
  copyToClipboard,
  isDeadlineOverdue,
  isDeadlineApproaching,
  formatDeadline,
  printOrderDetails,
  generateStatusUpdateEmail,
  setScrollLock
} from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import GalleryManager from '../components/GalleryManager';
import { SchoolManager } from '../components/admin/SchoolManager';

type TabType = 'ug' | 'nns' | 'gallery' | 'schools';

const statusLabels: Record<NNSOrderStatus, string> = {
  pending_review: 'Pending Review',
  in_design: 'In Design',
  design_complete: 'Design Complete',
  awaiting_approval: 'Awaiting Approval',
  approved: 'Approved',
  revision_requested: 'Revision Requested',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  ready_for_pickup: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
};

const statusColors: Record<NNSOrderStatus, string> = {
  pending_review: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  in_design: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  design_complete: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  awaiting_approval: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  approved: 'bg-green-500/20 text-green-600 dark:text-green-400',
  revision_requested: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  in_production: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  quality_check: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
  ready_for_pickup: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
  out_for_delivery: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  delivered: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
  on_hold: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
};

const StatusBadge = ({ status }: { status: NNSOrderStatus }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[status]}`}>
    {statusLabels[status]}
  </span>
);

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('ug');
  const [submissions, setSubmissions] = useState<DesignSubmissionRecord[]>([]);
  const [nnsOrders, setNnsOrders] = useState<NNSOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<NNSOrderStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<OrderPriority | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<NNSOrderRecord | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const facultyLabelMap: Record<string, string> = {
    science: 'Science Faculty Logo',
    engineering: 'Engineering Faculty Logo',
    business: 'Business Faculty Logo',
    arts: 'Arts Faculty Logo',
  };

  useEffect(() => {
    if (showOrderModal) {
      setScrollLock(true);
    } else {
      setScrollLock(false);
    }
    return () => setScrollLock(false);
  }, [showOrderModal]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ugRecords, nnsRecords] = await Promise.all([
        listAllDesignSubmissions(),
        listAllNNSOrders(1000, 0),
      ]);
      setSubmissions(ugRecords);
      setNnsOrders(nnsRecords);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNNSOrders = useMemo(() => {
    return nnsOrders.filter(order => {
      const matchesSearch = !searchQuery ||
        order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.course.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesPriority = !priorityFilter || order.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [nnsOrders, searchQuery, statusFilter, priorityFilter]);

  const ugStats = {
    totalSubmissions: submissions.length,
    consented: submissions.filter((record) => record.consentAccepted).length,
    standardCount: submissions.filter((record) => record.packageChoice === 'standard').length,
    premiumInterest: submissions.filter((record) => record.packageChoice === 'premium').length,
  };

  const nnsStats = {
    totalOrders: nnsOrders.length,
    activeOrders: nnsOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
    revenue: nnsOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.price, 0),
    inProduction: nnsOrders.filter(o => o.status === 'in_production').length,
  };

  const handleOrderClick = (order: NNSOrderRecord) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: NNSOrderStatus) => {
    if (!user) return;

    const updated = await updateNNSOrderStatus(orderId, {
      status: newStatus,
      updatedBy: user.$id,
      updatedByName: user.name,
      note: `Status changed to ${statusLabels[newStatus]}`,
    });

    if (updated) {
      setNnsOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  const handleOrderUpdate = async (orderId: string, updates: NNSOrderUpdateInput) => {
    const updated = await updateNNSOrder(orderId, updates);

    if (updated) {
      setNnsOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  // Quick Action Handlers
  const handleCopyText = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setToast({ message: `${label} copied to clipboard!`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ message: 'Failed to copy to clipboard', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleMarkAsPaid = async (order: NNSOrderRecord) => {
    const updated = await updateNNSOrder(order.id, {
      paymentStatus: 'paid' as PaymentStatus,
      paidAt: new Date().toISOString(),
    });

    if (updated) {
      setNnsOrders(prev => prev.map(o => o.id === order.id ? updated : o));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(updated);
      }
      setToast({ message: 'Order marked as paid!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ message: 'Failed to update payment status', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSendStatusEmail = (order: NNSOrderRecord) => {
    const emailBody = generateStatusUpdateEmail(order, order.status);
    const mailtoLink = `mailto:${order.email}?subject=Order Status Update - ${order.fullName}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  const handlePrintOrder = (order: NNSOrderRecord) => {
    printOrderDetails(order);
  };

  const handleSetDeadline = async (orderId: string, deadline: string) => {
    const updated = await updateNNSOrder(orderId, { deadline });

    if (updated) {
      setNnsOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      setToast({ message: 'Deadline updated successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ message: 'Failed to update deadline', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-app-base text-text-primary transition-colors">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-app-base pt-20 sm:pt-28 pb-16 text-text-primary transition-colors">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-accent-primary break-words">Admin Dashboard</h1>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base text-text-secondary">
            Manage all platform operations: UG submissions and NNS custom orders.
          </p>

          {/* Tab Navigation */}
          <div className="mb-6 sm:mb-8 flex gap-2 sm:gap-4 border-b border-border-subtle/40 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ug')}
              className={`pb-3 sm:pb-4 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'ug'
                ? 'text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              UG Submissions ({submissions.length})
              {activeTab === 'ug' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-3 sm:pb-4 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'gallery'
                ? 'text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              Gallery
              {activeTab === 'gallery' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('nns')}
              className={`pb-3 sm:pb-4 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'nns'
                ? 'text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              NNS Orders ({nnsOrders.length})
              {activeTab === 'nns' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`pb-3 sm:pb-4 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'schools'
                ? 'text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              Schools
              {activeTab === 'schools' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                />
              )}
            </button>
          </div>

          {/* Stats Cards */}
          {activeTab === 'ug' ? (
            <div className="mb-8 sm:mb-12 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Users, label: 'Total Journeys', value: ugStats.totalSubmissions },
                { icon: ShieldCheck, label: 'Consent Granted', value: ugStats.consented },
                { icon: Layers, label: 'Standard Requests', value: ugStats.standardCount },
                { icon: FileText, label: 'Premium Interest', value: ugStats.premiumInterest },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-surface/60 p-3 sm:p-6 backdrop-blur transition-colors"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-primary" />
                  </div>
                  <p className="mb-1 text-xl sm:text-3xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          ) : activeTab === 'gallery' ? (
            <div className="mb-8 sm:mb-12 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Image, label: 'Gallery Images', value: 'Managed Below' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-surface/60 p-3 sm:p-6 backdrop-blur transition-colors"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-primary" />
                  </div>
                  <p className="mb-1 text-xl sm:text-3xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mb-8 sm:mb-12 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Package, label: 'Total Orders', value: nnsStats.totalOrders },
                { icon: Clock, label: 'Active Orders', value: nnsStats.activeOrders },
                { icon: DollarSign, label: 'Revenue', value: `¢${nnsStats.revenue}` },
                { icon: Truck, label: 'In Production', value: nnsStats.inProduction },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-surface/60 p-3 sm:p-6 backdrop-blur transition-colors"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-primary" />
                  </div>
                  <p className="mb-1 text-xl sm:text-3xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Content Area */}
          {activeTab === 'ug' ? (
            <div className="min-h-0 rounded-xl sm:rounded-2xl border border-border-subtle/40 bg-app-surface/70 p-4 sm:p-6 lg:p-8 backdrop-blur transition-colors">
              <h2 className="mb-2 text-2xl font-semibold text-text-primary">Design Journeys</h2>
              <p className="mb-8 text-sm text-text-secondary">
                These records sync directly from the full-screen designer. Use them to brief artisans, follow up with graduates, and plan production.
              </p>

              {submissions.length === 0 ? (
                <div className="py-12 text-center">
                  <Layers className="mx-auto mb-4 h-16 w-16 text-text-secondary/60" />
                  <p className="text-text-secondary">No design journeys have been captured yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map((submission) => (
                    <motion.div
                      key={submission.id}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-xl sm:rounded-2xl border border-border-subtle/40 bg-app-surface/60 p-4 sm:p-6 transition-colors hover:border-accent-primary/40"
                    >
                      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent-primary">
                            Captured {new Date(submission.createdAt).toLocaleString()}
                          </p>
                          <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-text-primary break-words">{submission.contact.fullName}</h3>
                          <p className="mt-1 text-xs sm:text-sm text-text-secondary break-all">
                            {submission.contact.email}
                            {submission.contact.phone ? ` · ${submission.contact.phone}` : ''}
                          </p>
                        </div>
                        <div className="rounded-lg sm:rounded-xl border border-border-subtle/50 bg-app-elevated/70 px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-text-secondary/70 self-start">
                          Package: {submission.packageChoice === 'premium' ? 'Premium (Info Only)' : 'Standard'}
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 lg:grid-cols-3">
                        <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-4 sm:p-5">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Base & Accents</p>
                          <p className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold text-text-primary break-words">Base: {submission.baseColor.toUpperCase()}</p>
                          <p className="text-xs sm:text-sm text-text-secondary break-words">Graduating Class: {submission.graduatingClass || 'Not provided'}</p>
                          <p className="text-xs sm:text-sm text-text-secondary break-words">Faculty Logo: {submission.facultyLogo ? facultyLabelMap[submission.facultyLogo] ?? submission.facultyLogo : 'Not provided'}</p>
                        </div>
                        <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-4 sm:p-5">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Academics</p>
                          <p className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold text-text-primary break-words">{submission.contact.course}</p>
                          <p className="text-xs sm:text-sm text-text-secondary">Graduates {submission.contact.graduationYear}</p>
                        </div>
                        <div className="rounded-lg sm:rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-4 sm:p-5 text-text-primary">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent-primary">Quote</p>
                          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-text-primary/90 break-words">
                            {submission.quote || 'No quote captured.'}
                          </p>
                        </div>
                      </div>

                      {submission.additionalNotes && (
                        <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5 text-xs sm:text-sm text-text-secondary">
                          <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Notes</p>
                          <div className="break-words">{submission.additionalNotes}</div>
                        </div>
                      )}

                      <div className="mt-4 sm:mt-6 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-text-secondary/70">
                        Consent: {submission.consentAccepted ? 'Granted' : 'Pending follow-up'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'gallery' ? (
            <div className="min-h-0 rounded-xl sm:rounded-2xl border border-border-subtle/40 bg-app-surface/70 backdrop-blur transition-colors">
              <GalleryManager />
            </div>
          ) : activeTab === 'schools' ? (
            <SchoolManager />
          ) : (
            <div className="min-h-0 rounded-xl sm:rounded-2xl border border-border-subtle/40 bg-app-surface/70 p-4 sm:p-6 lg:p-8 backdrop-blur transition-colors">
              <div className="mb-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">NNS Custom Orders</h2>
                  <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                    Manage all New Nation School custom stole orders
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-auto rounded-lg border border-border-subtle/40 bg-app-elevated/60 py-2 pl-10 pr-4 text-xs sm:text-sm text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as NNSOrderStatus | '')}
                      className="flex-1 sm:flex-initial rounded-lg border border-border-subtle/40 bg-app-elevated/60 py-2 px-3 text-xs sm:text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    >
                      <option value="">All Statuses</option>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as OrderPriority | '')}
                      className="flex-1 sm:flex-initial rounded-lg border border-border-subtle/40 bg-app-elevated/60 py-2 px-3 text-xs sm:text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredNNSOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-16 w-16 text-text-secondary/60" />
                  <p className="text-text-secondary">
                    {nnsOrders.length === 0 ? 'No NNS orders yet.' : 'No orders match your filters.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNNSOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      whileHover={{ scale: 1.005 }}
                      onClick={() => handleOrderClick(order)}
                      className="cursor-pointer rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-surface/60 p-4 sm:p-5 transition-colors hover:border-accent-primary/40"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-text-primary break-words">{order.fullName}</h3>
                              <p className="text-xs sm:text-sm text-text-secondary break-all">
                                {order.email}
                              </p>
                              {order.phone && (
                                <p className="text-xs sm:text-sm text-text-secondary">{order.phone}</p>
                              )}
                              <p className="mt-1 text-xs sm:text-sm text-text-secondary break-words">
                                {order.course}
                              </p>
                              {order.selectedGender && (
                                <p className="text-xs text-text-secondary/80 capitalize">Gender: {order.selectedGender}</p>
                              )}
                              <p className="text-xs text-text-secondary/70">{order.school}</p>
                            </div>
                            <div className="self-start">
                              <StatusBadge status={order.status} />

                              {/* Deadline Badge */}
                              {order.deadline && (
                                <div
                                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isDeadlineOverdue(order.deadline)
                                    ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                                    : isDeadlineApproaching(order.deadline)
                                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                      : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                    }`}
                                >
                                  {isDeadlineOverdue(order.deadline) ? (
                                    <AlertTriangle className="h-3 w-3" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                  {formatDeadline(order.deadline)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-6 text-center">
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-xs text-text-secondary">Price</p>
                            <p className="text-sm sm:text-lg font-semibold text-text-primary">¢{order.price}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-xs text-text-secondary">Priority</p>
                            <p className="text-xs sm:text-sm font-medium text-text-primary capitalize">{order.priority}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-xs text-text-secondary">Payment</p>
                            <p className="text-xs sm:text-sm font-medium text-text-primary capitalize">{order.paymentStatus}</p>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle/30">
                          {order.paymentStatus !== 'paid' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsPaid(order);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 transition-colors hover:bg-green-500/30"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark as Paid
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(order.email, 'Email');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-app-elevated/80 px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-app-elevated border border-border-subtle/40"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy Email
                          </button>
                          {order.phone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyText(order.phone!, 'Phone');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-app-elevated/80 px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-app-elevated border border-border-subtle/40"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy Phone
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendStatusEmail(order);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-500/30"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Send Email
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintOrder(order);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 transition-colors hover:bg-purple-500/30"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-text-secondary">
                        Submitted {new Date(order.submittedAt).toLocaleDateString()}
                        {order.lastStatusUpdate && ` · Updated ${new Date(order.lastStatusUpdate).toLocaleDateString()}`}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOrderModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="scroll-contain relative flex max-h-[85vh] sm:max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl sm:rounded-2xl border border-border-subtle/40 bg-app-surface p-4 sm:p-6 lg:p-8"
            >
              <button
                onClick={() => setShowOrderModal(false)}
                className="sticky top-0 float-right right-0 z-10 rounded-lg p-1.5 sm:p-2 text-text-secondary hover:bg-app-elevated hover:text-text-primary bg-app-surface/80 backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-text-primary pr-8">Order Details</h2>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Customer Info</p>
                    <p className="text-base sm:text-lg font-semibold text-text-primary break-words">{selectedOrder.fullName}</p>
                    <p className="text-xs sm:text-sm text-text-secondary break-all">{selectedOrder.email}</p>
                    {selectedOrder.phone && <p className="text-xs sm:text-sm text-text-secondary">{selectedOrder.phone}</p>}
                    <p className="mt-2 text-xs sm:text-sm text-text-secondary">{selectedOrder.course}</p>
                    {selectedOrder.selectedGender && (
                      <p className="text-xs sm:text-sm text-text-secondary capitalize">Gender: {selectedOrder.selectedGender}</p>
                    )}
                    {selectedOrder.graduationYear && (
                      <p className="text-xs sm:text-sm text-text-secondary">Graduating {selectedOrder.graduationYear}</p>
                    )}
                  </div>

                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Order Status</p>
                    <div className="mb-3 sm:mb-4">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as NNSOrderStatus)}
                      className="w-full rounded-lg border border-border-subtle/40 bg-app-elevated py-2 px-3 text-xs sm:text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-lg sm:rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-4 sm:p-5">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent-primary">Sash Quote</p>
                  <p className="text-sm sm:text-lg font-bold text-text-primary uppercase tracking-wide">{selectedOrder.quote || 'No quote provided'}</p>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-2 sm:mb-3 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Priority</p>
                    <select
                      value={selectedOrder.priority}
                      onChange={(e) => handleOrderUpdate(selectedOrder.id, { priority: e.target.value as OrderPriority })}
                      className="w-full rounded-lg border border-border-subtle/40 bg-app-elevated py-2 px-3 text-xs sm:text-sm text-text-primary capitalize focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-2 sm:mb-3 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Payment Status</p>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => handleOrderUpdate(selectedOrder.id, { paymentStatus: e.target.value as PaymentStatus })}
                      className="w-full rounded-lg border border-border-subtle/40 bg-app-elevated py-2 px-3 text-xs sm:text-sm text-text-primary capitalize focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-2 sm:mb-3 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Delivery Method</p>
                    <select
                      value={selectedOrder.deliveryMethod}
                      onChange={(e) => handleOrderUpdate(selectedOrder.id, { deliveryMethod: e.target.value as DeliveryMethod })}
                      className="w-full rounded-lg border border-border-subtle/40 bg-app-elevated py-2 px-3 text-xs sm:text-sm text-text-primary capitalize focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    >
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery</option>
                      <option value="courier">Courier</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-2 sm:mb-3 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Price (¢)</p>
                    <input
                      type="number"
                      value={selectedOrder.price}
                      onChange={(e) => handleOrderUpdate(selectedOrder.id, { price: parseFloat(e.target.value) })}
                      className="w-full rounded-lg border border-border-subtle/40 bg-app-elevated py-2 px-3 text-xs sm:text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    />
                  </div>

                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-2 sm:mb-3 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Tracking Number</p>
                    <input
                      type="text"
                      value={selectedOrder.trackingNumber || ''}
                      onChange={(e) => handleOrderUpdate(selectedOrder.id, { trackingNumber: e.target.value })}
                      placeholder="Enter tracking number"
                      className="w-full rounded-lg border border-border-subtle/40 bg-app-elevated py-2 px-3 text-xs sm:text-sm text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    />
                  </div>
                </div>

                {/* Deadline Management */}
                <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Calendar className="h-4 w-4 text-text-secondary/70" />
                    <p className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Deadline</p>
                  </div>
                  <input
                    type="datetime-local"
                    value={selectedOrder.deadline ? selectedOrder.deadline.slice(0, 16) : ''}
                    onChange={(e) => handleSetDeadline(selectedOrder.id, e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full rounded-lg border border-border-subtle/40 bg-app-elevated py-2 px-3 text-xs sm:text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  />
                  {selectedOrder.deadline && (
                    <div className={`mt-2 text-xs flex items-center gap-2 ${isDeadlineOverdue(selectedOrder.deadline)
                      ? 'text-red-600 dark:text-red-400'
                      : isDeadlineApproaching(selectedOrder.deadline)
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-blue-600 dark:text-blue-400'
                      }`}>
                      {isDeadlineOverdue(selectedOrder.deadline) ? (
                        <>
                          <AlertTriangle className="h-4 w-4" />
                          <span>⚠️ {formatDeadline(selectedOrder.deadline)}</span>
                        </>
                      ) : isDeadlineApproaching(selectedOrder.deadline) ? (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>🔔 {formatDeadline(selectedOrder.deadline)}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>✓ {formatDeadline(selectedOrder.deadline)}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {selectedOrder.statusHistory.length > 0 && (
                  <div className="rounded-lg sm:rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-4 sm:p-5">
                    <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-secondary/70">Status History</p>
                    <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                      {selectedOrder.statusHistory.slice().reverse().map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-2 sm:gap-3 border-l-2 border-accent-primary/30 pl-3 sm:pl-4">
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium text-text-primary break-words">{statusLabels[entry.status]}</p>
                            {entry.note && <p className="text-xs text-text-secondary break-words">{entry.note}</p>}
                            <p className="mt-1 text-[10px] sm:text-xs text-text-secondary break-words">
                              {new Date(entry.timestamp).toLocaleString()}
                              {entry.updatedByName && ` by ${entry.updatedByName}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-50 rounded-lg px-6 py-3 shadow-lg ${toast.type === 'success'
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
              }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
