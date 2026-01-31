import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Layers, ShieldCheck, Users } from 'lucide-react';
import { DesignSubmissionRecord, listAllDesignSubmissions } from '../lib/appwrite';

export function AdminDashboard() {
  const [submissions, setSubmissions] = useState<DesignSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const records = await listAllDesignSubmissions();
      setSubmissions(records);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSubmissions: submissions.length,
    consented: submissions.filter((record) => record.consentAccepted).length,
    standardCount: submissions.filter((record) => record.packageChoice === 'standard').length,
    premiumInterest: submissions.filter((record) => record.packageChoice === 'premium').length,
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
          <h1 className="text-4xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 mb-12">
            Monitor every Custosasho journey collected through the interactive designer module.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, label: 'Total Journeys', value: stats.totalSubmissions },
              { icon: ShieldCheck, label: 'Consent Granted', value: stats.consented },
              { icon: Layers, label: 'Standard Requests', value: stats.standardCount },
              { icon: FileText, label: 'Premium Interest', value: stats.premiumInterest },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-gray-900/50 backdrop-blur border border-gold-500/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-gold-500" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-gray-900/50 backdrop-blur border border-gold-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Design Journeys</h2>
            <p className="text-sm text-gray-400 mb-8">
              These records sync directly from the full-screen designer. Use them to brief artisans, follow up with graduates, and plan production.
            </p>

            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No design journeys have been captured yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 transition-colors hover:border-gold-500/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gold-500">
                          Captured {new Date(submission.createdAt).toLocaleString()}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">{submission.contact.fullName}</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {submission.contact.email}
                          {submission.contact.phone ? ` · ${submission.contact.phone}` : ''}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-xs uppercase tracking-[0.25em] text-gray-500">
                        Package: {submission.packageChoice === 'premium' ? 'Premium (Info Only)' : 'Standard'}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                      <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Base & Stripe</p>
                        <p className="mt-3 text-lg font-semibold text-white">Base: {submission.baseColor.toUpperCase()}</p>
                        <p className="text-sm text-gray-400">Stripe: {submission.stripeStyle}</p>
                      </div>
                      <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Academics</p>
                        <p className="mt-3 text-lg font-semibold text-white">{submission.contact.course}</p>
                        <p className="text-sm text-gray-400">Graduates {submission.contact.graduationYear}</p>
                      </div>
                      <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-5 text-gold-100">
                        <p className="text-xs uppercase tracking-[0.3em]">Quote</p>
                        <p className="mt-3 text-sm leading-relaxed">{submission.quote || 'No quote captured.'}</p>
                      </div>
                    </div>

                    {submission.additionalNotes && (
                      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950/70 p-5 text-sm text-gray-300">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Notes</p>
                        {submission.additionalNotes}
                      </div>
                    )}

                    <div className="mt-6 text-xs uppercase tracking-[0.25em] text-gray-500">
                      Consent: {submission.consentAccepted ? 'Granted' : 'Pending follow-up'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
