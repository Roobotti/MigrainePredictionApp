import { motion } from "motion/react";

export function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-b from-teal-50 to-teal-100 flex items-center justify-center">
      <div className="text-center">
        {/* Pulsing Logo - Lightning Strike M */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6 flex justify-center"
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Lightning Strike M */}
            <path
              d="M30 20 L45 20 L60 60 L75 20 L90 20 L90 100 L75 100 L75 50 L60 90 L60 90 L45 50 L45 100 L30 100 Z"
              fill="#14b8a6"
              stroke="#14b8a6"
              strokeWidth="2"
            />
            {/* Lightning bolt accent */}
            <path
              d="M55 35 L65 50 L60 50 L68 70 L58 55 L63 55 Z"
              fill="#fff"
              opacity="0.9"
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-teal-600 text-2xl mb-2"
        >
          Migraine Tracker
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-teal-500 text-sm"
        >
          Loading your personalized tracker...
        </motion.p>
      </div>
    </div>
  );
}
