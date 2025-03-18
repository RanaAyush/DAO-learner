"use client";

import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Store address in localStorage when connected
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem('walletAddress', address);
    } else if (!isConnected) {
      localStorage.removeItem('walletAddress');
    }
  }, [isConnected, address]);

  const connectWallet = async () => {
    try {
      connect({ connector: new MetaMaskConnector() });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnectWallet
  };
} 