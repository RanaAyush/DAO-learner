"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  order: number;
  resources: Resource[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  creatorAddress: string;
  createdAt: string;
  steps: Step[];
  isEnrolled: boolean;
  _count: {
    enrollments: number;
  };
}

export default function RoadmapDetail({ params }: { params: { id: string } }) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    setWalletAddress(storedWalletAddress);
    
    fetchRoadmap();
  }, [params.id]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const walletAddress = localStorage.getItem('walletAddress');
      
      const headers: HeadersInit = {};
      if (walletAddress) {
        headers['wallet-address'] = walletAddress;
      }
      
      const response = await fetch(`http://localhost:3001/api/learner/roadmap/${params.id}`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoadmap(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch roadmap');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching roadmap data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!walletAddress) {
      // Prompt user to connect wallet
      alert('Please connect your wallet to enroll');
      return;
    }

    try {
      setEnrolling(true);
      
      const response = await fetch(`http://localhost:3001/api/learner/roadmap/${params.id}/enroll`, {
        method: 'POST',
        headers: {
          'wallet-address': walletAddress,
        },
      });
      
      if (response.ok) {
        // Refetch roadmap data to update enrollment status
        fetchRoadmap();
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to enroll in roadmap');
      }
    } catch (err) {
      setError('An unexpected error occurred while enrolling');
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <p className="mt-2">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to home
          </Link>
        </p>
      </div>
    </div>
  );

  if (!roadmap) return (
    <div className="container mx-auto p-4">
      <div className="text-center">
        <p className="mb-4">Roadmap not found</p>
        <Link href="/" className="text-blue-500 hover:underline">
          Return to home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
        <span className="text-gray-500 text-sm">
          {roadmap._count.enrollments} enrollments
        </span>
      </header>

      <div className="bg-white p-6 rounded shadow mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{roadmap.title}</h1>
        </div>
        <p className="text-gray-700 mb-4">{roadmap.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Created on {new Date(roadmap.createdAt).toLocaleDateString()}
          </div>
          {roadmap.isEnrolled ? (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded">
              Enrolled
            </span>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling || !walletAddress}
              className={`px-6 py-2 rounded transition ${
                walletAddress 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {enrolling ? 'Enrolling...' : walletAddress ? 'Enroll Now' : 'Connect wallet to enroll'}
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Learning Path</h2>

        {roadmap.steps.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded">
            <p>No steps have been added to this roadmap yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roadmap.steps.map((step, index) => (
              <div key={step.id} className="bg-white p-5 rounded shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-700 mb-4">{step.description}</p>
                    
                    {step.resources.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Learning Resources</h4>
                        <div className="space-y-2">
                          {step.resources.map((resource) => (
                            <div key={resource.id} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between">
                                <span className="font-medium">{resource.title}</span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  {resource.type}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 text-xs hover:underline mt-1 block"
                              >
                                {resource.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 