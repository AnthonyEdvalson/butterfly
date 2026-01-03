export function mask(value: bigint, bitWidth: number): bigint {
  const m = (1n << BigInt(bitWidth)) - 1n;
  return value & m;
}

export function toggleBit(value: bigint, bitIndex: number, bitWidth: number): bigint {
  const bit = 1n << BigInt(bitIndex);
  return mask(value ^ bit, bitWidth);
}

export function getBit(value: bigint, bitIndex: number): bigint {
  return (value >> BigInt(bitIndex)) & 1n;
}

export function setBit(value: bigint, bitIndex: number, bitValue: bigint, bitWidth: number): bigint {
  const bit = 1n << BigInt(bitIndex);
  if (bitValue) {
    return mask(value | bit, bitWidth);
  } else {
    return mask(value & ~bit, bitWidth);
  }
}
