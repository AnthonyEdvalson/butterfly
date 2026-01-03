import type { FixedFormat } from '../types/NumberFormat';
import { mask, toSigned, toUnsigned, wrapResult } from './utils';

export function createFixedFormat(opts: {
  id: string;
  name: string;
  integerBits: number;
  fractionalBits: number;
  signed: boolean;
}): FixedFormat {
  const { id, name, integerBits, fractionalBits, signed } = opts;
  const bitWidth = integerBits + fractionalBits + (signed ? 1 : 0);
  const scaleNumber = Math.pow(2, fractionalBits);

  const getSignedValues = (a: bigint, b: bigint) => ({
    signedA: signed ? toSigned(a, bitWidth) : a,
    signedB: signed ? toSigned(b, bitWidth) : b,
  });

  return {
    id,
    name,
    bitWidth,
    category: 'fixed',
    signed,
    supportsNegation: signed,
    integerBits,
    fractionalBits,

    format(bits: bigint, base: number): string {
      if (base === 2) {
        const unsigned = mask(bits, bitWidth);
        return unsigned.toString(2).padStart(bitWidth, '0');
      } else if (base === 16) {
        const unsigned = mask(bits, bitWidth);
        const hexDigits = Math.ceil(bitWidth / 4);
        return unsigned.toString(16).toUpperCase().padStart(hexDigits, '0');
      } else {
        const rawValue = signed ? toSigned(bits, bitWidth) : mask(bits, bitWidth);
        const floatValue = Number(rawValue) / scaleNumber;
        const decimalPlaces = Math.ceil(fractionalBits * Math.log10(2));
        return floatValue.toFixed(decimalPlaces).replace(/\.?0+$/, '');
      }
    },

    parse(str: string, base: number): bigint {
      if (!str || str === '-') return 0n;

      if (base === 2) {
        const cleaned = str.replace(/[^01]/g, '') || '0';
        return mask(BigInt('0b' + cleaned), bitWidth);
      } else if (base === 16) {
        const cleaned = str.replace(/[^0-9a-fA-F]/g, '') || '0';
        return mask(BigInt('0x' + cleaned), bitWidth);
      } else {
        const value = parseFloat(str);
        if (Number.isNaN(value)) return 0n;

        const scaled = BigInt(Math.round(value * scaleNumber));
        if (signed && scaled < 0n) {
          return toUnsigned(scaled, bitWidth);
        }
        return mask(scaled, bitWidth);
      }
    },

    validInputPattern(base: number): RegExp {
      if (base === 2) return /^[01]*$/;
      if (base === 16) return /^[0-9a-fA-F]*$/;
      if (signed) return /^-?[0-9]*\.?[0-9]*$/;
      return /^[0-9]*\.?[0-9]*$/;
    },

    add(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      return wrapResult(signedA + signedB, bitWidth, signed);
    },

    subtract(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      return wrapResult(signedA - signedB, bitWidth, signed);
    },

    multiply(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      const result = (signedA * signedB) >> BigInt(fractionalBits);
      return wrapResult(result, bitWidth, signed);
    },

    divide(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      if (signedB === 0n) return a;
      const result = (signedA << BigInt(fractionalBits)) / signedB;
      return wrapResult(result, bitWidth, signed);
    },

    modulo(a: bigint, b: bigint): bigint {
      const { signedA, signedB } = getSignedValues(a, b);
      if (signedB === 0n) return a;
      return wrapResult(signedA % signedB, bitWidth, signed);
    },

    and(a: bigint, b: bigint): bigint {
      return mask(a & b, bitWidth);
    },

    or(a: bigint, b: bigint): bigint {
      return mask(a | b, bitWidth);
    },

    xor(a: bigint, b: bigint): bigint {
      return mask(a ^ b, bitWidth);
    },

    shiftLeft(a: bigint, b: bigint): bigint {
      return mask(a << b, bitWidth);
    },

    shiftRight(a: bigint, b: bigint): bigint {
      if (signed) {
        const signedA = toSigned(a, bitWidth);
        return toUnsigned(signedA >> b, bitWidth);
      }
      return mask(a >> b, bitWidth);
    },

    shiftRightUnsigned(a: bigint, b: bigint): bigint {
      return mask(a >> b, bitWidth);
    },

    not(value: bigint): bigint {
      return mask(~value, bitWidth);
    },

    negate(value: bigint): bigint {
      return mask(-value, bitWidth);
    },

    clear(): bigint {
      return 0n;
    },

    getBitCategory(bitIndex: number) {
      if (signed && bitIndex === bitWidth - 1) return 1;
      if (bitIndex >= fractionalBits) return 2;
      return 3;
    },
  };
}
