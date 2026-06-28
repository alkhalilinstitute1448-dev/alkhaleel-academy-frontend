import { useState, useRef, useEffect, useMemo } from 'react';

function normalizeOptions(options) {
  return options.map((o) => {
    if (o === null || o === undefined) return { value: '', label: '' };
    if (typeof o === 'string' || typeof o === 'number') return { value: String(o), label: String(o) };
    return { value: o.value ?? '', label: o.label ?? String(o.value ?? '') };
  });
}

export default function SelectField({
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = '-- اختر --',
  className = '',
  error = false,
  disabled = false,
  name,
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const selected = useMemo(
    () => normalized.find((o) => String(o.value) === String(value)),
    [normalized, value],
  );

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(opt) {
    const synthetic = { target: { value: opt.value, name } };
    onChange(synthetic);
    setIsOpen(false);
    if (onBlur) setTimeout(() => onBlur(synthetic), 0);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 text-right transition-all duration-200 outline-none border
          ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'}
          ${error
            ? 'border-red-500/50 ring-1 ring-red-500/10'
            : isOpen
              ? 'border-gold-500/50 ring-2 ring-gold-500/10 bg-[#2a2a2a]'
              : 'border-gray-700/40 bg-[#252525] hover:border-gray-600/50'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          rounded-xl text-white`}
      >
        <span className={`truncate ${selected ? 'text-white' : 'text-gray-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#1c1c1c] border border-gold-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden dropdown-open">
          <div className="max-h-60 overflow-y-auto py-1">
            {normalized.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                لا توجد خيارات
              </div>
            )}
            {normalized.map((opt, i) => {
              const isSel = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value ?? i}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-4 text-right transition-all duration-150 flex items-center justify-between gap-2
                    ${compact ? 'py-2 text-sm' : 'py-2.5 text-sm'}
                    ${isSel
                      ? 'bg-gold-500/15 text-gold-300 font-medium'
                      : 'text-gray-300 hover:bg-gold-500/8 hover:text-gold-200'}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSel && (
                    <svg className="w-4 h-4 text-gold-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
