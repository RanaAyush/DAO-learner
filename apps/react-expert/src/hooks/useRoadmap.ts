import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Roadmap } from './useRoadmaps';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'ARTICLE' | 'COURSE' | 'PROJECT' | 'DOCUMENTATION' | 'OTHER';
  url: string;
  stepId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  order: number;
  roadmapId: string;
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapDetail extends Omit<Roadmap, '_count'> {
  steps: Step[];
  _count: {
    enrollments: number;
  };
}

export function useRoadmap(roadmapId: string | undefined) {
  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const fetchRoadmap = async () => {
    if (!address || !roadmapId) {
      setRoadmap(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/v1/api/expert/roadmap/${roadmapId}`, {
        headers: {
          'Authorization': `Bearer ${address}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roadmap: ${response.status}`);
      }

      const data = await response.json();
      setRoadmap(data);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roadmap');
    } finally {
      setLoading(false);
    }
  };

  // Add a step to the roadmap
  const addStep = async (title: string, description: string) => {
    if (!address || !roadmapId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/expert/roadmap/${roadmapId}/step`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${address}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        throw new Error(`Failed to add step: ${response.status}`);
      }

      const newStep = await response.json();
      
      // Update the roadmap state with the new step
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          steps: [...roadmap.steps, newStep]
        });
      }
      
      return newStep;
    } catch (err) {
      console.error('Error adding step:', err);
      setError(err instanceof Error ? err.message : 'Failed to add step');
      throw err;
    }
  };

  // Add a resource to a step
  const addResource = async (stepId: string, resourceData: {
    title: string;
    description: string;
    type: 'VIDEO' | 'ARTICLE' | 'COURSE' | 'PROJECT' | 'DOCUMENTATION' | 'OTHER';
    url: string;
  }) => {
    if (!address || !roadmapId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/expert/step/${stepId}/resource`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${address}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add resource: ${response.status}`);
      }

      const newResource = await response.json();
      
      // Update the roadmap state with the new resource
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          steps: roadmap.steps.map(step => 
            step.id === stepId 
              ? { ...step, resources: [...step.resources, newResource] }
              : step
          )
        });
      }
      
      return newResource;
    } catch (err) {
      console.error('Error adding resource:', err);
      setError(err instanceof Error ? err.message : 'Failed to add resource');
      throw err;
    }
  };

  // Update a step
  const updateStep = async (stepId: string, data: { title?: string; description?: string }) => {
    if (!address || !roadmapId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/expert/step/${stepId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${address}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update step: ${response.status}`);
      }

      const updatedStep = await response.json();
      
      // Update the roadmap state with the updated step
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          steps: roadmap.steps.map(step => 
            step.id === stepId ? updatedStep : step
          )
        });
      }
      
      return updatedStep;
    } catch (err) {
      console.error('Error updating step:', err);
      setError(err instanceof Error ? err.message : 'Failed to update step');
      throw err;
    }
  };

  // Delete a step
  const deleteStep = async (stepId: string) => {
    if (!address || !roadmapId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/expert/step/${stepId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${address}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete step: ${response.status}`);
      }
      
      // Update the roadmap state by removing the deleted step
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          steps: roadmap.steps.filter(step => step.id !== stepId)
        });
      }
    } catch (err) {
      console.error('Error deleting step:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete step');
      throw err;
    }
  };

  // Fetch roadmap whenever address or roadmapId changes
  useEffect(() => {
    fetchRoadmap();
  }, [address, roadmapId]);

  return {
    roadmap,
    loading,
    error,
    refetch: fetchRoadmap,
    addStep,
    updateStep,
    deleteStep,
    addResource
  };
} 