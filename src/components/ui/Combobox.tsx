'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface ComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

export default function Combobox({ options, value, onChange, placeholder = 'Select an option', emptyText = 'No matches found' }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = query === '' 
    ? options 
    : options.filter(opt => opt.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'Enter' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelect(filteredOptions[activeIndex].value);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-coffee-200 bg-cream-light focus-within:border-burgundy-800 focus-within:ring-1 focus-within:ring-burgundy-800 transition-colors cursor-pointer"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setQuery('');
            setActiveIndex(-1);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <span className={`text-sm truncate ${!selectedOption ? 'text-coffee-400' : 'text-coffee-900'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-coffee-400 shrink-0 ml-2" />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-coffee-200 overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-4 py-3 text-sm border-b border-coffee-100 outline-none text-coffee-900 placeholder-coffee-400 bg-cream-light/50"
            placeholder="Search dishes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-coffee-500">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt, i) => (
                <div
                  key={opt.value}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                    activeIndex === i ? 'bg-coffee-100 text-coffee-900' : 'text-coffee-800 hover:bg-coffee-50 hover:text-coffee-900'
                  }`}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{opt.label}</span>
                    {opt.subLabel && <span className="text-xs text-coffee-500 mt-0.5">{opt.subLabel}</span>}
                  </div>
                  {value === opt.value && <Check className="w-4 h-4 text-burgundy-800 shrink-0 ml-2" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
