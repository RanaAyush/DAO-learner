"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  creatorAddress: string;
  _count: {
    steps: number;
    enrollments: number;
  };
}

export default function Home() {
  const { isConnected } = useWallet();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/learner/roadmaps');
      
      if (response.ok) {
        const data = await response.json();
        setRoadmaps(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch roadmaps');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching roadmaps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Roadmap DAO Learning Portal</h1>
        <p className="text-gray-600 mb-4">
          Discover expert-curated Web3 learning roadmaps
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Available Roadmaps</h2>
          {isConnected && (
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              My Dashboard
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No roadmaps available yet.</p>
            <p className="text-sm text-gray-500">
              Check back later or visit the expert portal to create a roadmap.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map(roadmap => (
              <Link 
                href={`/roadmap/${roadmap.id}`} 
                key={roadmap.id}
                className="block bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{roadmap.title}</h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {roadmap.description}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{roadmap._count.steps} steps</span>
                  <span>{roadmap._count.enrollments} enrollments</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
