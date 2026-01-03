import type { NumberFormat } from '../types/NumberFormat';
import { createIntegerFormat } from './integer';
import { createFloatFormat } from './float';
import { createFixedFormat } from './fixed';

export { createIntegerFormat } from './integer';
export { createFloatFormat } from './float';
export { createFixedFormat } from './fixed';

export const FORMATS: Record<string, NumberFormat> = {
  int8: createIntegerFormat(8, true),
  uint8: createIntegerFormat(8, false),
  int16: createIntegerFormat(16, true),
  uint16: createIntegerFormat(16, false),
  int32: createIntegerFormat(32, true),
  uint32: createIntegerFormat(32, false),
  int64: createIntegerFormat(64, true),
  uint64: createIntegerFormat(64, false),

  float16: createFloatFormat({ id: 'float16', name: 'float16', exponentBits: 5, mantissaBits: 10 }),
  bfloat16: createFloatFormat({ id: 'bfloat16', name: 'bfloat16', exponentBits: 8, mantissaBits: 7 }),
  float32: createFloatFormat({ id: 'float32', name: 'float32', exponentBits: 8, mantissaBits: 23 }),
  float64: createFloatFormat({ id: 'float64', name: 'float64', exponentBits: 11, mantissaBits: 52 }),

  'q7.8': createFixedFormat({ id: 'q7.8', name: 'Q7.8', integerBits: 7, fractionalBits: 8, signed: true }),
  'q15.16': createFixedFormat({ id: 'q15.16', name: 'Q15.16', integerBits: 15, fractionalBits: 16, signed: true }),
  'uq8.8': createFixedFormat({ id: 'uq8.8', name: 'UQ8.8', integerBits: 8, fractionalBits: 8, signed: false }),
};

export const FORMAT_LIST = Object.values(FORMATS);

export function getFormat(id: string): NumberFormat {
  return FORMATS[id] || FORMATS.int32;
}
