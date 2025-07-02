import useBtcAddress from '@/hooks/useBtcAddress';
import { Loader2 } from 'lucide-react';

export function BtcAddress() {
  const { data: address, isPending: isFetchingAddress } = useBtcAddress();

  if (isFetchingAddress || !address) {
    return (
      <div className="flex gap-1 items-center text-muted-foreground/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        Deriving address...
      </div>
    );
  }

  return (
    <div className="text-muted-foreground inline-block">
      {address.slice(0, 5)}...{address.slice(-5)}
    </div>
  );
}
