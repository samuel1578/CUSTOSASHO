import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PACKAGES } from '../lib/constants';

export function PackagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-display font-bold text-gold-400 mb-4">Our Packages</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect package for your custom graduation stole
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {Object.entries(PACKAGES).map(([key, pkg], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className={`relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 ${key === 'custom' ? 'border-gold-500 transform lg:scale-110' : 'border-gold-500/20'
                } hover:border-gold-500/60 transition-all`}
            >
              {key === 'custom' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-600 text-black px-4 py-1 rounded-full text-sm font-semibold">
                  Most Personalized
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-3xl font-display font-bold text-white mb-2">{pkg.name}</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-5xl font-bold text-gold-400">${pkg.price}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-gold-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/designer?package=${key}`}
                className={`block w-full text-center py-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${key === 'custom'
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:from-gold-400 hover:to-gold-500'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-gray-900/50 backdrop-blur border border-gold-500/20 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-display font-bold text-white mb-4">Not Sure Which to Choose?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Contact our design specialists for personalized recommendations based on your vision and budget
          </p>
          <Link
            to="/contact"
            className="inline-block border-2 border-gold-500 text-gold-400 px-8 py-3 rounded-lg font-semibold hover:bg-gold-500/10 transition-all"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
