import { motion } from 'framer-motion';

interface HamburgerButtonProps {
    isOpen: boolean;
    onToggle: () => void;
    controlsId: string;
}

export function HamburgerButton({ isOpen, onToggle, controlsId }: HamburgerButtonProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={controlsId}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-app-elevated/70 backdrop-blur transition-colors hover:bg-app-elevated focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-app-base"
        >
            <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
            <motion.span
                initial={false}
                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : -6 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute h-0.5 w-7 rounded-full bg-text-primary"
            />
            <motion.span
                initial={false}
                animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? 0 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute h-0.5 w-7 rounded-full bg-text-primary"
            />
            <motion.span
                initial={false}
                animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 6 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute h-0.5 w-7 rounded-full bg-text-primary"
            />
        </button>
    );
}
