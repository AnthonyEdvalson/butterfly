import { useState, useCallback, useEffect, useMemo } from 'react';
import Settings from './components/Settings';
import History, { type HistoryEntry } from './components/History';
import Display from './components/Display';
import BitGrid from './components/BitGrid';
import Keypad from './components/Keypad';
import NumPad from './components/NumPad';
import { mask } from './utils/bitmath';
import { getFormat } from './formats';
import { performBinaryOp, performUnaryOp, isBinaryOp, isUnaryOp } from './types/NumberFormat';

const KEY_TO_OP: Record<string, string> = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '%': '%',
  '&': 'AND',
  '|': 'OR',
  '^': 'XOR',
  '~': 'NOT',
  '<': '<<',
  '>': '>>',
};

function App() {
  const [value, setValue] = useState(0n);
  const [operand, setOperand] = useState<bigint | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [lastOperand, setLastOperand] = useState<bigint | null>(null);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [formatId, setFormatId] = useState('int32');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inputMode, setInputMode] = useState(false);
  const [inputBase, setInputBase] = useState(10);
  const [inputBuffer, setInputBuffer] = useState('');
  const [mobileView, setMobileView] = useState<'bits' | 'numpad'>('numpad');

  const format = useMemo(() => getFormat(formatId), [formatId]);

  const handleValueChange = useCallback(
    (newValue: bigint) => {
      setValue(mask(newValue, format.bitWidth));
      setInputBuffer('');
    },
    [format.bitWidth]
  );

  const handleFormatChange = useCallback(
    (newFormatId: string) => {
      const newFormat = getFormat(newFormatId);
      setFormatId(newFormatId);
      setValue((prev) => mask(prev, newFormat.bitWidth));
      if (operand !== null) {
        setOperand((prev) => (prev !== null ? mask(prev, newFormat.bitWidth) : null));
      }
      setInputBuffer('');
    },
    [operand]
  );

  const handleInputBaseChange = useCallback((base: number) => {
    setInputBase(base);
    setInputBuffer('');
  }, []);

  const handleOperation = useCallback(
    (op: string) => {
      setInputBuffer('');

      if (isUnaryOp(op)) {
        const result = performUnaryOp(format, value, op);
        if (op !== 'CLR') {
          setHistory((prev) => [
            ...prev.slice(-19),
            {
              a: value,
              op,
              b: null,
              result,
            },
          ]);
        } else {
          setLastOperand(null);
          setLastOperation(null);
        }
        setValue(result);
        setOperand(null);
        setOperation(null);
        setInputMode(false);
        return;
      }

      if (operation && operand !== null && isBinaryOp(operation)) {
        const result = performBinaryOp(format, operand, operation, value);
        setHistory((prev) => [
          ...prev.slice(-19),
          {
            a: operand,
            op: operation,
            b: value,
            result,
          },
        ]);
        setValue(result);
        setOperand(result);
        setOperation(op);
      } else {
        setOperand(value);
        setOperation(op);
      }
      setInputMode(true);
    },
    [value, operand, operation, format]
  );

  const handleEquals = useCallback(() => {
    setInputBuffer('');

    if (operation && operand !== null && isBinaryOp(operation)) {
      const result = performBinaryOp(format, operand, operation, value);
      setHistory((prev) => [
        ...prev.slice(-19),
        {
          a: operand,
          op: operation,
          b: value,
          result,
        },
      ]);
      setValue(result);
      setLastOperand(value);
      setLastOperation(operation);
      setOperand(null);
      setOperation(null);
      setInputMode(false);
    } else if (lastOperation && lastOperand !== null && isBinaryOp(lastOperation)) {
      const result = performBinaryOp(format, value, lastOperation, lastOperand);
      setHistory((prev) => [
        ...prev.slice(-19),
        {
          a: value,
          op: lastOperation,
          b: lastOperand,
          result,
        },
      ]);
      setValue(result);
    }
  }, [value, operand, operation, lastOperand, lastOperation, format]);

  const handleHistoryClick = useCallback((entry: HistoryEntry) => {
    setValue(entry.result);
    setOperand(null);
    setOperation(null);
    setInputMode(false);
    setInputBuffer('');
  }, []);

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
  };

  const appendDigit = useCallback(
    (char: string) => {
      clearSelection();
      let newBuffer: string;
      if (inputMode) {
        newBuffer = char;
        setInputMode(false);
      } else {
        newBuffer = inputBuffer + char;
      }
      setInputBuffer(newBuffer);
      const parsed = format.parse(newBuffer, inputBase);
      setValue(parsed);
    },
    [inputBuffer, inputBase, format, inputMode]
  );

  const deleteDigit = useCallback(() => {
    clearSelection();
    if (inputBuffer.length > 0) {
      const newBuffer = inputBuffer.slice(0, -1);
      setInputBuffer(newBuffer);
      if (newBuffer.length > 0) {
        const parsed = format.parse(newBuffer, inputBase);
        setValue(parsed);
      } else {
        setValue(0n);
      }
    }
  }, [inputBuffer, inputBase, format]);

  const toggleNegative = useCallback(() => {
    if (inputBase !== 10) return;
    if (!format.supportsNegation) return;

    if (inputBuffer.startsWith('-')) {
      const newBuffer = inputBuffer.slice(1);
      setInputBuffer(newBuffer);
      const parsed = format.parse(newBuffer, inputBase);
      setValue(parsed);
    } else {
      const newBuffer = '-' + inputBuffer;
      setInputBuffer(newBuffer);
      const parsed = format.parse(newBuffer, inputBase);
      setValue(parsed);
    }
  }, [inputBuffer, inputBase, format]);

  const handlePaste = useCallback(
    (text: string) => {
      clearSelection();
      const cleaned = text.trim();
      const parsed = format.parse(cleaned, inputBase);
      setValue(parsed);
      setInputBuffer(cleaned);
      setInputMode(false);
    },
    [inputBase, format]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')
      ) {
        return;
      }

      const key = e.key;

      const pattern = format.validInputPattern(inputBase);
      if (pattern.test(key) && key.length === 1) {
        e.preventDefault();
        appendDigit(key);
        return;
      }

      if (key === 'Backspace') {
        e.preventDefault();
        deleteDigit();
        return;
      }

      if (key === 'Escape') {
        e.preventDefault();
        handleOperation('CLR');
        return;
      }

      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
        return;
      }

      // Handle minus as negative sign in decimal mode when buffer is empty or starting new input
      if (key === '-' && inputBase === 10 && format.supportsNegation && (inputBuffer === '' || inputMode)) {
        e.preventDefault();
        if (inputMode) {
          setInputBuffer('-');
          setInputMode(false);
          setValue(0n);
        } else {
          toggleNegative();
        }
        return;
      }

      // Handle decimal point for floats and fixed-point
      if (key === '.' && inputBase === 10 && (format.category === 'float' || format.category === 'fixed')) {
        if (!inputBuffer.includes('.')) {
          e.preventDefault();
          appendDigit('.');
        }
        return;
      }

      if (KEY_TO_OP[key]) {
        e.preventDefault();
        handleOperation(KEY_TO_OP[key]);
        return;
      }
    };

    const handlePasteEvent = (e: ClipboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')
      ) {
        return;
      }
      e.preventDefault();
      const text = e.clipboardData?.getData('text');
      if (text) {
        handlePaste(text);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePasteEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePasteEvent);
    };
  }, [
    inputBase,
    inputBuffer,
    inputMode,
    format,
    appendDigit,
    deleteDigit,
    handleOperation,
    handleEquals,
    toggleNegative,
    handlePaste,
  ]);

  return (
    <div className="calculator">
      <Settings formatId={formatId} onFormatChange={handleFormatChange} />
      <History
        history={history}
        format={format}
        inputBase={inputBase}
        operand={operand}
        operation={operation}
        onEntryClick={handleHistoryClick}
      />
      <Display
        value={value}
        format={format}
        inputBase={inputBase}
        inputBuffer={inputBuffer}
        onInputBaseChange={handleInputBaseChange}
      />
      <div className="mobile-toggle">
        <button
          className={`mobile-toggle-btn ${mobileView === 'bits' ? 'active' : ''}`}
          onClick={() => setMobileView('bits')}
        >
          Bits
        </button>
        <button
          className={`mobile-toggle-btn ${mobileView === 'numpad' ? 'active' : ''}`}
          onClick={() => setMobileView('numpad')}
        >
          Numpad
        </button>
      </div>
      <div className={`bitgrid-container ${mobileView === 'bits' ? 'mobile-visible' : ''}`}>
        <BitGrid value={value} format={format} onValueChange={handleValueChange} />
      </div>
      <NumPad
        inputBase={inputBase}
        supportsDecimal={format.category === 'float' || format.category === 'fixed'}
        supportsNegation={format.supportsNegation}
        onDigit={appendDigit}
        onBackspace={deleteDigit}
        onNegate={toggleNegative}
        visible={mobileView === 'numpad'}
      />
      <Keypad
        format={format}
        onOperation={handleOperation}
        onEquals={handleEquals}
        onSpecialValue={handleValueChange}
        negationDisabled={!format.supportsNegation}
      />
    </div>
  );
}

export default App;
