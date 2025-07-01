export function satoshiToDecimal(satoshi: bigint): string {
  const SATS_PER_BTC = 100_000_000n;
  const integerPart = satoshi / SATS_PER_BTC;
  const fractionalPart = satoshi % SATS_PER_BTC;

  if (fractionalPart === 0n) {
    return integerPart.toString();
  }

  // Get fractional part as string, padded to 8 digits
  let fractionalStr = fractionalPart.toString().padStart(8, '0').slice(0, 6);

  // Remove trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, '');

  return `${integerPart.toString()}.${fractionalStr}`;
}
