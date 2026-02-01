import { motion } from 'framer-motion';
import { MoonStar, SunMedium } from 'lucide-react';
import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type ThemeToggleProps = {
    className?: string;
    layout?: 'horizontal' | 'vertical';
    emphasizeLabel?: boolean;
};

export function ThemeToggle({ className = '', layout = 'horizontal', emphasizeLabel = false }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isLight = theme === 'light';

    const labels = useMemo(() => (
        layout === 'horizontal'
            ? (
                <span className={`ml-3 text-sm font-medium transition-colors ${emphasizeLabel ? 'text-text-secondary' : 'text-text-secondary/80'} ${isLight ? 'text-text-primary' : ''}`}>
                    {isLight ? 'Light Mode' : 'Dark Mode'}
                </span>
            )
            : (
                <span className={`mt-2 text-xs uppercase tracking-[0.3em] text-text-secondary/80 ${isLight ? 'text-accent-primary' : ''}`}>
                    {isLight ? 'Light' : 'Dark'}
                </span>
            )
    ), [emphasizeLabel, isLight, layout]);

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isLight}
            onClick={toggleTheme}
            className={`group flex items-center ${layout === 'vertical' ? 'flex-col' : 'flex-row'} rounded-full bg-app-elevated/40 px-2 py-2 text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/70 focus:ring-offset-2 focus:ring-offset-app-base ${className}`}
        >
            <div className="relative flex h-8 w-16 items-center rounded-full bg-app-muted/60 p-1">
                <motion.div
                    initial={false}
                    animate={{ x: isLight ? 32 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="relative flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-text-inverted shadow-lg shadow-accent-primary/40"
                >
                    {isLight ? (
                        <SunMedium className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <MoonStar className="h-4 w-4" aria-hidden="true" />
                    )}
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
                    <SunMedium className={`h-3 w-3 transition-opacity ${isLight ? 'opacity-100 text-accent-secondary' : 'opacity-40'}`} aria-hidden="true" />
                    <MoonStar className={`h-3 w-3 transition-opacity ${!isLight ? 'opacity-100 text-accent-tertiary' : 'opacity-40'}`} aria-hidden="true" />
                </div>
            </div>
            {labels}
        </button>
    );
}
