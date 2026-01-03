import type { FloatFormat, FloatComponents } from '../types/NumberFormat';
import { mask } from './utils';

function floatBitsToNumber(bits: bigint, exponentBits: number, mantissaBits: number, bias: number): number {
  const bitWidth = 1 + exponentBits + mantissaBits;
  const masked = mask(bits, bitWidth);

  const sign = Number((masked >> BigInt(exponentBits + mantissaBits)) & 1n);
  const exponentMask = (1n << BigInt(exponentBits)) - 1n;
  const exponent = Number((masked >> BigInt(mantissaBits)) & exponentMask);
  const mantissaMask = (1n << BigInt(mantissaBits)) - 1n;
  const mantissa = masked & mantissaMask;

  const signMultiplier = sign === 0 ? 1 : -1;

  if (exponent === 0) {
    if (mantissa === 0n) {
      return sign === 0 ? 0 : -0;
    }
    const mantissaValue = Number(mantissa) / Math.pow(2, mantissaBits);
    return signMultiplier * Math.pow(2, 1 - bias) * mantissaValue;
  } else if (exponent === (1 << exponentBits) - 1) {
    if (mantissa === 0n) {
      return signMultiplier * Infinity;
    }
    return NaN;
  } else {
    const mantissaValue = 1 + Number(mantissa) / Math.pow(2, mantissaBits);
    return signMultiplier * Math.pow(2, exponent - bias) * mantissaValue;
  }
}

function numberToFloatBits(value: number, exponentBits: number, mantissaBits: number, bias: number): bigint {
  const bitWidth = 1 + exponentBits + mantissaBits;
  const maxExponent = (1 << exponentBits) - 1;

  if (Number.isNaN(value)) {
    const expBits = BigInt(maxExponent) << BigInt(mantissaBits);
    const mantissaBit = 1n << BigInt(mantissaBits - 1);
    return expBits | mantissaBit;
  }

  const sign = value < 0 || Object.is(value, -0) ? 1n : 0n;
  const absValue = Math.abs(value);

  if (!Number.isFinite(absValue)) {
    const expBits = BigInt(maxExponent) << BigInt(mantissaBits);
    return (sign << BigInt(bitWidth - 1)) | expBits;
  }

  if (absValue === 0) {
    return sign << BigInt(bitWidth - 1);
  }

  let exp = Math.floor(Math.log2(absValue));
  let mantissa = absValue / Math.pow(2, exp) - 1;
  let biasedExp = exp + bias;

  if (biasedExp <= 0) {
    mantissa = absValue / Math.pow(2, 1 - bias);
    const mantissaInt = BigInt(Math.round(mantissa * Math.pow(2, mantissaBits)));
    return (sign << BigInt(bitWidth - 1)) | mask(mantissaInt, mantissaBits);
  }

  if (biasedExp >= maxExponent) {
    const expBits = BigInt(maxExponent) << BigInt(mantissaBits);
    return (sign << BigInt(bitWidth - 1)) | expBits;
  }

  const mantissaInt = BigInt(Math.round(mantissa * Math.pow(2, mantissaBits)));
  const expBits = BigInt(biasedExp) << BigInt(mantissaBits);
  return (sign << BigInt(bitWidth - 1)) | expBits | mask(mantissaInt, mantissaBits);
}

export function createFloatFormat(opts: {
  id: string;
  name: string;
  exponentBits: number;
  mantissaBits: number;
}): FloatFormat {
  const { id, name, exponentBits, mantissaBits } = opts;
  const bitWidth = 1 + exponentBits + mantissaBits;
  const bias = (1 << (exponentBits - 1)) - 1;

  const toNumber = (bits: bigint) => floatBitsToNumber(bits, exponentBits, mantissaBits, bias);
  const toBits = (value: number) => numberToFloatBits(value, exponentBits, mantissaBits, bias);

  return {
    id,
    name,
    bitWidth,
    category: 'float',
    exponentBits,
    mantissaBits,
    bias,
    supportsNegation: true,

    getComponents(bits: bigint): FloatComponents {
      const masked = mask(bits, bitWidth);
      const sign = Number((masked >> BigInt(exponentBits + mantissaBits)) & 1n);
      const exponentMask = (1n << BigInt(exponentBits)) - 1n;
      const exponent = Number((masked >> BigInt(mantissaBits)) & exponentMask);
      const mantissaMask = (1n << BigInt(mantissaBits)) - 1n;
      const mantissa = masked & mantissaMask;
      const value = toNumber(bits);

      return { sign, exponent, mantissa, value };
    },

    format(bits: bigint, base: number): string {
      if (base === 2) {
        const unsigned = mask(bits, bitWidth);
        return unsigned.toString(2).padStart(bitWidth, '0');
      } else if (base === 16) {
        const unsigned = mask(bits, bitWidth);
        const hexDigits = Math.ceil(bitWidth / 4);
        return unsigned.toString(16).toUpperCase().padStart(hexDigits, '0');
      } else {
        const value = toNumber(bits);
        if (Number.isNaN(value)) return 'NaN';
        if (!Number.isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity';
        if (Object.is(value, -0)) return '-0';
        const precision = Math.ceil(mantissaBits * Math.log10(2)) + 1;
        const str = value.toPrecision(Math.min(precision, 21));
        return str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
      }
    },

    parse(str: string, base: number): bigint {
      if (!str) return 0n;

      if (base === 2) {
        const cleaned = str.replace(/[^01]/g, '') || '0';
        return mask(BigInt('0b' + cleaned), bitWidth);
      } else if (base === 16) {
        const cleaned = str.replace(/[^0-9a-fA-F]/g, '') || '0';
        return mask(BigInt('0x' + cleaned), bitWidth);
      } else {
        const lower = str.toLowerCase().trim();
        if (lower === 'nan') return toBits(NaN);
        if (lower === 'infinity' || lower === 'inf') return toBits(Infinity);
        if (lower === '-infinity' || lower === '-inf') return toBits(-Infinity);

        const value = parseFloat(str);
        if (Number.isNaN(value)) return 0n;
        return toBits(value);
      }
    },

    validInputPattern(base: number): RegExp {
      if (base === 2) return /^[01]*$/;
      if (base === 16) return /^[0-9a-fA-F]*$/;
      return /^-?[0-9]*\.?[0-9]*([eE][+-]?[0-9]*)?$|^-?[Ii]nf(inity)?$|^[Nn]a[Nn]$/;
    },

    add(a: bigint, b: bigint): bigint {
      return toBits(toNumber(a) + toNumber(b));
    },

    subtract(a: bigint, b: bigint): bigint {
      return toBits(toNumber(a) - toNumber(b));
    },

    multiply(a: bigint, b: bigint): bigint {
      return toBits(toNumber(a) * toNumber(b));
    },

    divide(a: bigint, b: bigint): bigint {
      return toBits(toNumber(a) / toNumber(b));
    },

    modulo(a: bigint, b: bigint): bigint {
      return toBits(toNumber(a) % toNumber(b));
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
      return mask(a >> b, bitWidth);
    },

    shiftRightUnsigned(a: bigint, b: bigint): bigint {
      return mask(a >> b, bitWidth);
    },

    not(value: bigint): bigint {
      return mask(~value, bitWidth);
    },

    negate(value: bigint): bigint {
      const signBit = 1n << BigInt(bitWidth - 1);
      return value ^ signBit;
    },

    clear(): bigint {
      return 0n;
    },

    getBitCategory(bitIndex: number) {
      if (bitIndex === bitWidth - 1) return 1;
      if (bitIndex >= mantissaBits) return 3;
      return 2;
    },
  };
}
