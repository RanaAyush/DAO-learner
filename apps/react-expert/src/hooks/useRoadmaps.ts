import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

// Define types based on the Prisma schema
export interface Roadmap {
  id: string;
  title: string;
  description: string;
  expertId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    steps: number;
  };
}

export function useRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const fetchRoadmaps = async () => {
    if (!address) {
      setRoadmaps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get wallet address from the wagmi hook
      const walletAddress = address;
      
      // Call the expert API endpoint
      const response = await fetch('http://localhost:3000/v1/api/expert/roadmaps', {
        headers: {
          'Authorization': `Bearer ${walletAddress}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roadmaps: ${response.status}`);
      }

      const data = await response.json();
      setRoadmaps(data);
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  };

  // Delete a roadmap by ID
  const deleteRoadmap = async (roadmapId: string) => {
    if (!address) return;

    try {
      const response = await fetch(`http://localhost:3001/api/expert/roadmap/${roadmapId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${address}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete roadmap: ${response.status}`);
      }

      // After successful deletion, update the roadmaps list
      setRoadmaps(roadmaps.filter(roadmap => roadmap.id !== roadmapId));
    } catch (err) {
      console.error('Error deleting roadmap:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete roadmap');
      throw err;
    }
  };

  // Fetch roadmaps whenever address changes
  useEffect(() => {
    fetchRoadmaps();
  }, [address]);

  return {
    roadmaps,
    loading,
    error,
    refetch: fetchRoadmaps,
    deleteRoadmap
  };
} 