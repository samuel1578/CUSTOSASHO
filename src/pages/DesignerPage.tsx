import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveDesignSubmission, createNNSOrder } from '../lib/appwrite';
import { SIMPLE_INPUT_SCHOOLS } from '../lib/constants';
import blackBasePreview from '../assets/blckbse.jpg';
import yellowBasePreview from '../assets/yellowbse.png';
import brandLogo from '../assets/logo.png';
import nnsLogo from '../assets/nns.png';
import nnsMaleImage from '../assets/nnsmale.jpeg';
import nnsFemaleImage from '../assets/nnsfem.jpeg';

type StepId = 'welcome' | 'base' | 'package' | 'consent';
type NNSStepId = 'contact' | 'brief' | 'review';

interface StepDefinition {
  id: StepId | NNSStepId;
  title: string;
  description: string;
}

// University of Ghana flow
const UG_STEP_FLOW: StepDefinition[] = [
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

// New Nation School flow
const NNS_STEP_FLOW: StepDefinition[] = [
  {
    id: 'contact',
    title: 'Your Information',
    description: 'Confirm your details for your custom stole order.',
  },
  {
    id: 'brief',
    title: 'Design Brief',
    description: 'Share your vision and design ideas with our creative team.',
  },
  {
    id: 'review',
    title: 'Review & Order',
    description: 'Review your order details and submit for creation.',
  },
];

interface BaseOption {
  value: string;
  title: string;
  description: string;
  image: string;
}

const GRADUATING_CLASS_OPTIONS = [
  'First Class',
  'Second Class Upper',
  'Second Class Lower',
  'Third Class',
  'Pass',
];

const FACULTY_LOGO_OPTIONS = [
  {
    value: 'science',
    label: 'Science Faculty Logo',
  },
  {
    value: 'engineering',
    label: 'Engineering Faculty Logo',
  },
  {
    value: 'business',
    label: 'Business Faculty Logo',
  },
  {
    value: 'arts',
    label: 'Arts Faculty Logo',
  },
];

const BASE_COLORS: BaseOption[] = [
  {
    value: 'black',
    title: 'Black Base',
    description: 'Classic ebony backdrop that makes every accent shimmer.',
    image: blackBasePreview,
  },
  {
    value: 'yellow',
    title: 'Yellow Base',
    description: 'Radiant gold-tone to spotlight your achievements.',
    image: yellowBasePreview,
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
  packageChoice: 'standard' | 'premium';
  quote: string;
  additionalNotes: string;
  consentAccepted: boolean;
  graduatingClass: string;
  facultyLogo: string;
  contact: {
    fullName: string;
    email: string;
    phone: string;
    course: string;
    graduationYear: string;
  };
}

interface NNSFormState {
  designBrief: string;
  selectedGender: 'male' | 'female' | '';
  contact: {
    fullName: string;
    course: string;
  };
}

export function DesignerPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Detect school type for different flows
  const isNNSUser = profile?.university && SIMPLE_INPUT_SCHOOLS.includes(profile.university as any);
  const STEP_FLOW = isNNSUser ? NNS_STEP_FLOW : UG_STEP_FLOW;

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<DesignerFormState>({
    baseColor: '',
    packageChoice: 'standard',
    quote: '',
    additionalNotes: '',
    consentAccepted: false,
    graduatingClass: '',
    facultyLogo: '',
    contact: {
      fullName: '',
      email: '',
      phone: '',
      course: '',
      graduationYear: '',
    },
  });
  const [nnsForm, setNnsForm] = useState<NNSFormState>({
    designBrief: '',
    selectedGender: '',
    contact: {
      fullName: '',
      course: '',
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

    if (isNNSUser) {
      // Update NNS form with profile data
      setNnsForm((prev) => ({
        ...prev,
        selectedGender: prev.selectedGender || profile?.gender || '',
        contact: {
          fullName: prev.contact.fullName || profile?.fullName || user.name || user.email || '',
          course: prev.contact.course || profile?.course || profile?.programme || '',
        },
      }));
    } else {
      // Update UG form with profile data (existing logic)
      setForm((prev) => ({
        ...prev,
        contact: {
          fullName: prev.contact.fullName || profile?.fullName || user.name || user.email || '',
          email: prev.contact.email || user.email || '',
          phone: prev.contact.phone || profile?.phone || '',
          course: prev.contact.course || profile?.course || profile?.programme || '',
          graduationYear: prev.contact.graduationYear || profile?.graduationYear || '',
        },
      }));
    }
  }, [user, profile, isNNSUser]);

  const currentStep = useMemo(() => STEP_FLOW[stepIndex], [stepIndex]);
  const progress = useMemo(() => ((stepIndex + 1) / STEP_FLOW.length) * 100, [stepIndex]);

  const handleBaseSelection = (value: string) => {
    setForm((prev) => ({ ...prev, baseColor: value }));
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
    if (isNNSUser) {
      // NNS validation
      switch (currentStep.id) {
        case 'contact':
          if (!nnsForm.contact.fullName || !nnsForm.contact.course) {
            return 'Contact information is required.';
          }
          break;
        case 'brief':
          if (!nnsForm.designBrief.trim()) {
            return 'Please provide a design brief for our creative team.';
          }
          if (!nnsForm.selectedGender) {
            return 'Please select your gender to preview your stole reference image.';
          }
          if (nnsForm.designBrief.length > 500) {
            return 'Design brief must be less than 500 characters.';
          }
          break;
        case 'review':
          // Final validation
          if (!nnsForm.contact.fullName || !nnsForm.contact.course || !nnsForm.designBrief.trim() || !nnsForm.selectedGender) {
            return 'Please complete all required information.';
          }
          break;
      }
    } else {
      // UG validation (existing)
      switch (currentStep.id) {
        case 'base':
          if (!form.baseColor) {
            return 'Please choose a base color to continue.';
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
    }
    return null;
  };

  const handleNext = async () => {
    setError(null);

    // Check if we're at the last step
    const isLastStep = stepIndex === STEP_FLOW.length - 1;

    if (isLastStep) {
      const validationError = validateStep();
      if (validationError) {
        setError(validationError);
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

      if (isNNSUser) {
        // Handle NNS order submission
        const orderData = await createNNSOrder(user.$id, {
          fullName: nnsForm.contact.fullName,
          email: user.email,
          phone: profile?.phone || undefined,
          course: nnsForm.contact.course,
          graduationYear: profile?.graduationYear || undefined,
          selectedGender: nnsForm.selectedGender || undefined,
          designBrief: nnsForm.designBrief,
        });

        if (orderData) {
          setConfirmation('Your custom stole order has been submitted! Our design team will contact you soon.');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          throw new Error('Failed to create order');
        }
      } else {
        // Handle UG order submission (existing logic)
        await saveDesignSubmission(user.$id, {
          baseColor: form.baseColor,
          packageChoice: form.packageChoice,
          quote: form.quote,
          additionalNotes: form.additionalNotes,
          consentAccepted: form.consentAccepted,
          graduatingClass: form.graduatingClass || undefined,
          facultyLogo: form.facultyLogo || undefined,
          contact: form.contact,
        });
        setConfirmation('Your Custosasho design journey is saved. Redirecting you to the dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
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
      className="mx-auto w-full max-w-3xl space-y-8 text-center"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-accent-primary/50 bg-app-surface/40 p-3 shadow-md shadow-accent-primary/10">
          <img src={brandLogo} alt="Custosasho logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <h1 className="mb-4 text-4xl font-display font-bold text-text-primary sm:text-5xl">
            Welcome to your Custosasho design journey
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-text-secondary">
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
      <div className="grid gap-6 md:grid-cols-2">
        {BASE_COLORS.map((color) => {
          const selected = form.baseColor === color.value;
          return (
            <button
              key={color.value}
              onClick={() => handleBaseSelection(color.value)}
              className={`group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all ${selected
                ? 'border-accent-primary/80 bg-accent-primary/10 shadow-lg shadow-accent-primary/20'
                : 'border-border-subtle/50 bg-app-surface/40 hover:border-accent-primary/60 hover:bg-app-surface/70'
                }`}
            >
              <div className="h-48 w-full overflow-hidden rounded-xl bg-app-surface">
                <img
                  src={color.image}
                  alt={color.title}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">{color.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{color.description}</p>
              </div>
              {selected && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-accent-primary/20 px-3 py-1 text-xs font-semibold text-accent-primary">
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
                ? 'cursor-not-allowed border-border-subtle/50 bg-app-surface/30 text-text-secondary'
                : selected
                  ? 'border-accent-primary/80 bg-accent-primary/10 shadow-lg shadow-accent-primary/25'
                  : 'border-border-subtle/50 bg-app-surface/40 hover:border-accent-primary/60 hover:bg-app-surface/70'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-text-primary">{option.title}</h3>
                  <p className="mt-1 text-sm text-accent-primary">{option.layers}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${unavailable
                  ? 'bg-accent-secondary/10 text-accent-secondary'
                  : 'bg-accent-primary/15 text-accent-primary'
                  }`}>
                  {option.status}
                </div>
              </div>

              <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-6 text-center text-sm uppercase tracking-wide text-text-secondary">
                Mockup Placeholder
              </div>

              <ul className="space-y-3">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-text-secondary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {unavailable && (
                <p className="rounded-lg border border-accent-secondary/40 bg-accent-secondary/10 px-4 py-3 text-sm text-accent-secondary">
                  Let the people know this stole is not currently under production. Stay tuned for an official release announcement.
                </p>
              )}

              {selected && !unavailable && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-accent-primary/20 px-3 py-1 text-xs font-semibold text-accent-primary">
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
            <label className="mb-2 block text-sm font-semibold text-text-secondary">Full Name</label>
            <input
              value={form.contact.fullName}
              onChange={(event) => updateContact('fullName', event.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Email Address</label>
              <input
                type="email"
                value={form.contact.email}
                onChange={(event) => updateContact('email', event.target.value)}
                placeholder="Graduate email"
                className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Phone</label>
              <input
                value={form.contact.phone}
                onChange={(event) => updateContact('phone', event.target.value)}
                placeholder="Optional contact number"
                className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Course / Program</label>
              <input
                value={form.contact.course}
                onChange={(event) => updateContact('course', event.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Graduation Year</label>
              <input
                value={form.contact.graduationYear}
                onChange={(event) => updateContact('graduationYear', event.target.value)}
                placeholder="e.g. 2026"
                className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Graduating Class <span className="text-xs font-normal text-text-secondary/70">(optional)</span></label>
              <select
                value={form.graduatingClass}
                onChange={(event) => setForm((prev) => ({ ...prev, graduatingClass: event.target.value }))}
                className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
              >
                <option value="">Select class</option>
                {GRADUATING_CLASS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Faculty Logo <span className="text-xs font-normal text-text-secondary/70">(optional)</span></label>
              <select
                value={form.facultyLogo}
                onChange={(event) => setForm((prev) => ({ ...prev, facultyLogo: event.target.value }))}
                className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
              >
                <option value="">No logo</option>
                {FACULTY_LOGO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-text-secondary">Favourite Quote</label>
            <textarea
              value={form.quote}
              onChange={(event) => setForm((prev) => ({ ...prev, quote: event.target.value }))}
              placeholder="Share the words that must live on your stole (e.g. GOD DID, ALL GOD, NOT ME)."
              rows={3}
              className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-text-secondary">Additional Notes</label>
            <textarea
              value={form.additionalNotes}
              onChange={(event) => setForm((prev) => ({ ...prev, additionalNotes: event.target.value }))}
              placeholder="Any extra requests, imagery references, or delivery considerations."
              rows={3}
              className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-accent-primary/40 bg-accent-primary/10 p-6 text-text-primary">
            <div className="flex items-center gap-3 text-accent-primary">
              <ShieldCheck className="h-6 w-6" />
              <p className="text-sm font-semibold uppercase tracking-wide">Custosasho Care Policy</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-primary/90">
              By sharing your information you authorize Custosasho to securely store, review, and reference your design request. We respect your privacy, protect your data, and use it only to craft your stole and keep our creative team aligned.
            </p>
            <label className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(event) => setForm((prev) => ({ ...prev, consentAccepted: event.target.checked }))}
                className="h-5 w-5 rounded border-accent-primary/50 bg-transparent text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-sm text-text-primary/90">I consent to Custosasho storing and protecting my data for this design journey.</span>
            </label>
          </div>

          {confirmation && (
            <div className="rounded-xl border border-accent-secondary/40 bg-accent-secondary/10 px-4 py-3 text-sm text-accent-secondary">
              {confirmation}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // NNS Step Components
  const renderNNSContact = () => (
    <motion.div
      key="contact"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="flex flex-col md:flex-row md:items-start md:gap-8">
        {/* Form Content */}
        <div className="flex-1 max-w-2xl space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">Full Name</label>
            <input
              type="text"
              value={nnsForm.contact.fullName}
              readOnly
              className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated/40 px-4 py-3 text-text-primary opacity-60"
            />
            <p className="mt-1 text-xs text-text-secondary">From your profile</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">Course</label>
            <input
              type="text"
              value={nnsForm.contact.course}
              readOnly
              className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated/40 px-4 py-3 text-text-primary opacity-60"
            />
            <p className="mt-1 text-xs text-text-secondary">From your profile</p>
          </div>

          <div className="mt-8 rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-4">
            <p className="text-sm text-text-primary">
              <strong>Custom Stole Price:</strong> ¢150.00 (same as standard package)
            </p>
          </div>
        </div>

        {/* Large NNS Logo - Desktop Only, aligned with form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden md:flex flex-shrink-0 items-start justify-center mt-4"
        >
          <div className="relative md:animate-[circular-motion_8s_linear_infinite]">
            <img
              src={nnsLogo}
              alt="New Nation School"
              className="h-32 w-32 object-contain"
            />
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes circular-motion {
                  0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
                  100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
                }
              `
            }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderNNSBrief = () => (
    <motion.div
      key="brief"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="flex flex-col md:flex-row md:items-start md:gap-8">
        {/* Form Content */}
        <div className="flex-1 max-w-3xl space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">Design Statement</label>
            <textarea
              value={nnsForm.designBrief}
              onChange={(e) => setNnsForm(prev => ({ ...prev, designBrief: e.target.value }))}
              placeholder="Share your statement with our creative team. Examples: 'GOD DID', 'IT'S BEEN GOD', 'ALL GOD NOT ME', or describe colors, symbols, and design elements you want..."
              rows={8}
              className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 text-text-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
            />
            <p className="mt-2 text-xs text-text-secondary">
              {nnsForm.designBrief.length}/500 characters
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle/40 bg-app-surface/40 p-4">
            <p className="text-sm text-text-secondary">
              <strong>Design Process:</strong> Our creative team will review your statement and create a custom design draft.
              You'll receive updates via email and can request revisions before final production.
            </p>
          </div>
        </div>

        {/* Gender-based reference preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 w-full md:mt-0 md:w-[320px] md:flex-shrink-0"
        >
          <div className="overflow-hidden rounded-2xl border border-border-subtle/50 bg-app-surface/60 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary/80">Reference Preview</div>
              <div className="inline-flex rounded-lg border border-border-subtle/50 bg-app-elevated/70 p-1">
                <button
                  type="button"
                  onClick={() => setNnsForm(prev => ({ ...prev, selectedGender: 'male' }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${nnsForm.selectedGender === 'male'
                    ? 'bg-accent-primary text-text-inverted'
                    : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setNnsForm(prev => ({ ...prev, selectedGender: 'female' }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${nnsForm.selectedGender === 'female'
                    ? 'bg-accent-primary text-text-inverted'
                    : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  Female
                </button>
              </div>
            </div>
            <div className="h-72 w-full overflow-hidden rounded-xl border border-border-subtle/40 bg-app-elevated sm:h-80 md:h-[420px]">
              <img
                src={nnsForm.selectedGender === 'female' ? nnsFemaleImage : nnsMaleImage}
                alt={nnsForm.selectedGender === 'female' ? 'Female stole reference' : 'Male stole reference'}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              {nnsForm.selectedGender === 'female'
                ? 'Female preview selected.'
                : nnsForm.selectedGender === 'male'
                  ? 'Male preview selected.'
                  : 'Use the toggle to preview either version.'}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderNNSReview = () => (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="flex flex-col md:flex-row md:items-start md:gap-8">
        {/* Form Content */}
        <div className="flex-1 max-w-2xl space-y-6">
          <div className="rounded-xl border border-border-subtle/50 bg-app-surface/40 p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Student:</span>
                <span className="text-text-primary">{nnsForm.contact.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Course:</span>
                <span className="text-text-primary">{nnsForm.contact.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Gender:</span>
                <span className="text-text-primary capitalize">{nnsForm.selectedGender || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">School:</span>
                <span className="text-text-primary">New Nation School</span>
              </div>
              <div className="border-t border-border-subtle/30 pt-3 flex justify-between font-semibold">
                <span className="text-text-primary">Total:</span>
                <span className="text-accent-primary">¢150.00</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle/50 bg-app-surface/40 p-6">
            <h4 className="text-sm font-medium text-text-secondary mb-2">Design Brief:</h4>
            <p className="text-sm text-text-primary">{nnsForm.designBrief || 'No design brief provided'}</p>
          </div>

          <div className="rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-4">
            <p className="text-xs text-text-primary">
              By submitting this order, you authorize Custosasho to create a custom stole design based on your brief.
              Our team will contact you with design drafts and delivery timeline.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 w-full md:mt-0 md:w-[320px] md:flex-shrink-0"
        >
          <div className="overflow-hidden rounded-2xl border border-border-subtle/50 bg-app-surface/60 p-3">
            <div className="mb-3 text-xs uppercase tracking-[0.22em] text-text-secondary/80">Confirmed Preview</div>
            <div className="h-72 w-full overflow-hidden rounded-xl border border-border-subtle/40 bg-app-elevated sm:h-80 md:h-[420px]">
              <img
                src={nnsForm.selectedGender === 'female' ? nnsFemaleImage : nnsMaleImage}
                alt={nnsForm.selectedGender === 'female' ? 'Female stole reference' : 'Male stole reference'}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const stepContentMap: Record<string, () => JSX.Element> = isNNSUser ? {
    contact: renderNNSContact,
    brief: renderNNSBrief,
    review: renderNNSReview,
  } : {
    welcome: renderWelcome,
    base: renderBaseSelection,
    package: renderPackageSelection,
    consent: renderConsent,
  };

  return (
    <div className="min-h-screen bg-app-base pt-24 pb-16 text-text-primary transition-colors">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {isNNSUser && (
                <div className="flex-shrink-0">
                  <img
                    src={nnsLogo}
                    alt="New Nation School"
                    className="h-16 w-16 object-contain"
                  />
                </div>
              )}
              <div>
                <h2 className="text-sm uppercase tracking-[0.35em] text-accent-primary">Design Module</h2>
                <h1 className="mt-3 text-4xl font-display font-bold text-text-primary sm:text-5xl">
                  Custosasho Interactive Experience
                </h1>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <div className="h-2 rounded-full bg-app-elevated/60">
                <div
                  className="h-full rounded-full btn-accent-gradient transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs uppercase tracking-widest text-text-secondary/80">
                Step {stepIndex + 1} of {STEP_FLOW.length}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-text-primary">{currentStep.title}</h3>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">{currentStep.description}</p>
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
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
            <span>Need help?</span>
            <span className="text-accent-primary">support@custosasho.com</span>
          </div>

          <div className="flex items-center gap-4 self-end">
            <button
              onClick={handleBack}
              disabled={stepIndex === 0 || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-border-subtle/50 px-5 py-3 text-sm font-semibold text-text-secondary transition-all hover:border-accent-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={saving}
              className="btn-accent-gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-text-inverted transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
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
};
