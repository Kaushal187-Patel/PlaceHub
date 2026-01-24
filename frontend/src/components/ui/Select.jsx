import { useState, createContext, useContext } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '../../utils/cn';

const SelectContext = createContext();

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ className, children, ...props }) => {
  const { open, setOpen } = useContext(SelectContext);
  
  return (
    <button
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800',
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <FiChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

const SelectContent = ({ className, children, ...props }) => {
  const { open } = useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div
      className={cn(
        'absolute top-full z-50 w-full mt-1 rounded-md border bg-white shadow-md dark:border-gray-600 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectItem = ({ value, children, className, ...props }) => {
  const { onValueChange, setOpen } = useContext(SelectContext);
  
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700',
        className
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder }) => {
  const { value } = useContext(SelectContext);
  
  return (
    <span className={cn(!value && 'text-gray-500')}>
      {value || placeholder}
    </span>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };