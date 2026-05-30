import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterProps {
  options: FilterOption[];
  selected: string;
  onFilterChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const Filter = ({ options, selected, onFilterChange, label, className = '' }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <span className="block text-sm font-medium text-gray-700 mb-1 truncate" title={label}>
          {label}
        </span>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-psse-accent"
      >
        <span className="truncate mr-2">{selectedOption ? selectedOption.label : 'Select...'}</span>
        <FaChevronDown className={`flex-shrink-0 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onFilterChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 text-sm truncate
                ${selected === option.value ? 'bg-psse-accent text-white' : 'text-gray-700 hover:bg-gray-100'}
              `}
              title={option.label}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
