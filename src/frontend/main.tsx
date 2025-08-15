import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { InternetIdentityProvider } from 'ic-use-internet-identity'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { _SERVICE } from "../backend/declarations/backend.did";
import {
  createActorHook,
} from "ic-use-actor";
import {
  canisterId,
  idlFactory,
} from "../backend/declarations/index"

// Mimimize reloading of queries
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryOnMount: false,
      retry: false,
      gcTime: Infinity,
      staleTime: Infinity
    }
  }
});

// Create an actor hook we can use to communicate with the canister backend
export const useBackendActor = createActorHook<_SERVICE>({
  canisterId,
  idlFactory,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider
        loginOptions={{
          identityProvider: process.env.DFX_NETWORK === "local"
            ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
            : "https://identity.ic0.app"
        }}
      >
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </StrictMode>,
)
