export function satoshiToDecimal(satoshi: bigint): string {
  return (satoshi / BigInt(100000000)).toString();
}
