import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";

interface ScreenSaverProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationTap: () => void;
  isFirstTime?: boolean;
  onTouchDismiss?: () => void;
}

export function ScreenSaver({ 
  isOpen, 
  onClose, 
  onNotificationTap,
  isFirstTime = false,
  onTouchDismiss
}: ScreenSaverProps) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show notification after 2 seconds
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Reset notification when screen saver closes
      setShowNotification(false);
    }
  }, [isOpen]);

  const handleNotificationTap = () => {
    setShowNotification(false);
    onNotificationTap();
    onClose();
  };

  const handleTouchScreen = () => {
    if (isFirstTime && onTouchDismiss) {
      onTouchDismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={isFirstTime ? { y: 0 } : false}
      exit={{ y: "-100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-black"
      onClick={handleTouchScreen}
    >
      {/* Touch to start prompt - only on first time */}
      {isFirstTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-20 left-0 right-0 text-center z-10"
        >
          <motion.p
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/80 text-lg"
          >
            Touch anywhere to start
          </motion.p>
        </motion.div>
      )}

      {/* Close Button - only when not first time */}
      {!isFirstTime && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          aria-label="Close screen saver"
        >
          <X size={24} />
        </button>
      )}

      {/* Time Display */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center z-10">
        <div className="text-white text-6xl mb-2">
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}
        </div>
        <div className="text-white/80 text-xl">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Background Image */}
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1663043501785-05d17c625253?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0d28lMjBidW5uaWVzJTIwcmFiYml0c3xlbnwxfHx8fDE3NjMxOTQ5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Two bunnies"
        className="w-full h-full object-cover opacity-40"
      />

      {/* Migraine Risk Notification - only when not first time */}
      <AnimatePresence>
        {showNotification && !isFirstTime && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute top-20 left-4 right-4 z-20"
          >
            <button
              onClick={handleNotificationTap}
              className="w-full bg-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 active:scale-95 transition-transform"
            >
              <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-900">Migraine Tracker</span>
                  <span className="text-xs text-slate-500">now</span>
                </div>
                <div className="text-slate-800 mb-1">
                  High Migraine Risk Alert
                </div>
                <div className="text-sm text-slate-600">
                  Your current risk level is 68%. Tap to view details and recommendations.
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
