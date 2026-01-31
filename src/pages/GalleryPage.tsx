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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-display font-bold text-gold-400 mb-4">Gallery</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover stunning custom stoles created by our community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {galleryImages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group overflow-hidden rounded-xl aspect-square"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-semibold mb-1">{item.title}</h3>
                <p className="text-gold-400 text-sm">{item.package} Package</p>
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
          <p className="text-gray-400 mb-8 text-lg">
            Ready to create your own masterpiece?
          </p>
          <Link
            to="/designer"
            className="inline-block bg-gradient-to-r from-gold-500 to-gold-600 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-gold-400 hover:to-gold-500 transition-all transform hover:scale-105"
          >
            Start Designing Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
