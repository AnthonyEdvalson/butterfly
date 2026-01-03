import { useState, useRef, useEffect } from 'react';
import { FORMAT_LIST } from '../formats';
import type { NumberFormat } from '../types/NumberFormat';

interface SettingsProps {
  formatId: string;
  onFormatChange: (formatId: string) => void;
}

function Settings({ formatId, onFormatChange }: SettingsProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const integers = FORMAT_LIST.filter((f): f is NumberFormat & { category: 'integer' } => f.category === 'integer');
  const floats = FORMAT_LIST.filter((f): f is NumberFormat & { category: 'float' } => f.category === 'float');
  const fixed = FORMAT_LIST.filter((f): f is NumberFormat & { category: 'fixed' } => f.category === 'fixed');

  const currentFormat = FORMAT_LIST.find((f) => f.id === formatId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  const handleSelect = (id: string) => {
    onFormatChange(id);
    setOpen(false);
  };

  return (
    <div className="settings">
      <div className="dropdown" ref={dropdownRef}>
        <button
          className="dropdown-trigger"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span>{currentFormat?.name ?? formatId}</span>
          <svg className="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6">
            <path fill="currentColor" d="M0 0l5 6 5-6z" />
          </svg>
        </button>
        {open && (
          <div className="dropdown-menu" role="listbox">
            <div className="dropdown-group-label">Integer</div>
            {integers.map((f) => (
              <button
                key={f.id}
                className={`dropdown-item${f.id === formatId ? ' active' : ''}`}
                onClick={() => handleSelect(f.id)}
                role="option"
                aria-selected={f.id === formatId}
              >
                {f.name}
              </button>
            ))}
            <div className="dropdown-group-label">Float</div>
            {floats.map((f) => (
              <button
                key={f.id}
                className={`dropdown-item${f.id === formatId ? ' active' : ''}`}
                onClick={() => handleSelect(f.id)}
                role="option"
                aria-selected={f.id === formatId}
              >
                {f.name}
              </button>
            ))}
            <div className="dropdown-group-label">Fixed-Point</div>
            {fixed.map((f) => (
              <button
                key={f.id}
                className={`dropdown-item${f.id === formatId ? ' active' : ''}`}
                onClick={() => handleSelect(f.id)}
                role="option"
                aria-selected={f.id === formatId}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
