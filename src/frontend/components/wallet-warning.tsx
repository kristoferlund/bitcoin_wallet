import { CircleAlert } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function WalletWarning() {
  return (
    <Alert variant="destructive" className="w-[400px] mb-5">
      <CircleAlert className="w-4 h-4" />
      <AlertDescription>
        This is an example application using real Bitcoin transactions. Your
        funds are not safe here. Please use only minimal amounts when testing.
      </AlertDescription>
    </Alert>
  );
}
