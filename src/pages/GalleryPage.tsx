import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const galleryImages = [
  {
    url: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg',
    title: 'Classic Elegance',
    package: 'Customized Woven',
  },
  {
    url: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg',
    title: 'Cultural Pride',
    package: 'Standard',
  },
  {
    url: 'https://images.pexels.com/photos/7944214/pexels-photo-7944214.jpeg',
    title: 'Modern Graduate',
    package: 'Basic',
  },
  {
    url: 'https://images.pexels.com/photos/5905857/pexels-photo-5905857.jpeg',
    title: 'Achievement',
    package: 'Customized Woven',
  },
  {
    url: 'https://images.pexels.com/photos/5905700/pexels-photo-5905700.jpeg',
    title: 'Heritage',
    package: 'Standard',
  },
  {
    url: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg',
    title: 'Excellence',
    package: 'Customized Woven',
  },
  {
    url: 'https://images.pexels.com/photos/1205033/pexels-photo-1205033.jpeg',
    title: 'Success',
    package: 'Basic',
  },
  {
    url: 'https://images.pexels.com/photos/7944491/pexels-photo-7944491.jpeg',
    title: 'Tradition',
    package: 'Standard',
  },
  {
    url: 'https://images.pexels.com/photos/5905696/pexels-photo-5905696.jpeg',
    title: 'Honor',
    package: 'Customized Woven',
  },
];

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-app-base pt-28 pb-16 text-text-primary transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 text-5xl font-display font-bold text-accent-primary">Gallery</h1>
          <p className="mx-auto max-w-2xl text-xl text-text-secondary">
            Discover stunning custom stoles created by our community
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border-subtle/40 bg-app-surface/60 transition-colors"
            >
              <img
                src={item.url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-app-base/90 via-app-base/40 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="mb-1 text-xl font-semibold text-text-primary">{item.title}</h3>
                <p className="text-sm text-accent-primary">{item.package} Package</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="mb-8 text-lg text-text-secondary">
            Ready to create your own masterpiece?
          </p>
          <Link
            to="/designer"
            className="btn-accent-gradient inline-block transform rounded-lg px-8 py-4 text-lg font-semibold text-text-inverted transition-all hover:scale-105"
          >
            Start Designing Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
