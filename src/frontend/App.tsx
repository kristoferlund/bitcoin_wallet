import Login from './components/login';
import { useInternetIdentity } from 'ic-use-internet-identity';
import Wallet from './components/wallet';
import { Toaster } from './components/ui/toaster';
import { Badge } from './components/ui/badge';
import IframeWarning from './components/iframe-warning';
import WalletWarning from './components/wallet-warning';
import { useEffect } from "react";
import { useBackendActor } from "./main";

function AppInner() {
  const { identity } = useInternetIdentity();
  const { authenticate } = useBackendActor();

  // Authenticate backend actor when identity is available
  useEffect(() => {
    if (identity) {
      authenticate(identity);
    }
  }, [identity, authenticate]);

  if (!identity) {
    return <Login />;
  }

  return <Wallet />;
}

export default function App() {
  return (
    <main>
      <div className="flex justify-center mb-5">
        <Badge variant="outline">Bitcoin mainnet version</Badge>
      </div>

      <IframeWarning />

      <WalletWarning />

      <AppInner />

      <Toaster />

      <div className="links">
        <a
          href="https://internetcomputer.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/ic.png" alt="Internet Computer Logo" className="w-40" />
        </a>
      </div>
    </main>
  );
}
