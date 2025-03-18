"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';

export default function Home() {
  const { isConnected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already connected
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gray-50">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-bold">Expert Roadmap Builder</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create and share your learning roadmaps with the community. Help others learn what you know.
        </p>
        
        <div className="py-12">
          {!isConnected && (
            <div className="flex flex-col items-center">
              <p className="mb-6 text-gray-700">
                Connect your wallet to start creating roadmaps
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Use the button in the top right corner to connect your wallet
              </p>
              <div className="w-20 h-20 relative animate-bounce">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-full h-full text-blue-500"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 15l7-7 7 7" 
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Build Comprehensive Roadmaps</h3>
            <p className="text-gray-600">
              Create detailed learning paths with step-by-step guidance and curated resources for your audience.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Share Your Expertise</h3>
            <p className="text-gray-600">
              Help others learn by sharing your knowledge and guiding them through your personal learning journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}