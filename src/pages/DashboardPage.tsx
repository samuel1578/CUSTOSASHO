import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Palette, Plus, Shield, Edit, User, GraduationCap, Phone, Package, Check, Printer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { DesignSubmissionRecord, listDesignSubmissionsByUser, NNSOrderRecord, listNNSOrdersByUser, grantNNSConsent, hasNNSConsent } from '../lib/appwrite';
import { ProfileModal } from '../components/ProfileModal';
import { ConsentModal } from '../components/ConsentModal';
import { StatusBadge } from '../components/StatusBadge';
import { printOrderDetailsUser } from '../lib/utils';
import logo from '../assets/logo.png';
import nnsLogo from '../assets/nns.png';

export function DashboardPage() {
  const { user, profile, profileComplete, setPendingRedirect } = useAuth();
  const [submissions, setSubmissions] = useState<DesignSubmissionRecord[]>([]);
  const [nnsOrders, setNnsOrders] = useState<NNSOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const navigate = useNavigate();

  const { isNSSType, isUGType, tenantConfig, tenantLoading } = useTenant();
  const isNNSUser = isNSSType;

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      if (isNNSUser) {
        const orders = await listNNSOrdersByUser(user.$id);
        setNnsOrders(orders);
      } else {
        const records = await listDesignSubmissionsByUser(user.$id);
        setSubmissions(records);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check consent status when NNS orders change
  useEffect(() => {
    if (!user || !isNNSUser) return;

    const checkConsent = async () => {
      const consent = await hasNNSConsent(user.$id);
      setHasConsent(consent);
    };

    checkConsent();
  }, [user, isNNSUser, nnsOrders]);

  const handleGrantConsent = async () => {
    if (!user) return;

    try {
      await grantNNSConsent(user.$id);
      setShowConsentModal(false);
      await loadData(); // Reload orders to get updated consent status
      setHasConsent(true);
    } catch (error) {
      console.error('Error granting consent:', error);
    }
  };

  const handleContinueDesign = () => {
    const target = '/designer';
    if (!profileComplete) {
      setPendingRedirect(target);
      return;
    }

    navigate(target);
  };

  if (loading || tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-base text-text-primary transition-colors">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-base pt-28 pb-16 text-text-primary transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-display font-bold text-accent-primary">
                Welcome back, {profile?.fullName || 'Designer'}
              </h1>
              <p className="max-w-3xl text-text-secondary">
                Your Custosasho design journey lives here. Review your submissions and keep the story flowing.
              </p>
            </div>
            <div className="ml-8 hidden lg:block">
              <img
                src={logo}
                alt="Custosasho Logo"
                className="h-64 w-64 object-contain transition-transform hover:scale-105"
              />
            </div>
          </div>

          {/* Profile Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8 rounded-3xl border border-border-subtle/40 bg-app-surface/70 p-8 backdrop-blur transition-colors"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary">Profile Information</h2>
                <p className="text-sm text-text-secondary">
                  Your personal details and academic information
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                {isNNSUser && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex-shrink-0"
                  >
                    {tenantConfig?.logoUrl ? (
                      <img
                        src={tenantConfig.logoUrl}
                        alt={tenantConfig.name}
                        className="h-16 w-16 object-contain md:h-24 md:w-24"
                      />
                    ) : (
                      <img
                        src={nnsLogo}
                        alt="New Nation School"
                        className="h-16 w-16 object-contain md:h-24 md:w-24"
                      />
                    )}
                  </motion.div>
                )}
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-accent-primary/40 bg-app-elevated/60 px-4 py-2 text-sm font-semibold text-text-primary transition-all hover:border-accent-primary hover:text-accent-primary"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {profile ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-5 transition-colors">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-accent-primary/15 p-2 text-accent-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Personal Details</p>
                  </div>
                  <p className="text-lg font-semibold text-text-primary">{profile.fullName}</p>
                  <p className="text-sm capitalize text-text-secondary">{profile.role}</p>
                  {profile.phone && (
                    <div className="mt-2 flex items-center gap-2">
                      <Phone className="h-3 w-3 text-text-secondary/70" />
                      <p className="text-xs text-text-secondary/70">{profile.phone}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-5 transition-colors">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-accent-primary/15 p-2 text-accent-primary">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Academic Info</p>
                  </div>
                  <p className="text-lg font-semibold text-text-primary">{profile.university}</p>
                  <p className="text-sm text-text-secondary">{profile.college}</p>
                  <p className="mt-1 text-sm text-accent-primary">{profile.programme}</p>
                </div>

                <div className="rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-5 text-text-primary transition-colors">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-full bg-accent-primary/20 p-2 text-accent-primary">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-accent-primary">Graduation</p>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{profile.graduationYear}</p>
                  <p className="text-sm text-text-primary/80">Class of {profile.graduationYear}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-subtle/50 bg-app-elevated/50 px-6 py-8 text-center transition-colors">
                <p className="text-text-secondary">Profile information not available</p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="btn-accent-gradient mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-text-inverted transition-transform hover:scale-105"
                >
                  Complete Profile
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Consent Card for NNS Users - Only shows if they have orders */}
          {isNNSUser && nnsOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className={`mb-8 rounded-3xl border p-8 backdrop-blur transition-colors ${hasConsent
                ? 'border-green-500/40 bg-green-500/5'
                : 'border-amber-500/40 bg-amber-500/5'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase tracking-[0.3em] ${hasConsent ? 'text-green-500' : 'text-amber-500'}`}>
                    Data Status
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-text-primary">
                    {hasConsent ? 'Protected with consent' : 'Consent Required'}
                  </h2>
                </div>
                <div className={`rounded-full p-3 ${hasConsent ? 'bg-green-500/15 text-green-500' : 'bg-amber-500/15 text-amber-500'}`}>
                  {hasConsent ? <Check className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                </div>
              </div>
              <p className="mt-6 text-sm text-text-secondary">
                {hasConsent
                  ? 'Your data is securely stored with your consent for order fulfillment and design crafting.'
                  : 'To process your order, we need your consent to store and use your design information.'}
              </p>
              {hasConsent ? (
                <div className="mt-6 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                  Granted: {nnsOrders[0]?.consentGrantedAt ? new Date(nnsOrders[0].consentGrantedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              ) : (
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="mt-6 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                >
                  Review & Grant Consent
                </button>
              )}
            </motion.div>
          )}

          {/* Custom Orders Section for NNS Users */}
          {isNNSUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 rounded-3xl border border-border-subtle/40 bg-app-surface/70 p-8 backdrop-blur transition-colors"
            >
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary">My Custom Orders</h2>
                  <p className="text-sm text-text-secondary">
                    Track your custom stole orders and their progress through design and production.
                  </p>
                </div>
                <Link
                  to="/designer"
                  className="btn-accent-gradient inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-text-inverted transition-transform hover:scale-105"
                >
                  New Order
                  <Plus className="h-4 w-4" />
                </Link>
              </div>

              {nnsOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle/50 bg-app-elevated/50 px-6 py-12 text-center text-text-secondary">
                  No orders yet. Create your first custom stole order to get started.
                </div>
              ) : (
                <div className="space-y-6">
                  {nnsOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-2xl border border-border-subtle/40 bg-app-surface/60 p-6 transition-all hover:border-accent-primary/40"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="text-xs uppercase tracking-[0.3em] text-accent-primary">
                              Order #{order.id.slice(-8)}
                            </p>
                            <StatusBadge status={order.status} />
                          </div>
                          <h3 className="mt-2 text-2xl font-semibold text-text-primary">{order.fullName}</h3>
                          <p className="mt-1 text-sm text-text-secondary">
                            {order.course} · Class of {order.graduationYear || 'N/A'}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary/70">
                            Submitted {new Date(order.submittedAt).toLocaleDateString()}
                          </p>
                          <div className="mt-4">
                            <button
                              onClick={() => printOrderDetailsUser(order)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-yellow-500/40 text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors"
                            >
                              <Printer size={13} />
                              Print Receipt
                            </button>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border-subtle/50 bg-app-elevated/70 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">Price</p>
                          <p className="mt-1 text-2xl font-bold text-accent-primary">¢{order.price}</p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent-primary">Sash Quote</p>
                        <p className="mt-2 text-lg font-bold text-text-primary uppercase tracking-wide">
                          {order.quote || 'No quote provided'}
                        </p>
                      </div>

                      {order.statusHistory.length > 1 && (
                        <div className="mt-6 rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-5">
                          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-text-secondary/70">
                            Status History
                          </p>
                          <div className="space-y-2">
                            {order.statusHistory.slice(-3).reverse().map((entry, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-accent-primary" />
                                  <StatusBadge status={entry.status} className="text-[0.65rem] px-2 py-0.5" />
                                </div>
                                <span className="text-xs text-text-secondary/70">
                                  {new Date(entry.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <div className={`grid grid-cols-1 gap-8 ${isNNSUser ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-6 rounded-3xl border border-border-subtle/40 bg-app-surface/70 p-8 backdrop-blur transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-accent-primary">{isNNSUser ? 'Orders' : 'Submissions'}</p>
                  <h2 className="mt-3 text-4xl font-bold text-text-primary">{isNNSUser ? nnsOrders.length : submissions.length}</h2>
                </div>
                <div className="rounded-full bg-accent-primary/15 p-3 text-accent-primary">
                  {isNNSUser ? <Package className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
                </div>
              </div>
              <p className="mt-6 text-sm text-text-secondary">
                {isNNSUser
                  ? 'Track your custom stole orders from submission through delivery.'
                  : 'Every saved journey appears in real time for our creative team and in your personal portal.'}
              </p>
              <button
                onClick={handleContinueDesign}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-primary transition-colors hover:text-accent-secondary"
              >
                Continue your design
                <Plus className="h-4 w-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-2xl border border-border-subtle/40 bg-app-surface/60 p-8 backdrop-blur transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-accent-primary">Base Palette</p>
                  <h2 className="mt-3 text-4xl font-bold text-text-primary">
                    {submissions[0]?.baseColor ? submissions[0].baseColor.toUpperCase() : '—'}
                  </h2>
                </div>
                <div className="rounded-full bg-accent-primary/15 p-3 text-accent-primary">
                  <Palette className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-6 text-sm text-text-secondary">
                Latest base color selection anchors your stole. Update it anytime inside the designer.
              </p>
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 px-4 py-3 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                  Graduating Class: {submissions[0]?.graduatingClass || 'Not provided'}
                </div>
                <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 px-4 py-3 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                  Faculty Logo: {submissions[0]?.facultyLogo ? submissions[0]?.facultyLogo.toUpperCase() : 'Not provided'}
                </div>
              </div>
            </motion.div>

            {/* UG Users Data Status Card */}
            {!isNNSUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="rounded-2xl border border-border-subtle/40 bg-app-surface/60 p-8 backdrop-blur transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-accent-primary">Data Status</p>
                    <h2 className="mt-3 text-2xl font-bold text-text-primary">Protected with consent</h2>
                  </div>
                  <div className="rounded-full bg-accent-primary/15 p-3 text-accent-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-6 text-sm text-text-secondary">
                  Custosasho stores your journey securely so the admin squad can craft and follow up professionally.
                </p>
                <div className="mt-6 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                  Consent: {submissions[0]?.consentAccepted ? 'Granted' : 'Pending'}
                </div>
              </motion.div>
            )}
          </div>

          {/* UG Users Design Journey Section */}
          {!isNNSUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 rounded-3xl border border-border-subtle/40 bg-app-surface/70 p-8 backdrop-blur transition-colors"
            >
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary">My Design Journey</h2>
                  <p className="text-sm text-text-secondary">
                    A snapshot of every interactive session you completed inside the designer module.
                  </p>
                </div>
                <Link
                  to="/designer"
                  className="btn-accent-gradient inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-text-inverted transition-transform hover:scale-105"
                >
                  Start Another Journey
                  <Plus className="h-4 w-4" />
                </Link>
              </div>

              {submissions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle/50 bg-app-elevated/50 px-6 py-12 text-center text-text-secondary">
                  No journeys yet. Launch the designer to begin your personalized experience.
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map((submission) => (
                    <motion.div
                      key={submission.id}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-2xl border border-border-subtle/40 bg-app-surface/60 p-6 transition-all hover:border-accent-primary/40"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-accent-primary">
                            Saved {new Date(submission.createdAt).toLocaleString()}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold text-text-primary">Standard Stole Journey</h3>
                          <p className="mt-1 text-sm text-text-secondary">
                            Base: {submission.baseColor.toUpperCase()} · Graduating Class: {submission.graduatingClass || 'N/A'}
                          </p>
                          <p className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                            Faculty Logo: {submission.facultyLogo ? submission.facultyLogo.toUpperCase() : 'Not provided'}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border-subtle/50 bg-app-elevated/70 px-4 py-3 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                          Package Choice: {submission.packageChoice === 'premium' ? 'Premium (Unavailable)' : 'Standard'}
                        </div>
                      </div>

                      <div className="mt-6 grid gap-6 lg:grid-cols-3">
                        <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-5">
                          <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Graduate</p>
                          <p className="mt-3 text-lg font-semibold text-text-primary">{submission.contact.fullName}</p>
                          <p className="text-sm text-text-secondary">{submission.contact.email}</p>
                          {submission.contact.phone && (
                            <p className="mt-2 text-xs text-text-secondary/70">{submission.contact.phone}</p>
                          )}
                        </div>
                        <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-5">
                          <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Programme</p>
                          <p className="mt-3 text-lg font-semibold text-text-primary">{submission.contact.course}</p>
                          <p className="text-sm text-text-secondary">Class of {submission.contact.graduationYear}</p>
                        </div>
                        <div className="rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-5 text-text-primary">
                          <p className="text-xs uppercase tracking-[0.3em] text-accent-primary">Favourite Quote</p>
                          <p className="mt-3 text-sm leading-relaxed text-text-primary/90">
                            {submission.quote || 'No quote provided yet.'}
                          </p>
                        </div>
                      </div>

                      {submission.additionalNotes && (
                        <div className="mt-6 rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-5 text-sm text-text-secondary">
                          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-text-secondary/70">Additional Notes</p>
                          {submission.additionalNotes}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {/* Profile Modal */}
          {showProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-app-base/80 backdrop-blur-sm transition-colors"
                onClick={() => setShowProfileModal(false)}
              />
              <div className="relative z-10 w-full max-w-2xl">
                <ProfileModal isEditMode={true} onClose={() => setShowProfileModal(false)} />
              </div>
            </div>
          )}

          {/* Consent Modal for NNS users */}
          <ConsentModal
            isOpen={showConsentModal}
            onAccept={handleGrantConsent}
            onCancel={() => setShowConsentModal(false)}
          />
        </motion.div>
      </div>
    </div>
  );
}
