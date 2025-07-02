import useBtcAddress from '@/hooks/useBtcAddress';
import { Copy, Loader2 } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { Button } from './ui/button';

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
    <div className="flex gap-1 items-center">
      <a
        href={`https://mempool.space/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        {address.slice(0, 5)}...{address.slice(-5)}
      </a>
      <Button
        variant="ghost"
        onClick={() => copyToClipboard(address)}
        size="icon"
      >
        <Copy className="inline-block h-4 w-4" />
      </Button>
    </div>
  );
}
