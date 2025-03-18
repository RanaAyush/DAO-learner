"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../hooks/useWallet';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  roadmapId: string;
  createdAt: string;
  _count: {
    steps: number;
  };
}

export default function Dashboard() {
  const { address, isConnected } = useWallet();
  const [enrollments, setEnrollments] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect if not connected
    if (!isConnected) {
      router.push('/');
      return;
    }

    fetchEnrollments();
  }, [isConnected, router]);

  const fetchEnrollments = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3001/api/learner/enrollments', {
        headers: {
          'wallet-address': address
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch enrollments');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Learning Dashboard</h1>
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
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Learning Dashboard</h1>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Learning Dashboard</h1>
      
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-3">You haven't enrolled in any roadmaps yet</h2>
          <p className="text-gray-600 mb-6">
            Browse available roadmaps and start your learning journey today.
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Explore Roadmaps
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(enrollment => (
            <Link
              href={`/roadmap/${enrollment.roadmapId}`}
              key={enrollment.id}
              className="block bg-white rounded-lg shadow hover:shadow-md transition p-6"
            >
              <h3 className="text-xl font-semibold mb-2">{enrollment.title}</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                {enrollment.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {enrollment._count.steps} steps
                </span>
                <span className="text-sm text-gray-500">
                  Enrolled on {new Date(enrollment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 