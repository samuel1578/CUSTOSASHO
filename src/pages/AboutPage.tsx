import { motion } from 'framer-motion';
import { Heart, Award, Users, Sparkles } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-app-base pt-28 pb-16 text-text-primary transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-5xl font-display font-bold text-accent-primary">About CustoSasho</h1>
            <p className="mx-auto max-w-2xl text-xl text-text-secondary">
              Celebrating heritage, achievement, and individual excellence
            </p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-display font-bold text-text-primary">Our Story</h2>
              <p className="leading-relaxed text-text-secondary">
                CustoSasho was founded with a simple but powerful mission: to help graduates honor their
                heritage and celebrate their achievements through custom-designed graduation stoles that
                tell their unique stories.
              </p>
              <p className="leading-relaxed text-text-secondary">
                Inspired by the rich traditions of Kente cloth and African craftsmanship, we combine
                cultural authenticity with modern design technology to create stoles that are not just
                accessories, but meaningful symbols of your journey.
              </p>
              <p className="leading-relaxed text-text-secondary">
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

          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
                className="rounded-xl border border-border-subtle/40 bg-app-surface/60 p-6 text-center backdrop-blur transition-all hover:border-accent-primary/50"
              >
                <value.icon className="mx-auto mb-4 h-12 w-12 text-accent-primary" />
                <h3 className="mb-3 text-xl font-semibold text-text-primary">{value.title}</h3>
                <p className="text-text-secondary">{value.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border-subtle/40 bg-app-surface/80 p-12 text-center transition-colors"
          >
            <h2 className="mb-4 text-3xl font-display font-bold text-text-primary">
              Crafted to Represent Your Excellence
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-text-secondary">
              We believe that graduation is more than a ceremony—it's a celebration of your hard work,
              perseverance, and the support of those who helped you along the way. Let us help you mark
              this milestone with a stole that's as unique and remarkable as your journey.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/designer"
                className="btn-accent-gradient inline-block transform rounded-lg px-8 py-4 text-lg font-semibold text-text-inverted transition-all hover:scale-105"
              >
                Start Your Design
              </a>
              <a
                href="/contact"
                className="inline-block rounded-lg border-2 border-accent-primary px-8 py-4 text-lg font-semibold text-accent-primary transition-all hover:bg-accent-primary/10"
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
