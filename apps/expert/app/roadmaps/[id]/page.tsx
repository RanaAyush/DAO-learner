"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '../../../hooks/useWallet';

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
  createdAt: string;
  steps: Step[];
  _count: {
    enrollments: number;
  };
}

export default function RoadmapDetail({ params }: { params: { id: string } }) {
  const { address, isConnected } = useWallet();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStepModal, setShowStepModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState({ title: '', description: '' });
  const [resourceForm, setResourceForm] = useState({ 
    title: '', 
    description: '', 
    type: 'VIDEO', 
    url: '' 
  });
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    fetchRoadmap();
  }, [params.id, isConnected, router]);

  const fetchRoadmap = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3001/api/expert/roadmap/${params.id}`, {
        headers: {
          'wallet-address': address
        },
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

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/expert/roadmap/${params.id}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'wallet-address': address
        },
        body: JSON.stringify(stepForm),
      });

      if (response.ok) {
        setShowStepModal(false);
        setStepForm({ title: '', description: '' });
        fetchRoadmap(); // Refresh roadmap data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add step');
      }
    } catch (err) {
      setError('An unexpected error occurred while adding a step');
      console.error(err);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStepId || !address) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/expert/step/${activeStepId}/resource`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'wallet-address': address
        },
        body: JSON.stringify(resourceForm),
      });

      if (response.ok) {
        setShowResourceModal(false);
        setResourceForm({ title: '', description: '', type: 'VIDEO', url: '' });
        setActiveStepId(null);
        fetchRoadmap(); // Refresh roadmap data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add resource');
      }
    } catch (err) {
      setError('An unexpected error occurred while adding a resource');
      console.error(err);
    }
  };

  const openResourceModal = (stepId: string) => {
    setActiveStepId(stepId);
    setShowResourceModal(true);
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
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Return to dashboard
          </Link>
        </p>
      </div>
    </div>
  );

  if (!roadmap) return (
    <div className="container mx-auto p-4">
      <div className="text-center">
        <p className="mb-4">Roadmap not found</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Return to dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
        <span className="text-gray-500 text-sm">
          {roadmap._count.enrollments} enrollments
        </span>
      </header>

      <div className="bg-white p-6 rounded shadow mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{roadmap.title}</h1>
        </div>
        <p className="text-gray-700 mb-2">{roadmap.description}</p>
        <div className="text-sm text-gray-500">
          Created on {new Date(roadmap.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Steps</h2>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setShowStepModal(true)}
          >
            Add Step
          </button>
        </div>

        {roadmap.steps.length === 0 ? (
          <div className="bg-blue-50 p-8 text-center rounded">
            <p className="mb-4">This roadmap doesn't have any steps yet.</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setShowStepModal(true)}
            >
              Add Your First Step
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {roadmap.steps.map((step, index) => (
              <div key={step.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {step.title}
                  </h3>
                </div>
                <p className="text-gray-700 mb-4">{step.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Resources</h4>
                    <button 
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      onClick={() => openResourceModal(step.id)}
                    >
                      Add Resource
                    </button>
                  </div>

                  {step.resources.length === 0 ? (
                    <p className="text-sm text-gray-500">No resources added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {step.resources.map((resource) => (
                        <div key={resource.id} className="bg-gray-50 p-3 rounded text-sm">
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Step</h3>
            
            <form onSubmit={handleAddStep}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={stepForm.title}
                  onChange={(e) => setStepForm({...stepForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                  placeholder="e.g., Learn Solidity Basics"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={stepForm.description}
                  onChange={(e) => setStepForm({...stepForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={3}
                  required
                  placeholder="Describe what this step involves..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => setShowStepModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Resource</h3>
            
            <form onSubmit={handleAddResource}>
              <div className="mb-4">
                <label htmlFor="resTitle" className="block text-gray-700 font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="resTitle"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                  placeholder="e.g., Solidity Documentation"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="resDescription" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="resDescription"
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={2}
                  required
                  placeholder="Briefly describe this resource..."
                />
              </div>

              <div className="mb-4">
                <label htmlFor="resType" className="block text-gray-700 font-medium mb-2">
                  Type
                </label>
                <select
                  id="resType"
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({...resourceForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="VIDEO">Video</option>
                  <option value="ARTICLE">Article</option>
                  <option value="COURSE">Course</option>
                  <option value="PROJECT">Project</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="resUrl" className="block text-gray-700 font-medium mb-2">
                  URL
                </label>
                <input
                  type="url"
                  id="resUrl"
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => {
                    setShowResourceModal(false);
                    setActiveStepId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 