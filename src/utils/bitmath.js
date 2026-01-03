export function mask(value, bitWidth) {
  const m = (1n << BigInt(bitWidth)) - 1n;
  return value & m;
}

export function toSigned(value, bitWidth) {
  const masked = mask(value, bitWidth);
  const signBit = 1n << BigInt(bitWidth - 1);
  if (masked & signBit) {
    return masked - (1n << BigInt(bitWidth));
  }
  return masked;
}

export function toUnsigned(value, bitWidth) {
  if (value < 0n) {
    return value + (1n << BigInt(bitWidth));
  }
  return mask(value, bitWidth);
}

export function formatValue(value, base, bitWidth, signed) {
  let displayValue = signed ? toSigned(value, bitWidth) : mask(value, bitWidth);
  
  if (base === 2) {
    const unsigned = mask(value, bitWidth);
    return unsigned.toString(2).padStart(bitWidth, '0');
  } else if (base === 16) {
    const unsigned = mask(value, bitWidth);
    const hexDigits = Math.ceil(bitWidth / 4);
    return unsigned.toString(16).toUpperCase().padStart(hexDigits, '0');
  } else {
    return displayValue.toString(10);
  }
}

export function parseValue(str, base, bitWidth, signed) {
  if (!str || str === '-') return 0n;
  
  try {
    let value;
    if (base === 2) {
      value = BigInt('0b' + str.replace(/[^01]/g, '') || '0');
    } else if (base === 16) {
      value = BigInt('0x' + str.replace(/[^0-9a-fA-F]/g, '') || '0');
    } else {
      const isNegative = str.startsWith('-');
      const digits = str.replace(/[^0-9]/g, '') || '0';
      value = BigInt(digits);
      if (isNegative && signed) {
        value = -value;
      }
    }
    
    if (signed && value < 0n) {
      return toUnsigned(value, bitWidth);
    }
    return mask(value, bitWidth);
  } catch {
    return 0n;
  }
}

export function toggleBit(value, bitIndex, bitWidth) {
  const bit = 1n << BigInt(bitIndex);
  return mask(value ^ bit, bitWidth);
}

export function getBit(value, bitIndex) {
  return (value >> BigInt(bitIndex)) & 1n;
}

export function setBit(value, bitIndex, bitValue, bitWidth) {
  const bit = 1n << BigInt(bitIndex);
  if (bitValue) {
    return mask(value | bit, bitWidth);
  } else {
    return mask(value & ~bit, bitWidth);
  }
}

export function performOperation(a, op, b, bitWidth, signed) {
  let result;
  const signedA = signed ? toSigned(a, bitWidth) : a;
  const signedB = signed ? toSigned(b, bitWidth) : b;
  
  switch (op) {
    case '+':
      result = signedA + signedB;
      break;
    case '-':
      result = signedA - signedB;
      break;
    case '*':
      result = signedA * signedB;
      break;
    case '/':
      if (signedB === 0n) return a;
      result = signedA / signedB;
      break;
    case '%':
      if (signedB === 0n) return a;
      result = signedA % signedB;
      break;
    case 'AND':
      result = a & b;
      break;
    case 'OR':
      result = a | b;
      break;
    case 'XOR':
      result = a ^ b;
      break;
    case '<<':
      result = a << b;
      break;
    case '>>':
      if (signed) {
        result = toUnsigned(signedA >> signedB, bitWidth);
      } else {
        result = a >> b;
      }
      break;
    case '>>>':
      result = a >> b;
      break;
    default:
      return a;
  }
  
  if (signed && result < 0n) {
    return toUnsigned(result, bitWidth);
  }
  return mask(result, bitWidth);
}

export function performUnaryOperation(value, op, bitWidth) {
  switch (op) {
    case 'NOT':
      return mask(~value, bitWidth);
    case 'CLR':
      return 0n;
    case '±':
      return mask(-value, bitWidth);
    default:
      return value;
  }
}

export function getValidChars(base, signed) {
  if (base === 2) return /^[01]*$/;
  if (base === 16) return /^[0-9a-fA-F]*$/;
  if (signed) return /^-?[0-9]*$/;
  return /^[0-9]*$/;
}

export function isValidInput(str, base, signed) {
  return getValidChars(base, signed).test(str);
}

