import { CircleArrowDown, Copy } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useBtcAddress from '@/hooks/useBtcAddress';
import QRCode from 'react-qr-code';
import { copyToClipboard } from '@/lib/utils';

export default function ReceiveButton() {
  const { data: address, isPending: isFetchingAddress } = useBtcAddress();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={isFetchingAddress}
          className="flex flex-col h-30 w-full items-start gap-1"
        >
          <CircleArrowDown className="w-5 h-5" />
          Receive
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>

        {address && (
          <>
            {' '}
            <div className="rounded-lg border p-5 bg-primary">
              <QRCode
                size={256}
                style={{
                  height: 'auto',
                  maxWidth: '100%',
                  width: '100%',
                  color: 'red',
                }}
                value={`bitcoin:${address}`}
                viewBox={`0 0 256 256`}
                bgColor="#EA580C"
              />
            </div>
            <code
              className="relative text-center text-2xl rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold hover:bg-muted-foreground cursor-pointer"
              onClick={() => copyToClipboard(address!)}
            >
              {address.slice(0, 5)}...{address.slice(-5)}
              <Copy className="inline-block h-5 w-5 ml-2 pb-[2px]" />
            </code>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
