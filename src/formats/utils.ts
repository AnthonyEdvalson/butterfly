export function mask(value: bigint, bitWidth: number): bigint {
  const m = (1n << BigInt(bitWidth)) - 1n;
  return value & m;
}

export function toSigned(value: bigint, bitWidth: number): bigint {
  const masked = mask(value, bitWidth);
  const signBit = 1n << BigInt(bitWidth - 1);
  if (masked & signBit) {
    return masked - (1n << BigInt(bitWidth));
  }
  return masked;
}

export function toUnsigned(value: bigint, bitWidth: number): bigint {
  if (value < 0n) {
    return value + (1n << BigInt(bitWidth));
  }
  return mask(value, bitWidth);
}

export function wrapResult(result: bigint, bitWidth: number, signed: boolean): bigint {
  if (signed && result < 0n) {
    return toUnsigned(result, bitWidth);
  }
  return mask(result, bitWidth);
}
