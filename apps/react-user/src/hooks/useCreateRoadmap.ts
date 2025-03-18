import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Roadmap } from './useRoadmaps';

interface CreateRoadmapParams {
  title: string;
  description: string;
}

export function useCreateRoadmap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const createRoadmap = async ({ title, description }: CreateRoadmapParams): Promise<Roadmap | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/v1/api/expert/roadmap', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${address}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create roadmap: ${response.status}`);
      }

      const roadmap = await response.json();
      return roadmap;
    } catch (err) {
      console.error('Error creating roadmap:', err);
      setError(err instanceof Error ? err.message : 'Failed to create roadmap');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRoadmap,
    loading,
    error
  };
} 