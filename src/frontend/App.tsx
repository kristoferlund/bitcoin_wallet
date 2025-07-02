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
