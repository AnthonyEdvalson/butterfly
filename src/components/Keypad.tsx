import type { NumberFormat } from '../types/NumberFormat';

interface SpecialValue {
  label: string;
  bits: bigint;
}

function getSpecialValues(format: NumberFormat): SpecialValue[] {
  const { bitWidth } = format;
  const allOnes = (1n << BigInt(bitWidth)) - 1n;

  if (format.category === 'integer') {
    if (format.signed) {
      const max = (1n << BigInt(bitWidth - 1)) - 1n;
      const min = 1n << BigInt(bitWidth - 1);
      return [
        { label: 'MAX', bits: max },
        { label: 'MIN', bits: min },
        { label: '-1', bits: allOnes },
      ];
    } else {
      return [
        { label: 'MAX', bits: allOnes },
        { label: '1', bits: 1n },
      ];
    }
  }

  if (format.category === 'float') {
    const { exponentBits, mantissaBits } = format;
    const expAllOnes = (1n << BigInt(exponentBits)) - 1n;
    const mantissaAllOnes = (1n << BigInt(mantissaBits)) - 1n;
    const signBit = 1n << BigInt(bitWidth - 1);

    const posInf = expAllOnes << BigInt(mantissaBits);
    const negInf = signBit | posInf;
    const nan = posInf | (1n << BigInt(mantissaBits - 1));
    const negZero = signBit;
    const maxFinite = ((expAllOnes - 1n) << BigInt(mantissaBits)) | mantissaAllOnes;
    const minNormal = 1n << BigInt(mantissaBits);
    const minSubnormal = 1n;

    return [
      { label: 'NaN', bits: nan },
      { label: '+Inf', bits: posInf },
      { label: '-Inf', bits: negInf },
      { label: 'MAX', bits: maxFinite },
      { label: 'MIN', bits: minNormal },
      { label: 'ε', bits: minSubnormal },
      { label: '-0', bits: negZero },
    ];
  }

  if (format.category === 'fixed') {
    if (format.signed) {
      const max = (1n << BigInt(bitWidth - 1)) - 1n;
      const min = 1n << BigInt(bitWidth - 1);
      const one = 1n << BigInt(format.fractionalBits);
      const negOne = allOnes - one + 1n;
      return [
        { label: 'MAX', bits: max },
        { label: 'MIN', bits: min },
        { label: '1', bits: one },
        { label: '-1', bits: negOne },
      ];
    } else {
      const one = 1n << BigInt(format.fractionalBits);
      return [
        { label: 'MAX', bits: allOnes },
        { label: '1', bits: one },
      ];
    }
  }

  return [];
}

interface KeypadProps {
  format: NumberFormat;
  onOperation: (op: string) => void;
  onEquals: () => void;
  onSpecialValue: (bits: bigint) => void;
  negationDisabled?: boolean;
}

function Keypad({ format, onOperation, onEquals, onSpecialValue, negationDisabled }: KeypadProps) {
  const bitwiseOps = ['AND', 'OR', 'XOR', 'NOT'];
  const shiftOps = ['<<', '>>', '>>>'];
  const arithmeticOps = ['+', '-', '*', '/', '%'];
  const specialValues = getSpecialValues(format);

  return (
    <div className="keypad">
      <div className="keypad-row">
        {specialValues.map((sv) => (
          <button key={sv.label} className="keypad-btn" onClick={() => onSpecialValue(sv.bits)}>
            {sv.label}
          </button>
        ))}
      </div>
      <div className="keypad-row">
        {[...bitwiseOps, ...shiftOps].map((op) => (
          <button key={op} className="keypad-btn" onClick={() => onOperation(op)}>
            {op}
          </button>
        ))}
      </div>
      <div className="keypad-row">
        {arithmeticOps.map((op) => (
          <button key={op} className="keypad-btn" onClick={() => onOperation(op)}>
            {op}
          </button>
        ))}
        <button className="keypad-btn" onClick={() => onOperation('±')} disabled={negationDisabled}>
          ±
        </button>
      </div>
      <div className="keypad-row">
        <button className="keypad-btn op-action" onClick={() => onOperation('CLR')}>
          CLR
        </button>
        <button className="keypad-btn op-equals" onClick={onEquals}>
          =
        </button>
      </div>
    </div>
  );
}

export default Keypad;
