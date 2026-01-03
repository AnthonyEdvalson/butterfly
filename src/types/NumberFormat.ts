export interface FloatComponents {
  sign: number;
  exponent: number;
  mantissa: bigint;
  value: number;
}

export type BinaryOp = '+' | '-' | '*' | '/' | '%' | 'AND' | 'OR' | 'XOR' | '<<' | '>>' | '>>>';
export type UnaryOp = 'NOT' | 'CLR' | '±';

export interface BinaryOps {
  add(a: bigint, b: bigint): bigint;
  subtract(a: bigint, b: bigint): bigint;
  multiply(a: bigint, b: bigint): bigint;
  divide(a: bigint, b: bigint): bigint;
  modulo(a: bigint, b: bigint): bigint;
  and(a: bigint, b: bigint): bigint;
  or(a: bigint, b: bigint): bigint;
  xor(a: bigint, b: bigint): bigint;
  shiftLeft(a: bigint, b: bigint): bigint;
  shiftRight(a: bigint, b: bigint): bigint;
  shiftRightUnsigned(a: bigint, b: bigint): bigint;
}

export interface UnaryOps {
  not(value: bigint): bigint;
  negate(value: bigint): bigint;
  clear(): bigint;
}

export type BitCategory = 1 | 2 | 3;

interface NumberFormatBase extends BinaryOps, UnaryOps {
  id: string;
  name: string;
  bitWidth: number;
  supportsNegation: boolean;

  format(bits: bigint, base: number): string;
  parse(str: string, base: number): bigint;
  validInputPattern(base: number): RegExp;
  getBitCategory(bitIndex: number): BitCategory;
}

export interface IntegerFormat extends NumberFormatBase {
  category: 'integer';
  signed: boolean;
}

export interface FloatFormat extends NumberFormatBase {
  category: 'float';
  exponentBits: number;
  mantissaBits: number;
  bias: number;
  getComponents(bits: bigint): FloatComponents;
}

export interface FixedFormat extends NumberFormatBase {
  category: 'fixed';
  signed: boolean;
  integerBits: number;
  fractionalBits: number;
}

export type NumberFormat = IntegerFormat | FloatFormat | FixedFormat;

export function performBinaryOp(format: NumberFormat, a: bigint, op: BinaryOp, b: bigint): bigint {
  switch (op) {
    case '+': return format.add(a, b);
    case '-': return format.subtract(a, b);
    case '*': return format.multiply(a, b);
    case '/': return format.divide(a, b);
    case '%': return format.modulo(a, b);
    case 'AND': return format.and(a, b);
    case 'OR': return format.or(a, b);
    case 'XOR': return format.xor(a, b);
    case '<<': return format.shiftLeft(a, b);
    case '>>': return format.shiftRight(a, b);
    case '>>>': return format.shiftRightUnsigned(a, b);
  }
}

export function performUnaryOp(format: NumberFormat, value: bigint, op: UnaryOp): bigint {
  switch (op) {
    case 'NOT': return format.not(value);
    case '±': return format.negate(value);
    case 'CLR': return format.clear();
  }
}

export function isBinaryOp(op: string): op is BinaryOp {
  return ['+', '-', '*', '/', '%', 'AND', 'OR', 'XOR', '<<', '>>', '>>>'].includes(op);
}

export function isUnaryOp(op: string): op is UnaryOp {
  return ['NOT', 'CLR', '±'].includes(op);
}
