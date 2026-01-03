import { useRef } from 'react';
import type { NumberFormat } from '../types/NumberFormat';

interface DisplayRowProps {
  label: string;
  value: bigint;
  base: number;
  format: NumberFormat;
  isActive: boolean;
  inputBuffer: string;
  onSelect: (base: number) => void;
}

function DisplayRow({ label, value, base, format, isActive, inputBuffer, onSelect }: DisplayRowProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const groupSize = base === 2 ? 4 : base === 16 ? 2 : 0;

  const formatWithSpaces = (str: string): string => {
    if (groupSize === 0) return str;
    const groups = str.match(new RegExp(`.{1,${groupSize}}`, 'g')) || [str];
    if (groups.length <= 1) return groups[0];
    // Use nbsp so that numbers break in the middle, looks nicer for binary and hex.
    const halfIndex = Math.ceil(groups.length / 2);
    const firstHalf = groups.slice(0, halfIndex).join('\u00A0');
    const secondHalf = groups.slice(halfIndex).join('\u00A0');
    return `${firstHalf} ${secondHalf}`;
  };

  const rawValue = isActive && inputBuffer ? inputBuffer : format.format(value, base);
  const formatted = formatWithSpaces(rawValue);

  const handleClick = () => {
    onSelect(base);
    if (valueRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(valueRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  return (
    <div
      className={`display-row ${isActive ? 'active' : 'faded'}`}
      onClick={handleClick}
    >
      <span className="display-label">{label}</span>
      <span className="display-value" ref={valueRef}>{formatted}</span>
    </div>
  );
}

interface DisplayProps {
  value: bigint;
  format: NumberFormat;
  inputBase: number;
  inputBuffer: string;
  onInputBaseChange: (base: number) => void;
}

function Display({ value, format, inputBase, inputBuffer, onInputBaseChange }: DisplayProps) {
  return (
    <div className="display">
      <DisplayRow
        label="HEX"
        value={value}
        base={16}
        format={format}
        isActive={inputBase === 16}
        inputBuffer={inputBuffer}
        onSelect={onInputBaseChange}
      />
      <DisplayRow
        label="DEC"
        value={value}
        base={10}
        format={format}
        isActive={inputBase === 10}
        inputBuffer={inputBuffer}
        onSelect={onInputBaseChange}
      />
      <DisplayRow
        label="BIN"
        value={value}
        base={2}
        format={format}
        isActive={inputBase === 2}
        inputBuffer={inputBuffer}
        onSelect={onInputBaseChange}
      />
    </div>
  );
}

export default Display;
