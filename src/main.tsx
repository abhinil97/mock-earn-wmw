import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus by default
      retry: 1, // Retry failed requests once
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={true}
        onError={(error) => {
          console.log('Wallet adapter error:', error)
        }}
      >
        <App />
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  </StrictMode>,
)

