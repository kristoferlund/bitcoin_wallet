import useBtcBalance from '@/hooks/useBtcBalance';
import { Skeleton } from './ui/skeleton';
import { satoshiToDecimal } from '@/lib/btc';

export function Balance() {
  const {
    data: balance,
    isPending: isFetchingBalance,
    isError,
  } = useBtcBalance();

  if (isFetchingBalance) {
    return <Skeleton className="w-full h-14" />;
  }

  if (isError) {
    return (
      <div className="text-4xl font-semibold bg-destructive/30 rounded-lg p-2 text-destructive-foreground">
        Couldn't get wallet balance.
      </div>
    );
  }

  return (
    <div className="text-4xl font-semibold">
      {satoshiToDecimal(balance)} BTC
    </div>
  );
}
