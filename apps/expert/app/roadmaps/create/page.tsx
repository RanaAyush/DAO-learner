"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../../hooks/useWallet';

export default function CreateRoadmap() {
  const { address, isConnected } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect if not connected
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Wallet connection required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:3001/api/expert/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'wallet-address': address
        },
        body: JSON.stringify({ title, description })
      });
      
      if (response.ok) {
        const roadmap = await response.json();
        router.push(`/roadmaps/${roadmap.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create roadmap');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="mb-6">
        <Link 
          href="/dashboard"
          className="text-blue-500 hover:underline"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-4">Create New Roadmap</h1>
      </header>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Roadmap Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
              placeholder="e.g., Complete Solidity Developer Guide"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={5}
              required
              placeholder="Describe what learners will achieve by following this roadmap..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !isConnected}
              className={`px-4 py-2 rounded ${
                loading || !isConnected
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {loading ? 'Creating...' : 'Create Roadmap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 