import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Palette, Plus, Shield, Edit, User, GraduationCap, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DesignSubmissionRecord, listDesignSubmissionsByUser } from '../lib/appwrite';
import { ProfileModal } from '../components/ProfileModal';
import logo from '../assets/logo.png';

export function DashboardPage() {
  const { user, profile, profileComplete, setPendingRedirect } = useAuth();
  const [submissions, setSubmissions] = useState<DesignSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const records = await listDesignSubmissionsByUser(user.$id);
      setSubmissions(records);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                Welcome back, {profile?.fullName || 'Designer'}
              </h1>
              <p className="text-gray-400">
                Your Custosasho design journey lives here. Review your submissions and keep the story flowing.
              </p>
            </div>
            <div className="hidden lg:block ml-8">
              <img
                src={logo}
                alt="Custosasho Logo"
                className="w-64 h-64 object-contain hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* Profile Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8 rounded-3xl border border-gold-500/20 bg-black/60 p-8 backdrop-blur"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
                <p className="text-sm text-gray-400">
                  Your personal details and academic information
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gold-500/30 bg-gray-900/60 px-4 py-2 text-sm font-semibold text-gold-300 hover:border-gold-500/50 hover:bg-gray-900/80"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            {profile ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-gold-500/15 p-2 text-gold-400">
                      <User className="h-4 w-4" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Personal Details</p>
                  </div>
                  <p className="text-lg font-semibold text-white">{profile.fullName}</p>
                  <p className="text-sm text-gray-400 capitalize">{profile.role}</p>
                  {profile.phone && (
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <p className="text-xs text-gray-500">{profile.phone}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-gold-500/15 p-2 text-gold-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Academic Info</p>
                  </div>
                  <p className="text-lg font-semibold text-white">{profile.university}</p>
                  <p className="text-sm text-gray-400">{profile.college}</p>
                  <p className="text-sm text-gold-300 mt-1">{profile.programme}</p>
                </div>

                <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-gold-500/30 p-2 text-gold-300">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gold-200">Graduation</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{profile.graduationYear}</p>
                  <p className="text-sm text-gold-200">Class of {profile.graduationYear}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 px-6 py-8 text-center">
                <p className="text-gray-400">Profile information not available</p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-black hover:bg-gold-400"
                >
                  Complete Profile
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-6 rounded-3xl border border-gold-500/20 bg-black/60 p-8 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gold-500">Submissions</p>
                  <h2 className="mt-3 text-4xl font-bold text-white">{submissions.length}</h2>
                </div>
                <div className="rounded-full bg-gold-500/15 p-3 text-gold-400">
                  <ClipboardList className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                Every saved journey appears in real time for our creative team and in your personal portal.
              </p>
              <button
                onClick={handleContinueDesign}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:text-gold-200"
              >
                Continue your design
                <Plus className="h-4 w-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-2xl border border-gold-500/20 bg-gray-900/40 p-8 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gold-500">Base Palette</p>
                  <h2 className="mt-3 text-4xl font-bold text-white">
                    {submissions[0]?.baseColor ? submissions[0].baseColor.toUpperCase() : '—'}
                  </h2>
                </div>
                <div className="rounded-full bg-gold-500/15 p-3 text-gold-400">
                  <Palette className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                Latest base color selection anchors your stole. Update it anytime inside the designer.
              </p>
              <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-xs uppercase tracking-[0.25em] text-gray-500">
                Current Stripe: {submissions[0]?.stripeStyle || 'Not Selected'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-2xl border border-gold-500/20 bg-gray-900/40 p-8 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gold-500">Data Status</p>
                  <h2 className="mt-3 text-2xl font-bold text-white">Protected with consent</h2>
                </div>
                <div className="rounded-full bg-gold-500/15 p-3 text-gold-400">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                Custosasho stores your journey securely so the admin squad can craft and follow up professionally.
              </p>
              <div className="mt-6 text-xs uppercase tracking-[0.25em] text-gray-500">
                Consent: {submissions[0]?.consentAccepted ? 'Granted' : 'Pending'}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 rounded-3xl border border-gold-500/20 bg-black/60 p-8 backdrop-blur"
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-white">My Design Journey</h2>
                <p className="text-sm text-gray-400">
                  A snapshot of every interactive session you completed inside the designer module.
                </p>
              </div>
              <Link
                to="/designer"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-500 to-amber-500 px-5 py-3 text-sm font-semibold text-black hover:from-gold-400 hover:to-amber-400"
              >
                Start Another Journey
                <Plus className="h-4 w-4" />
              </Link>
            </div>

            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gold-500/30 bg-gray-900/40 px-6 py-12 text-center text-gray-400">
                No journeys yet. Launch the designer to begin your personalized experience.
              </div>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 transition-all hover:border-gold-500/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gold-500">
                          Saved {new Date(submission.createdAt).toLocaleString()}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">Standard Stole Journey</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Base: {submission.baseColor.toUpperCase()} · Stripe: {submission.stripeStyle}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-xs uppercase tracking-[0.25em] text-gray-500">
                        Package Choice: {submission.packageChoice === 'premium' ? 'Premium (Unavailable)' : 'Standard'}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                      <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Graduate</p>
                        <p className="mt-3 text-lg font-semibold text-white">{submission.contact.fullName}</p>
                        <p className="text-sm text-gray-400">{submission.contact.email}</p>
                        {submission.contact.phone && (
                          <p className="mt-2 text-xs text-gray-500">{submission.contact.phone}</p>
                        )}
                      </div>
                      <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Programme</p>
                        <p className="mt-3 text-lg font-semibold text-white">{submission.contact.course}</p>
                        <p className="text-sm text-gray-400">Class of {submission.contact.graduationYear}</p>
                      </div>
                      <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-5 text-gold-100">
                        <p className="text-xs uppercase tracking-[0.3em]">Favourite Quote</p>
                        <p className="mt-3 text-sm leading-relaxed">
                          {submission.quote || 'No quote provided yet.'}
                        </p>
                      </div>
                    </div>

                    {submission.additionalNotes && (
                      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950/70 p-5 text-sm text-gray-300">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Additional Notes</p>
                        {submission.additionalNotes}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl">
            <ProfileModal isEditMode={true} onClose={() => setShowProfileModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
