import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Palette, Truck, Award, Check } from 'lucide-react';
import { PACKAGES } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import stdImage from '../assets/STD.png';

export function LandingPage() {
  const [flippedKey, setFlippedKey] = useState<string | null>(null);
  const { user, profileComplete, setPendingRedirect } = useAuth();
  const navigate = useNavigate();

  const handleStartDesign = (targetPath: string) => {
    if (!user) {
      setPendingRedirect(targetPath);
      navigate(`/register?next=${encodeURIComponent(targetPath)}`);
      return;
    }

    if (!profileComplete) {
      setPendingRedirect(targetPath);
      navigate('/dashboard');
      return;
    }

    navigate(targetPath);
  };

  return (
    <div className="bg-black text-white">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-kente-red rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block mb-2"
            >
              <img src={logo} alt="Custosasho Logo" width={256} height={256} className="mx-auto" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-2 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 bg-clip-text text-transparent">
              Crafted to Represent
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Honor your heritage and celebrate your achievement with a custom graduation stole that tells your unique story
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleStartDesign('/designer')}
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-gold-400 hover:to-gold-500 transition-all transform hover:scale-105"
              >
                Design Your Stole
              </button>
              <Link
                to="/gallery"
                className="border-2 border-gold-500 text-gold-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gold-500/10 transition-all inline-block"
              >
                View Gallery
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-gold-400">
              Why Choose CustoSasho
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Premium quality meets cultural authenticity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Palette,
                title: 'Custom Design',
                description: 'Create a stole that perfectly represents your heritage and achievements',
              },
              {
                icon: Award,
                title: 'Premium Quality',
                description: 'Handcrafted with luxury fabrics and meticulous attention to detail',
              },
              {
                icon: Sparkles,
                title: 'Cultural Pride',
                description: 'Kente-inspired designs celebrating African heritage and traditions',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description: 'Rush options available to meet your graduation timeline',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-gray-900/50 backdrop-blur p-8 rounded-xl border border-gold-500/20 hover:border-gold-500/40 transition-all group"
              >
                <feature.icon className="h-12 w-12 text-gold-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-gold-400">
              Choose Your Package
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select the perfect tier for your custom stole
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.entries(PACKAGES).map(([key, pkg], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className={`relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 ${key === 'custom' ? 'border-gold-500' : 'border-gold-500/20'
                  } hover:border-gold-500/60 transition-all group`}
              >
                {key === 'custom' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-600 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Personalized
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center">
                    {pkg.available ? (
                      <span className="text-5xl font-bold text-gold-400">{pkg.price} CEDIS</span>
                    ) : (
                      <span className="rounded-full bg-gold-500/10 text-gold-300 px-3 py-1 text-sm font-semibold">COMING SOON</span>
                    )}
                  </div>
                </div>

                {/* Standard card supports flip-to-see preview */}
                {key === 'standard' ? (
                  <>
                    {flippedKey === key ? (
                      <div className="mb-6 overflow-visible">
                        <img src={stdImage} alt="Standard preview" className="w-full h-auto max-h-[420px] object-contain rounded-lg mx-auto" />
                      </div>
                    ) : (
                      <ul className={`space-y-4 mb-8 ${pkg.available ? '' : 'opacity-60'}`}>
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="h-5 w-5 text-gold-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex gap-3">
                      {flippedKey === key ? (
                        <button
                          onClick={() => setFlippedKey(null)}
                          className="flex-1 py-3 rounded-lg font-semibold transition-all bg-gray-700 text-white hover:bg-gray-600"
                        >
                          Back
                        </button>
                      ) : pkg.available ? (
                        <>
                          <button
                            onClick={() => handleStartDesign(`/designer?package=${key}`)}
                            className="flex-1 py-3 rounded-lg font-semibold transition-all bg-gray-700 text-white hover:bg-gray-600"
                          >
                            Get Started
                          </button>
                          <button
                            onClick={() => setFlippedKey(key)}
                            className="w-40 py-3 rounded-lg font-semibold transition-all border border-gold-500 text-gold-300 hover:bg-gold-500/10"
                          >
                            Flip to See
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 rounded-lg font-semibold transition-all bg-gray-800 text-gray-400 cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <ul className={`space-y-4 mb-8 ${pkg.available ? '' : 'opacity-60'}`}>
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-5 w-5 text-gold-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {pkg.available ? (
                      <button
                        onClick={() => handleStartDesign(`/designer?package=${key}`)}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${key === 'custom'
                          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:from-gold-400 hover:to-gold-500'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                      >
                        Get Started
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 rounded-lg font-semibold transition-all bg-gray-800 text-gray-400 cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-gold-400">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Four simple steps to your perfect stole
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Choose Package', description: 'Select the tier that fits your vision and budget' },
              { step: 2, title: 'Design Stole', description: 'Customize colors, text, symbols, and fabrics in real-time' },
              { step: 3, title: 'Review & Order', description: 'Preview your design and complete your secure order' },
              { step: 4, title: 'Receive & Celebrate', description: 'Get your custom stole delivered in time for graduation' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative text-center"
              >
                <div className="bg-gradient-to-br from-gold-500 to-gold-600 text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-gold-500/50">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-gold-500/30 text-4xl">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-gold-400">
              Gallery
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what others have created
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg',
              'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg',
              'https://images.pexels.com/photos/7944214/pexels-photo-7944214.jpeg',
              'https://images.pexels.com/photos/5905857/pexels-photo-5905857.jpeg',
              'https://images.pexels.com/photos/5905700/pexels-photo-5905700.jpeg',
              'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg',
            ].map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group overflow-hidden rounded-xl aspect-square"
              >
                <img
                  src={img}
                  alt={`Gallery item ${index + 1}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-block border-2 border-gold-500 text-gold-400 px-8 py-3 rounded-lg font-semibold hover:bg-gold-500/10 transition-all"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
