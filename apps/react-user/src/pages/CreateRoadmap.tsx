import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Appbar from '../components/Appbar';
import { useCreateRoadmap } from '../hooks';

export default function CreateRoadmap() {
  const navigate = useNavigate();
  const { createRoadmap, loading, error } = useCreateRoadmap();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createRoadmap({
        title: formData.title,
        description: formData.description
      });
      
      if (result) {
        // Navigate to the newly created roadmap
        navigate(`/expert/roadmaps/${result.id}`);
      }
    } catch (err) {
      console.error('Error creating roadmap:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Roadmap</h1>
          
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter roadmap title"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                placeholder="Describe your roadmap"
                required
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${
                  loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                } text-white px-6 py-2 rounded-lg flex items-center gap-2`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Roadmap'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}