import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Calendar, GraduationCap, MapPin, Phone, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UNIVERSITY_ACADEMICS, SCHOOL_OPTIONS, SIMPLE_INPUT_SCHOOLS } from '../lib/constants';

const trim = (value: string) => value.trim();

interface ProfileModalProps {
    isEditMode?: boolean;
    onClose?: () => void;
}

export function ProfileModal({ isEditMode = false, onClose }: ProfileModalProps = {}) {
    const {
        user,
        profile,
        profileLoading,
        profileComplete,
        saveProfile,
        consumePendingRedirect,
    } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [fullName, setFullName] = useState(() => profile?.fullName || user?.name || user?.email || '');
    const [college, setCollege] = useState(() => profile?.college ?? '');
    const [university, setUniversity] = useState(() => profile?.university ?? '');
    const [programme, setProgramme] = useState(() => profile?.programme ?? '');
    const [course, setCourse] = useState(() => profile?.course ?? ''); // For simple input schools
    const [graduationYear, setGraduationYear] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const academicData = useMemo(() => UNIVERSITY_ACADEMICS, []);

    const schools = useMemo(() => SCHOOL_OPTIONS, []);

    const isSimpleInputSchool = useMemo(() => {
        return university && SIMPLE_INPUT_SCHOOLS.includes(university as any);
    }, [university]);

    const availableColleges = useMemo(() => {
        if (!university) return [];
        const entry = academicData[university as keyof typeof academicData];
        if (!entry) return [];
        const options = Object.keys(entry.colleges);
        return college && !options.includes(college) ? [...options, college] : options;
    }, [academicData, university, college]);

    const availableProgrammes = useMemo(() => {
        if (!university || !college) return [];
        const entry = academicData[university as keyof typeof academicData];
        const programmes = entry?.colleges?.[college as keyof typeof entry.colleges] ?? ([] as string[]);
        const list = Array.from(programmes);
        return programme && !list.includes(programme as (typeof list)[number]) ? [...list, programme] : list;
    }, [academicData, university, college, programme]);

    const shouldShowModal = useMemo(
        () => isEditMode || Boolean(user && !profileLoading && !profileComplete),
        [user, profileLoading, profileComplete, isEditMode]
    );

    useEffect(() => {
        if (profile?.fullName) {
            setFullName(profile.fullName);
        } else if (!profileLoading && (user?.name || user?.email)) {
            setFullName((prev) => (trim(prev) ? prev : user?.name || user?.email || ''));
        }

        if (profile) {
            setCollege(profile.college ?? '');
            setUniversity(profile.university ?? '');
            setProgramme(profile.programme ?? '');
            setCourse(profile.course ?? '');
            setGraduationYear(profile.graduationYear ?? '');
            setPhone(profile.phone ?? '');
        }
    }, [profile, profileLoading, user]);

    useEffect(() => {
        if (!university) {
            setCollege('');
            setProgramme('');
            setCourse('');
            return;
        }

        // For simple input schools, clear dropdown fields and keep course field
        if (SIMPLE_INPUT_SCHOOLS.includes(university as any)) {
            setCollege('');
            setProgramme('');
            return;
        }

        // For University of Ghana, clear course field and handle dropdown logic
        setCourse('');
        const entry = academicData[university as keyof typeof academicData];
        if (!entry) {
            setCollege('');
            setProgramme('');
            return;
        }

        const collegeOptions = Object.keys(entry.colleges);
        if (college && !collegeOptions.includes(college)) {
            setCollege('');
            setProgramme('');
        }
    }, [academicData, university, college]);

    useEffect(() => {
        if (!university || !college) {
            setProgramme('');
            return;
        }

        const entry = academicData[university as keyof typeof academicData];
        const programmes: string[] = entry?.colleges?.[college as keyof typeof entry.colleges] ?? [];

        if (programme && !programmes.includes(programme)) {
            setProgramme('');
        }
    }, [academicData, university, college, programme]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        // Validate required fields based on school type
        let requiredFields: string[];
        if (isSimpleInputSchool) {
            requiredFields = [fullName, university, course, graduationYear];
        } else {
            requiredFields = [fullName, university, college, programme, graduationYear];
        }

        const hasEmptyField = requiredFields.some((value) => trim(value) === '');

        if (hasEmptyField) {
            setError('Please complete all required fields before continuing.');
            return;
        }

        setSubmitting(true);
        const profileData: any = {
            fullName: trim(fullName),
            university: trim(university),
            graduationYear: trim(graduationYear),
            phone: trim(phone) || null,
            onboardingComplete: true,
        };

        if (isSimpleInputSchool) {
            profileData.course = trim(course);
            profileData.college = null;
            profileData.programme = null;
        } else {
            profileData.college = trim(college);
            profileData.programme = trim(programme);
            profileData.course = null;
        }

        const { error } = await saveProfile(profileData);

        if (error) {
            setError(error.message ?? 'Unable to save your profile. Please try again.');
            setSubmitting(false);
            return;
        }

        if (isEditMode && onClose) {
            setSubmitting(false);
            onClose();
            return;
        }

        const target = consumePendingRedirect() ?? (location.pathname.includes('/admin') ? '/admin' : '/dashboard');
        setSubmitting(false);
        navigate(target, { replace: true });
    };

    return (
        <AnimatePresence>
            {shouldShowModal && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-app-base/80 backdrop-blur transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-2xl rounded-2xl border border-border-subtle/40 bg-app-surface/90 p-8 text-text-primary shadow-2xl transition-colors"
                    >
                        {isEditMode && onClose && (
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 rounded-full border border-border-subtle/40 bg-app-elevated/70 p-2 text-text-secondary transition-colors hover:border-accent-primary hover:text-accent-primary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}

                        <div className="mb-6 flex items-start gap-4">
                            <div className="rounded-xl bg-accent-primary/15 p-3 text-accent-primary">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-semibold text-text-primary">
                                    {isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
                                </h2>
                                <p className="mt-2 text-sm text-text-secondary">
                                    {isEditMode
                                        ? 'Update your personal and academic information below.'
                                        : 'We need a little more information to personalize your stole experience and keep our team aligned with your graduation journey.'
                                    }
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text-secondary">Full Name</label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/70" />
                                    <input
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated py-3 pl-11 pr-4 text-text-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
                                        placeholder="Ama Mensah"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text-secondary">School</label>
                                    <div className="relative">
                                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/70" />
                                        <select
                                            value={university}
                                            onChange={(event) => {
                                                setUniversity(event.target.value);
                                                setCollege('');
                                                setProgramme('');
                                                setCourse('');
                                            }}
                                            className="w-full appearance-none rounded-lg border border-border-subtle/50 bg-app-elevated py-3 pl-11 pr-4 text-text-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
                                        >
                                            <option value="" disabled>
                                                Select school
                                            </option>
                                            {schools.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {!isSimpleInputSchool && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-text-secondary">College</label>
                                        <div className="relative">
                                            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/70" />
                                            <select
                                                value={college}
                                                onChange={(event) => {
                                                    setCollege(event.target.value);
                                                    setProgramme('');
                                                }}
                                                disabled={!university}
                                                className="w-full appearance-none rounded-lg border border-border-subtle/50 bg-app-elevated py-3 pl-11 pr-4 text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
                                            >
                                                <option value="" disabled>
                                                    {university ? 'Select college' : 'Choose school first'}
                                                </option>
                                                {availableColleges.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {isSimpleInputSchool ? (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-text-secondary">Course</label>
                                        <div className="relative">
                                            <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/70" />
                                            <input
                                                value={course}
                                                onChange={(event) => setCourse(event.target.value)}
                                                className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated py-3 pl-11 pr-4 text-text-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
                                                placeholder="Enter your course"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-text-secondary">Programme</label>
                                        <div className="relative">
                                            <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/70" />
                                            <select
                                                value={programme}
                                                onChange={(event) => setProgramme(event.target.value)}
                                                disabled={!college}
                                                className="w-full appearance-none rounded-lg border border-border-subtle/50 bg-app-elevated py-3 pl-11 pr-4 text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
                                            >
                                                <option value="" disabled>
                                                    {college ? 'Select programme' : 'Choose college first'}
                                                </option>
                                                {availableProgrammes.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text-secondary">Graduation Year</label>
                                    <div className="relative">
                                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/70" />
                                        <input
                                            value={graduationYear}
                                            onChange={(event) => setGraduationYear(event.target.value)}
                                            className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated py-3 pl-11 pr-4 text-text-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
                                            placeholder="2026"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-text-secondary">Contact Phone (optional)</label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/70" />
                                    <input
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated py-3 pl-11 pr-4 text-text-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/60"
                                        placeholder="+233 123 456 789"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-400">{error}</p>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-accent-gradient w-full rounded-lg py-3 text-center text-sm font-semibold text-text-inverted transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {submitting ? 'Saving profile...' : (isEditMode ? 'Update Profile' : 'Save and Continue')}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
