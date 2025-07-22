import React, { useEffect, useState } from 'react';
import { PageTransition } from './PageTransition';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.12,
      type: 'spring',
      stiffness: 80,
      damping: 14,
    },
  }),
};

const hoverEffect =
  'hover:scale-[1.03] hover:shadow-2xl transition-transform duration-300';

const News = () => {
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://dsfl-backend-e3p8.onrender.com/api/admin/news');
        const data = await res.json();
        if (data.content) {
          setNews(JSON.parse(data.content));
        } else {
          setNews(null);
        }
      } catch (e) {
        setError('Failed to load news.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mr-4"></div>
          <span className="text-gray-600 text-lg">Loading news...</span>
        </div>
      </PageTransition>
    );
  }
  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-600 text-xl">{error}</div>
        </div>
      </PageTransition>
    );
  }
  if (!news) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500 text-lg">No news content available.</div>
        </div>
      </PageTransition>
    );
  }

  // Parse fixtures
  let fixturesArr: string[][] = [];
  if (news.fixtures) {
    fixturesArr = news.fixtures
      .split('\n')
      .map((line: string) => line.split('|').map(s => s.trim()))
      .filter((arr: string[]) => arr.length === 3);
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-2 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-blue-800 dark:text-blue-400 mb-10 text-center drop-shadow-lg">
          News
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Scout's Report */}
          <motion.div
            className={`bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/30 dark:to-gray-800 shadow rounded-2xl border border-orange-100 dark:border-orange-900/40 p-6 flex flex-col justify-between ${hoverEffect}`}
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(255,140,0,0.15)' }}
          >
            <h2 className="text-xl font-bold text-orange-600 mb-2">Scout's Report</h2>
            <p className="text-gray-700 dark:text-gray-300">{news.scout || <span className="italic text-gray-400">No report.</span>}</p>
          </motion.div>

          {/* Day Report */}
          <motion.div
            className={`bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800 shadow rounded-2xl border border-blue-100 dark:border-blue-900/40 p-6 flex flex-col justify-between ${hoverEffect}`}
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(30,64,175,0.15)' }}
          >
            <h2 className="text-xl font-bold text-orange-600 mb-2">Day Report</h2>
            <p className="text-gray-700 dark:text-gray-300">{news.day || <span className="italic text-gray-400">No report.</span>}</p>
          </motion.div>

          {/* Team of the Day */}
          <motion.div
            className={`bg-white dark:bg-gray-800 shadow rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 flex flex-col justify-between items-start ${hoverEffect}`}
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(59,130,246,0.10)' }}
          >
            <h2 className="text-xl font-bold text-orange-600 mb-2">Team of the Day</h2>
            <span className="text-2xl font-semibold text-blue-800 dark:text-blue-400 drop-shadow">{news.team || <span className="italic text-gray-400">-</span>}</span>
          </motion.div>

          {/* Player of the Day */}
          <motion.div
            className={`bg-white dark:bg-gray-800 shadow rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 flex flex-col justify-between items-start ${hoverEffect}`}
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(59,130,246,0.10)' }}
          >
            <h2 className="text-xl font-bold text-orange-600 mb-2">Player of the Day</h2>
            <span className="text-2xl font-semibold text-blue-800 dark:text-blue-400 drop-shadow">{news.player || <span className="italic text-gray-400">-</span>}</span>
          </motion.div>

          {/* Fixtures Table - spans 2 columns on desktop */}
          <motion.div
            className={`bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 flex flex-col justify-between md:col-span-2 lg:col-span-2 ${hoverEffect}`}
            custom={4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(16,16,16,0.10)' }}
          >
            <h2 className="text-xl font-bold text-orange-600 mb-4">Fixtures</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Match</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Venue</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {fixturesArr.length > 0 ? fixturesArr.map((row, i) => (
                    <tr key={i} className={
                      i === 0 ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors' :
                      i === 1 ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors' :
                      'hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors'
                    }>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row[0]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row[1]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row[2]}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-400">No fixtures available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default News;
