import { CheckCircle } from 'lucide-react';

export default function SendConfirmation({ txId }: { txId: string }) {
  return (
    <div className="flex flex-col gap-5 items-center text-center">
      <CheckCircle className="w-10 h-10 text-primary" />
      Your transaction was successfully sent, track its status on the blockchain
      explorer.
      <a
        href={`https://mempool.space/tx/${txId}`}
        className="underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {txId.slice(0, 8)}...{txId.slice(-8)}
      </a>
    </div>
  );
}
