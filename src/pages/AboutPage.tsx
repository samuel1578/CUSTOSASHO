import { motion } from 'framer-motion';
import { Heart, Award, Users, Sparkles } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-5xl font-display font-bold text-gold-400 mb-4">About CustoSasho</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Celebrating heritage, achievement, and individual excellence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-display font-bold text-white">Our Story</h2>
              <p className="text-gray-300 leading-relaxed">
                CustoSasho was founded with a simple but powerful mission: to help graduates honor their
                heritage and celebrate their achievements through custom-designed graduation stoles that
                tell their unique stories.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Inspired by the rich traditions of Kente cloth and African craftsmanship, we combine
                cultural authenticity with modern design technology to create stoles that are not just
                accessories, but meaningful symbols of your journey.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Every stole we create is handcrafted with premium materials and meticulous attention to
                detail, ensuring that your graduation day is marked by a piece that's as exceptional as
                your achievement.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/7944214/pexels-photo-7944214.jpeg"
                  alt="Graduation celebration"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Heart,
                title: 'Passion',
                description: 'Dedicated to celebrating your unique journey and heritage',
              },
              {
                icon: Award,
                title: 'Quality',
                description: 'Premium materials and expert craftsmanship in every stole',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'Serving graduates nationwide with pride and excellence',
              },
              {
                icon: Sparkles,
                title: 'Innovation',
                description: 'Blending tradition with cutting-edge design technology',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-gray-900/50 backdrop-blur border border-gold-500/20 rounded-xl p-6 text-center hover:border-gold-500/40 transition-all"
              >
                <value.icon className="h-12 w-12 text-gold-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gold-500/20 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Crafted to Represent Your Excellence
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
              We believe that graduation is more than a ceremony—it's a celebration of your hard work,
              perseverance, and the support of those who helped you along the way. Let us help you mark
              this milestone with a stole that's as unique and remarkable as your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/designer"
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-gold-400 hover:to-gold-500 transition-all transform hover:scale-105 inline-block"
              >
                Start Your Design
              </a>
              <a
                href="/contact"
                className="border-2 border-gold-500 text-gold-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gold-500/10 transition-all inline-block"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
