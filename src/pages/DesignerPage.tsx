import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveDesignSubmission } from '../lib/appwrite';

type StepId = 'welcome' | 'base' | 'stripes' | 'package' | 'consent';

interface StepDefinition {
  id: StepId;
  title: string;
  description: string;
}

const STEP_FLOW: StepDefinition[] = [
  {
    id: 'welcome',
    title: 'Welcome to Custosasho',
    description: 'We appreciate you choosing to drip with us. Let us guide your stole journey.',
  },
  {
    id: 'base',
    title: 'Choose Your Base',
    description: 'Select the foundation color that anchors your story.',
  },
  {
    id: 'stripes',
    title: 'Stripe Combination',
    description: 'Pick the stripe rhythm that reflects your heritage and style.',
  },
  {
    id: 'package',
    title: 'Select Package',
    description: 'Review the available stole experiences before we craft the details.',
  },
  {
    id: 'consent',
    title: 'Finalize & Consent',
    description: 'Share your graduation details and authorize us to protect and use your data responsibly.',
  },
];

const BASE_COLORS = [
  {
    value: 'black',
    title: 'Black Base',
    description: 'Classic ebony backdrop that makes every accent shimmer.',
    swatch: 'from-gray-900 via-black to-gray-800',
  },
  {
    value: 'yellow',
    title: 'Yellow Base',
    description: 'Radiant gold-tone to spotlight your achievements.',
    swatch: 'from-yellow-500 via-amber-400 to-yellow-300',
  },
  {
    value: 'green',
    title: 'Green Base',
    description: 'Vibrant emerald inspired by rich Ghanaian heritage.',
    swatch: 'from-emerald-600 via-green-500 to-emerald-400',
  },
];

const STRIPE_OPTIONS = [
  {
    value: 'heritage-contrast',
    title: 'Heritage Contrast',
    description: 'Bold tricolor striping celebrating unity, strength, and royalty.',
  },
  {
    value: 'sunrise-gradient',
    title: 'Sunrise Gradient',
    description: 'Soft tonal fade that mirrors dawn reflections on woven kente.',
  },
  {
    value: 'minimal-accent',
    title: 'Minimal Accent',
    description: 'Subtle dual stripes for an understated modern finish.',
  },
];

const PACKAGE_OPTIONS = [
  {
    id: 'standard' as const,
    title: 'Standard Stole',
    layers: '2 Layers',
    features: [
      'Name, course, and graduation year embroidery',
      'Full name placement across both panels',
      'University crest integration',
      'University logo or adinkra symbol (choose one)',
    ],
    status: 'Available now',
    unavailable: false,
  },
  {
    id: 'premium' as const,
    title: 'Premium Stole',
    layers: '3 Layers',
    features: [
      'Name, course, and graduation year embroidery',
      'University crest and institution logo',
      'Adinkra symbol placement (choose one)',
      'Favorite or signature quote e.g. “GOD DID”',
    ],
    status: 'Currently not in production',
    unavailable: true,
  },
];

interface DesignerFormState {
  baseColor: string;
  stripeStyle: string;
  packageChoice: 'standard' | 'premium';
  quote: string;
  additionalNotes: string;
  consentAccepted: boolean;
  contact: {
    fullName: string;
    email: string;
    phone: string;
    course: string;
    graduationYear: string;
  };
}

export function DesignerPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<DesignerFormState>({
    baseColor: '',
    stripeStyle: '',
    packageChoice: 'standard',
    quote: '',
    additionalNotes: '',
    consentAccepted: false,
    contact: {
      fullName: '',
      email: '',
      phone: '',
      course: '',
      graduationYear: '',
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      contact: {
        fullName: prev.contact.fullName || profile?.fullName || user.name || user.email || '',
        email: prev.contact.email || user.email || '',
        phone: prev.contact.phone || profile?.phone || '',
        course: prev.contact.course || profile?.programme || '',
        graduationYear: prev.contact.graduationYear || profile?.graduationYear || '',
      },
    }));
  }, [user, profile]);

  const currentStep = useMemo(() => STEP_FLOW[stepIndex], [stepIndex]);
  const progress = useMemo(() => ((stepIndex + 1) / STEP_FLOW.length) * 100, [stepIndex]);

  const handleBaseSelection = (value: string) => {
    setForm((prev) => ({ ...prev, baseColor: value }));
    setError(null);
  };

  const handleStripeSelection = (value: string) => {
    setForm((prev) => ({ ...prev, stripeStyle: value }));
    setError(null);
  };

  const handlePackageSelection = (value: 'standard' | 'premium', unavailable: boolean) => {
    if (unavailable) {
      setError('The premium stole is not currently in production.');
      return;
    }
    setForm((prev) => ({ ...prev, packageChoice: value }));
    setError(null);
  };

  const updateContact = (field: keyof DesignerFormState['contact'], value: string) => {
    setForm((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  const validateStep = () => {
    switch (currentStep.id) {
      case 'base':
        if (!form.baseColor) {
          return 'Please choose a base color to continue.';
        }
        break;
      case 'stripes':
        if (!form.stripeStyle) {
          return 'Select a stripe combination that fits your vision.';
        }
        break;
      case 'package':
        if (form.packageChoice !== 'standard') {
          return 'The premium stole is unavailable. Please continue with the Standard stole.';
        }
        break;
      case 'consent':
        if (!form.contact.fullName || !form.contact.email || !form.contact.course || !form.contact.graduationYear) {
          return 'Complete your graduation details before saving.';
        }
        if (!form.consentAccepted) {
          return 'We need your consent to securely store and process your information.';
        }
        break;
      default:
        break;
    }
    return null;
  };

  const handleNext = async () => {
    setError(null);

    if (currentStep.id === 'consent') {
      const consentError = validateStep();
      if (consentError) {
        setError(consentError);
        return;
      }
      await handleSubmit();
      return;
    }

    const validationMessage = currentStep.id === 'welcome' ? null : validateStep();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setStepIndex((prev) => Math.min(prev + 1, STEP_FLOW.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      setConfirmation(null);
      await saveDesignSubmission(user.$id, {
        baseColor: form.baseColor,
        stripeStyle: form.stripeStyle,
        packageChoice: form.packageChoice,
        quote: form.quote,
        additionalNotes: form.additionalNotes,
        consentAccepted: form.consentAccepted,
        contact: form.contact,
      });
      setConfirmation('Your Custosasho design journey is saved. Redirecting you to the dashboard...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (submitError) {
      console.error(submitError);
      setError('We could not save your design journey. Please try again shortly.');
    } finally {
      setSaving(false);
    }
  };

  const renderWelcome = () => (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto text-center space-y-8"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-gold-500/10 border border-gold-500 flex items-center justify-center">
          <span className="text-gold-400 font-semibold">Logo</span>
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
            Welcome to your Custosasho design journey
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We thank you for choosing to drip with us. Take a breath, feel the heritage, and let’s create magic together.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderBaseSelection = () => (
    <motion.div
      key="base"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {BASE_COLORS.map((color) => {
          const selected = form.baseColor === color.value;
          return (
            <button
              key={color.value}
              onClick={() => handleBaseSelection(color.value)}
              className={`group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all ${selected ? 'border-gold-500 bg-gold-500/10' : 'border-gray-700 hover:border-gold-500/40'
                }`}
            >
              <div className={`h-36 w-full rounded-xl bg-gradient-to-br ${color.swatch}`}></div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{color.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{color.description}</p>
              </div>
              {selected && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStripeSelection = () => (
    <motion.div
      key="stripes"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {STRIPE_OPTIONS.map((option) => {
          const selected = form.stripeStyle === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleStripeSelection(option.value)}
              className={`relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all ${selected ? 'border-gold-500 bg-gold-500/10' : 'border-gray-700 hover:border-gold-500/40'
                }`}
            >
              <div className="h-36 w-full rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <span className="text-sm uppercase tracking-wide text-gray-400">Stripe Mockup</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{option.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{option.description}</p>
              </div>
              {selected && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderPackageSelection = () => (
    <motion.div
      key="package"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {PACKAGE_OPTIONS.map((option) => {
          const selected = form.packageChoice === option.id;
          const unavailable = option.unavailable;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handlePackageSelection(option.id, unavailable)}
              className={`relative flex flex-col gap-5 rounded-2xl border-2 p-6 text-left transition-all ${unavailable
                ? 'cursor-not-allowed border-gray-700/60 bg-gray-900/40'
                : selected
                  ? 'border-gold-500 bg-gold-500/10'
                  : 'border-gray-700 hover:border-gold-500/40'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{option.title}</h3>
                  <p className="text-sm text-gold-300 mt-1">{option.layers}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${unavailable ? 'bg-red-500/20 text-red-300' : 'bg-gold-500/20 text-gold-300'
                  }`}>
                  {option.status}
                </div>
              </div>

              <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-6 text-center text-gray-400 text-sm uppercase tracking-wide">
                Mockup Placeholder
              </div>

              <ul className="space-y-3">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-gold-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              {unavailable && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-200">
                  Let the people know this stole is not currently under production. Stay tuned for an official release announcement.
                </p>
              )}

              {selected && !unavailable && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderConsent = () => (
    <motion.div
      key="consent"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Full Name</label>
            <input
              value={form.contact.fullName}
              onChange={(event) => updateContact('fullName', event.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-white focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
              <input
                type="email"
                value={form.contact.email}
                onChange={(event) => updateContact('email', event.target.value)}
                placeholder="Graduate email"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-white focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Phone</label>
              <input
                value={form.contact.phone}
                onChange={(event) => updateContact('phone', event.target.value)}
                placeholder="Optional contact number"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-white focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Course / Program</label>
              <input
                value={form.contact.course}
                onChange={(event) => updateContact('course', event.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-white focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Graduation Year</label>
              <input
                value={form.contact.graduationYear}
                onChange={(event) => updateContact('graduationYear', event.target.value)}
                placeholder="e.g. 2026"
                className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-white focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Favourite Quote</label>
            <textarea
              value={form.quote}
              onChange={(event) => setForm((prev) => ({ ...prev, quote: event.target.value }))}
              placeholder="Share the words that must live on your stole (e.g. GOD DID, ALL GOD, NOT ME)."
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-white focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Additional Notes</label>
            <textarea
              value={form.additionalNotes}
              onChange={(event) => setForm((prev) => ({ ...prev, additionalNotes: event.target.value }))}
              placeholder="Any extra requests, imagery references, or delivery considerations."
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-white focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 p-6">
            <div className="flex items-center gap-3 text-gold-200">
              <ShieldCheck className="h-6 w-6" />
              <p className="text-sm font-semibold uppercase tracking-wide">Custosasho Care Policy</p>
            </div>
            <p className="mt-4 text-sm text-gold-50/80 leading-relaxed">
              By sharing your information you authorize Custosasho to securely store, review, and reference your design request. We respect your privacy, protect your data, and use it only to craft your stole and keep our creative team aligned.
            </p>
            <label className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(event) => setForm((prev) => ({ ...prev, consentAccepted: event.target.checked }))}
                className="h-5 w-5 rounded border-gold-500/60 bg-transparent text-gold-400 focus:ring-gold-400"
              />
              <span className="text-sm text-gold-50/90">I consent to Custosasho storing and protecting my data for this design journey.</span>
            </label>
          </div>

          {confirmation && (
            <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              {confirmation}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const stepContentMap: Record<StepId, () => JSX.Element> = {
    welcome: renderWelcome,
    base: renderBaseSelection,
    stripes: renderStripeSelection,
    package: renderPackageSelection,
    consent: renderConsent,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pt-24 pb-16">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm uppercase tracking-[0.35em] text-gold-500">Design Module</h2>
              <h1 className="mt-3 text-4xl font-display font-bold text-white sm:text-5xl">
                Custosasho Interactive Experience
              </h1>
            </div>
            <div className="w-full sm:w-64">
              <div className="h-2 rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-amber-400 transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs uppercase tracking-widest text-gray-400">
                Step {stepIndex + 1} of {STEP_FLOW.length}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white">{currentStep.title}</h3>
            <p className="mt-2 max-w-3xl text-sm text-gray-400">{currentStep.description}</p>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="relative flex-1">
          <AnimatePresence mode="wait">{stepContentMap[currentStep.id]()}</AnimatePresence>
        </div>

        <footer className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gray-500">
            <span>Need help?</span>
            <span className="text-gold-400">support@custosasho.com</span>
          </div>

          <div className="flex items-center gap-4 self-end">
            <button
              onClick={handleBack}
              disabled={stepIndex === 0 || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-300 transition-all hover:border-gold-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-500 to-amber-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:from-gold-400 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {stepIndex === STEP_FLOW.length - 1 ? (
                <>
                  {saving ? 'Saving...' : 'Save & Go to Dashboard'}
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
