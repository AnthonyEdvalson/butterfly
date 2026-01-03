import { useRef, useEffect, useCallback } from 'react';
import { toggleBit, getBit, setBit } from '../utils/bitmath';
import type { NumberFormat, BitCategory } from '../types/NumberFormat';

interface BitGridProps {
  value: bigint;
  format: NumberFormat;
  onValueChange: (value: bigint) => void;
}

function BitGrid({ value, format, onValueChange }: BitGridProps) {
  const { bitWidth } = format;
  const gridRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ isDragging: boolean; dragValue: bigint | null; lastBitIndex: number | null }>({
    isDragging: false,
    dragValue: null,
    lastBitIndex: null,
  });
  const valueRef = useRef(value);
  valueRef.current = value;
  const recentTouchRef = useRef(false);

  const handleDragEnd = useCallback(() => {
    dragState.current.isDragging = false;
    dragState.current.dragValue = null;
    dragState.current.lastBitIndex = null;
  }, []);

  const handleDragOver = useCallback((bitIndex: number) => {
    if (dragState.current.isDragging && dragState.current.dragValue !== null) {
      if (bitIndex === dragState.current.lastBitIndex) return;
      dragState.current.lastBitIndex = bitIndex;
      const currentBit = getBit(valueRef.current, bitIndex);
      if (currentBit !== dragState.current.dragValue) {
        const newValue = setBit(valueRef.current, bitIndex, dragState.current.dragValue, bitWidth);
        onValueChange(newValue);
      }
    }
  }, [bitWidth, onValueChange]);

  useEffect(() => {
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);
    return () => {
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [handleDragEnd]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragState.current.isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const button = element.closest('.bitgrid-bit') as HTMLElement;
        if (button && button.dataset.bitIndex !== undefined) {
          handleDragOver(parseInt(button.dataset.bitIndex, 10));
        }
      }
    };

    grid.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => grid.removeEventListener('touchmove', handleTouchMove);
  }, [handleDragOver]);

  const startDrag = (bitIndex: number) => {
    const newValue = toggleBit(value, bitIndex, bitWidth);
    const newBitValue = getBit(newValue, bitIndex);
    dragState.current.isDragging = true;
    dragState.current.dragValue = newBitValue;
    dragState.current.lastBitIndex = bitIndex;
    onValueChange(newValue);
  };

  const handleMouseDown = (bitIndex: number) => {
    if (recentTouchRef.current) return;
    startDrag(bitIndex);
  };

  const handleTouchStart = (bitIndex: number, e: React.TouchEvent) => {
    e.preventDefault();
    recentTouchRef.current = true;
    setTimeout(() => { recentTouchRef.current = false; }, 300);
    startDrag(bitIndex);
  };

  const handleMouseEnter = (bitIndex: number) => {
    handleDragOver(bitIndex);
  };

  const bits: { index: number; value: bigint; cat: BitCategory }[] = [];
  for (let i = bitWidth - 1; i >= 0; i--) {
    bits.push({
      index: i,
      value: getBit(value, i),
      cat: format.getBitCategory(i),
    });
  }

  const nibbles: typeof bits[] = [];
  for (let i = 0; i < bits.length; i += 4) {
    nibbles.push(bits.slice(i, i + 4));
  }

  const columns = bitWidth === 8 ? 2 : 4;

  return (
    <div className="bitgrid" data-columns={columns}>
      <div className="bitgrid-grid" ref={gridRef}>
        {nibbles.map((nibble, nibbleIndex) => (
          <div key={nibbleIndex} className="bitgrid-nibble">
            {nibble.map((bit) => (
              <div key={bit.index} className="bitgrid-bit-col">
                <button
                  className={`bitgrid-bit ${bit.value === 1n ? 'bit-on' : ''} bit-cat${bit.cat}`}
                  data-bit-index={bit.index}
                  onMouseDown={() => handleMouseDown(bit.index)}
                  onMouseEnter={() => handleMouseEnter(bit.index)}
                  onTouchStart={(e) => handleTouchStart(bit.index, e)}
                >
                  {bit.value.toString()}
                </button>
                <span className="bitgrid-label">{bit.index}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BitGrid;
