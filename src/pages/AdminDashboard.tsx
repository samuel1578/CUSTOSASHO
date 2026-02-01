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
          <h1 className="mb-2 text-4xl font-display font-bold text-accent-primary">Admin Dashboard</h1>
          <p className="mb-12 max-w-3xl text-text-secondary">
            Monitor every Custosasho journey collected through the interactive designer module.
          </p>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                className="rounded-xl border border-border-subtle/40 bg-app-surface/60 p-6 backdrop-blur transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-accent-primary" />
                </div>
                <p className="mb-1 text-3xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-border-subtle/40 bg-app-surface/70 p-8 backdrop-blur transition-colors">
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
                    className="rounded-2xl border border-border-subtle/40 bg-app-surface/60 p-6 transition-colors hover:border-accent-primary/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-accent-primary">
                          Captured {new Date(submission.createdAt).toLocaleString()}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-text-primary">{submission.contact.fullName}</h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          {submission.contact.email}
                          {submission.contact.phone ? ` · ${submission.contact.phone}` : ''}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border-subtle/50 bg-app-elevated/70 px-4 py-3 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                        Package: {submission.packageChoice === 'premium' ? 'Premium (Info Only)' : 'Standard'}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                      <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Base & Stripe</p>
                        <p className="mt-3 text-lg font-semibold text-text-primary">Base: {submission.baseColor.toUpperCase()}</p>
                        <p className="text-sm text-text-secondary">Stripe: {submission.stripeStyle}</p>
                      </div>
                      <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/70 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Academics</p>
                        <p className="mt-3 text-lg font-semibold text-text-primary">{submission.contact.course}</p>
                        <p className="text-sm text-text-secondary">Graduates {submission.contact.graduationYear}</p>
                      </div>
                      <div className="rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-5 text-text-primary">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent-primary">Quote</p>
                        <p className="mt-3 text-sm leading-relaxed text-text-primary/90">
                          {submission.quote || 'No quote captured.'}
                        </p>
                      </div>
                    </div>

                    {submission.additionalNotes && (
                      <div className="mt-6 rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-5 text-sm text-text-secondary">
                        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-text-secondary/70">Notes</p>
                        {submission.additionalNotes}
                      </div>
                    )}

                    <div className="mt-6 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
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
