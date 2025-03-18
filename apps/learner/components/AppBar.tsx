"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';

export default function AppBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl text-blue-600">
              Roadmap DAO
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              {isConnected && (
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Dashboard
                </Link>
              )}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center">
            {!isConnected ? (
              <button 
                onClick={connectWallet}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-3">
                  {shortenAddress(address as string)}
                </span>
                <button 
                  onClick={disconnectWallet}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            {isConnected && (
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Dashboard
              </Link>
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-200">
            {!isConnected ? (
              <button 
                onClick={() => {
                  connectWallet();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Connect Wallet
              </button>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {shortenAddress(address as string)}
                </p>
                <button 
                  onClick={() => {
                    disconnectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 