import { LoaderCircle, Send } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import useBtcAddress from '@/hooks/useBtcAddress';
import { useMutation } from '@tanstack/react-query';
import { useActor } from '@/actor';
import useHandleAgentError from '@/hooks/useHandleAgentError';
import SendConfirmation from './send-confirmation';

export default function SendButton() {
  const { isPending: isFetchingAddress } = useBtcAddress();
  const { actor: backend } = useActor();
  const { handleAgentError } = useHandleAgentError();
  const {
    mutate: sendBtc,
    isPending: isSending,
    isError,
    data: sendResult,
    isIdle,
    reset,
  } = useMutation({
    mutationFn: async ({ to, amount }: { to: string; amount: string }) => {
      if (!backend) {
        throw new Error('backend actor not initialized');
      }
      try {
        return await backend.send_btc(to, BigInt(amount));
      } catch (e) {
        handleAgentError(e);
        console.error(e);
        throw e;
      }
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendBtc({
      to: event.currentTarget.toAddress.value,
      amount: event.currentTarget.amount.value,
    });
  };

  return (
    <Dialog onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button
          disabled={isFetchingAddress}
          className="flex flex-col h-30 w-full items-start gap-1"
        >
          <Send className="w-5 h-5" />
          Send
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
        </DialogHeader>
        {(isIdle || isSending) && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="To address"
              name="toAddress"
              data-1p-ignore
            />
            <Input
              type="text"
              placeholder="Amount in satoshis"
              name="amount"
              data-1p-ignore
            />
            <Button disabled={isSending} type="submit">
              {isSending ? (
                <>
                  <LoaderCircle className="animate-spin w-4 h-4 mr-1" />
                  Sending ...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </form>
        )}
        {isError && (
          <div className="bg-destructive/30 rounded-lg p-2 text-destructive-foreground">
            There was an error sending BTC, see browser console for details.
          </div>
        )}
        {sendResult && 'Ok' in sendResult && (
          <SendConfirmation txId={sendResult.Ok} />
        )}
        {sendResult && 'Err' in sendResult && (
          <div className="flex flex-col gap-2 bg-destructive/30 rounded-lg p-2 text-destructive-foreground">
            <div>Error, couldn't send.</div>
            <div>{sendResult.Err}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
