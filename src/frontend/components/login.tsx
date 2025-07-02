import { useInternetIdentity } from 'ic-use-internet-identity';
import { Button } from './ui/button';
import { Bitcoin, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function LoginButton() {
  const { login, loginStatus } = useInternetIdentity();

  const disabled = loginStatus === 'logging-in' || loginStatus === 'success';
  const text =
    loginStatus === 'logging-in'
      ? 'Signing in...'
      : 'Sign in with Internet Identity';

  return (
    <section className="flex flex-col gap-5">
      <div className="flex gap-2 items-center">
        <div className="rounded-full bg-primary p-1">
          <Bitcoin />
        </div>
        <h3>Wallet</h3>
      </div>
      <Button onClick={login} disabled={disabled}>
        {text}
      </Button>
      <Alert>
        <InfoIcon className="w-4 h-4" />
        <AlertDescription>
          <div className="flex flex-col gap-2">
            This is an example application, a multiuser Bitcoin wallet on the
            Internet Computer (ICP).
            <div className="flex items-center gap-2">
              Source code:
              <a
                href="http://github.com/kristoferlund/bitcoin_wallet"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                bitcoin_wallet
              </a>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </section>
  );
}
