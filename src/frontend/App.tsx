import Login from './components/login';
import { useInternetIdentity } from 'ic-use-internet-identity';
import Wallet from './components/wallet';
import { Toaster } from './components/ui/toaster';

function AppInner() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return <Login />;
  }

  return <Wallet />;
}

export default function App() {
  return (
    <main>
      <AppInner />
      <Toaster />

      <div className="links">
        <a
          href="https://github.com/kristoferlund/bitcoin_wallet/graphs/contributors"
          target="_blank"
          rel="noreferrer"
        >
          <img src="https://img.shields.io/github/contributors/kristoferlund/bitcoin_wallet.svg?style=for-the-badge" />
        </a>
        <a
          href="https://github.com/kristoferlund/bitcoin_wallet"
          target="_blank"
          rel="noreferrer"
        >
          <img src="https://img.shields.io/github/license/kristoferlund/bitcoin_wallet.svg?style=for-the-badge" />
        </a>
        <a
          href="https://github.com/kristoferlund/bitcoin_wallet/stargazers"
          target="_blank"
          rel="noreferrer"
        >
          <img src="https://img.shields.io/github/stars/kristoferlund/bitcoin_wallet?style=for-the-badge" />
        </a>
      </div>
    </main>
  );
}
