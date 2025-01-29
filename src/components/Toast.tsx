import React, { useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, 5000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  const variants = {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.5 }
  };

  const iconVariants = {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1 }
  };

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className={`fixed bottom-4 right-4 max-w-md ${bgColor} border ${borderColor} rounded-lg p-4 
                   shadow-lg backdrop-blur-sm z-50`}
      >
        <div className="flex items-start">
          <motion.div
            initial={iconVariants.initial}
            animate={iconVariants.animate}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Icon className={`h-5 w-5 ${textColor}`} />
          </motion.div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <button
            onClick={handleClose}
            className={`ml-4 inline-flex rounded-md p-1.5 ${textColor} 
                     hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-${type === 'success' ? 'green' : 'red'}-600
                     transition-colors duration-200`}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}