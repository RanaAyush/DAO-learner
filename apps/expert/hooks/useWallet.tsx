"use client";

import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWallet() {
  const { address } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Store address in localStorage when connected
  useEffect(() => {
    if (address) {
      localStorage.setItem('walletAddress', address);
    } else  {
      localStorage.removeItem('walletAddress');
    }
  }, [ address]);

  const connectWallet = async () => {
    try {
      // Get the first available connector
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    address,
    connectWallet,
    disconnectWallet
  };
}