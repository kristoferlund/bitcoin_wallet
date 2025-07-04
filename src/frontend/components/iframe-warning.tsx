import { InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function IframeWarning() {
  if (window.self === window.top) {
    return null;
  }

  return (
    <Alert variant="destructive" className="w-[400px] mb-5">
      <InfoIcon className="w-4 h-4" />
      <AlertDescription>
        Copying of addresses don't work in iframes. Open this application in a
        new tab to access all functionality.
      </AlertDescription>
    </Alert>
  );
}
