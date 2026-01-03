import type { IntegerFormat } from '../types/NumberFormat';
import { mask, toSigned, toUnsigned, wrapResult } from './utils';

export function createIntegerFormat(bits: number, signed: boolean): IntegerFormat {
  const id = signed ? `int${bits}` : `uint${bits}`;
  const name = signed ? `int${bits}` : `uint${bits}`;

  const getSignedValues = (a: bigint, b: bigint) => ({
    signedA: signed ? toSigned(a, bits) : a,
    signedB: signed ? toSigned(b, bits) : b,
  });

  return {
    id,
    name,
    bitWidth: bits,
    category: 'integer',
    signed,
    supportsNegation: signed,

    format(value: bigint, base: number): string {
      const displayValue = signed ? toSigned(value, bits) : mask(value, bits);

      if (base === 2) {
        const unsigned = mask(value, bits);
        return unsigned.toString(2).padStart(bits, '0');
      } else if (base === 16) {
        const unsigned = mask(value, bits);
        const hexDigits = Math.ceil(bits / 4);
        return unsigned.toString(16).toUpperCase().padStart(hexDigits, '0');
      } else {
        return displayValue.toString(10);
      }
    },

    parse(str: string, base: number): bigint {
      if (!str || str === '-') return 0n;

      try {
        let value: bigint;
        if (base === 2) {
          value = BigInt('0b' + (str.replace(/[^01]/g, '') || '0'));
        } else if (base === 16) {
          value = BigInt('0x' + (str.replace(/[^0-9a-fA-F]/g, '') || '0'));
        } else {
          const isNegative = str.startsWith('-');
          const digits = str.replace(/[^0-9]/g, '') || '0';
          value = BigInt(digits);
          if (isNegative && signed) {
            value = -value;
          }
        }

        if (signed && value < 0n) {
          return toUnsigned(value, bits);
        }
        return mask(value, bits);
      } catch {
        return 0n;
      }
    },

    validInputPattern(base: number): RegExp {
      if (base === 2) return /^[01]*$/;
      if (base === 16) return /^[0-9a-fA-F]*$/;
      if (signed) return /^-?[0-9]*$/;
      return /^[0-9]*$/;
    },

    add(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      return wrapResult(signedA + signedB, bits, signed);
    },

    subtract(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      return wrapResult(signedA - signedB, bits, signed);
    },

    multiply(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      return wrapResult(signedA * signedB, bits, signed);
    },

    divide(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      if (signedB === 0n) return a;
      return wrapResult(signedA / signedB, bits, signed);
    },

    modulo(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      if (signedB === 0n) return a;
      return wrapResult(signedA % signedB, bits, signed);
    },

    and(a: bigint, b: bigint): bigint {
      return mask(a & b, bits);
    },

    or(a: bigint, b: bigint): bigint {
      return mask(a | b, bits);
    },

    xor(a: bigint, b: bigint): bigint {
      return mask(a ^ b, bits);
    },

    shiftLeft(a: bigint, b: bigint): bigint {
      return mask(a << b, bits);
    },

    shiftRight(a: bigint, b: bigint): bigint {
      if (signed) {
        const signedA = toSigned(a, bits);
        return toUnsigned(signedA >> b, bits);
      }
      return mask(a >> b, bits);
    },

    shiftRightUnsigned(a: bigint, b: bigint): bigint {
      return mask(a >> b, bits);
    },

    not(value: bigint): bigint {
      return mask(~value, bits);
    },

    negate(value: bigint): bigint {
      return mask(-value, bits);
    },

    clear(): bigint {
      return 0n;
    },

    getBitCategory(bitIndex: number) {
      if (signed && bitIndex === bits - 1) return 1;
      return 2;
    },
  };
}
