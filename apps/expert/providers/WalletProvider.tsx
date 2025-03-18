"use client";

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {  WagmiProvider, createConfig } from 'wagmi';
import { config } from './config';

// Configure chains & providers




// Create a query client
const queryClient = new QueryClient();

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Wait until after client-side hydration to mount the provider
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 