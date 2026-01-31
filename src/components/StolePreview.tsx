import { motion } from 'framer-motion';

interface StolePreviewProps {
  design: {
    packageTier: 'basic' | 'standard' | 'custom';
    primaryColor: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    quaternaryColor?: string;
    text: string;
    font: string;
    fabric: string;
    symbols: string[];
    metallic?: boolean;
    customLogo?: string;
  };
}

export function StolePreview({ design }: StolePreviewProps) {
  const getFontClass = (font: string) => {
    const fontMap: Record<string, string> = {
      serif: 'font-serif',
      'sans-serif': 'font-sans',
      script: 'font-serif italic',
      modern: 'font-sans',
      elegant: 'font-serif',
      bold: 'font-sans font-bold',
      cursive: 'font-serif italic',
      decorative: 'font-display',
      vintage: 'font-serif',
      calligraphy: 'font-serif italic',
      gothic: 'font-display',
      luxury: 'font-display',
    };
    return fontMap[font] || 'font-sans';
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <svg
          viewBox="0 0 200 400"
          className="w-full h-auto drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
        >
          <defs>
            <linearGradient id="stoleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={design.primaryColor} />
              {design.secondaryColor && <stop offset="50%" stopColor={design.secondaryColor} />}
              {design.tertiaryColor && <stop offset="75%" stopColor={design.tertiaryColor} />}
              {design.quaternaryColor && <stop offset="100%" stopColor={design.quaternaryColor} />}
            </linearGradient>

            {design.metallic && (
              <linearGradient id="metallicSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0)" />
                <stop offset="50%" stopColor="rgba(212, 175, 55, 0.3)" />
                <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
              </linearGradient>
            )}
          </defs>

          <path
            d="M 60 0 L 140 0 L 140 400 L 60 400 Z"
            fill="url(#stoleGradient)"
            stroke={design.metallic ? '#D4AF37' : '#000000'}
            strokeWidth="2"
          />

          {design.metallic && (
            <path
              d="M 60 0 L 140 0 L 140 400 L 60 400 Z"
              fill="url(#metallicSheen)"
              opacity="0.5"
            />
          )}

          <path d="M 50 0 L 60 20 L 60 380 L 50 400 L 60 400 L 60 0 Z" fill="#1a1a1a" opacity="0.3" />
          <path d="M 150 0 L 140 20 L 140 380 L 150 400 L 140 400 L 140 0 Z" fill="#1a1a1a" opacity="0.3" />

          {design.packageTier !== 'basic' && design.symbols.length > 0 && (
            <g>
              {design.symbols.slice(0, 3).map((symbol, index) => (
                <text
                  key={index}
                  x="100"
                  y={80 + index * 80}
                  textAnchor="middle"
                  fontSize="24"
                  fill={design.metallic ? '#D4AF37' : '#FFFFFF'}
                >
                  {symbol}
                </text>
              ))}
            </g>
          )}

          <text
            x="100"
            y="200"
            textAnchor="middle"
            className={getFontClass(design.font)}
            fontSize="16"
            fill={design.metallic ? '#D4AF37' : '#FFFFFF'}
            fontWeight={design.font.includes('bold') ? 'bold' : 'normal'}
          >
            {design.text.split(' ').map((word, index) => (
              <tspan key={index} x="100" dy={index === 0 ? 0 : 20}>
                {word}
              </tspan>
            ))}
          </text>
        </svg>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Fabric: {design.fabric}</p>
          {design.metallic && (
            <span className="inline-block bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-xs">
              Metallic Thread
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
