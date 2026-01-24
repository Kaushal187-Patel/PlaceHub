import { createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { cn } from '../../utils/cn';

const ModalContext = createContext();

const Modal = ({ open, onOpenChange, children }) => {
  return (
    <ModalContext.Provider value={{ open, onOpenChange }}>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="fixed inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              className="relative z-50 w-full max-w-lg mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

const ModalContent = ({ className, children, ...props }) => {
  const { onOpenChange } = useContext(ModalContext);
  
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700',
        className
      )}
      {...props}
    >
      <button
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <FiX className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
};

const ModalHeader = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left p-6', className)}
    {...props}
  />
);

const ModalTitle = ({ className, ...props }) => (
  <h2
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);

const ModalBody = ({ className, ...props }) => (
  <div className={cn('px-6 pb-6', className)} {...props} />
);

export { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody };