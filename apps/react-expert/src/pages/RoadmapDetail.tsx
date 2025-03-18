import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Appbar from '../components/Appbar';
import { useRoadmap } from '../hooks';

// Resource types mapped to icons
const ResourceTypeIcons: Record<string, React.ReactNode> = {
  VIDEO: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg>,
  ARTICLE: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>,
  COURSE: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>,
  PROJECT: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  DOCUMENTATION: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line></svg>,
  OTHER: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
};

export default function RoadmapDetail() {
  const { id } = useParams<{ id: string }>();
  const { roadmap, loading, error, addStep, addResource } = useRoadmap(id);
  
  const [showStepForm, setShowStepForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState<string | null>(null);
  const [newStep, setNewStep] = useState({ title: '', description: '' });
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'VIDEO' as 'VIDEO' | 'ARTICLE' | 'COURSE' | 'PROJECT' | 'DOCUMENTATION' | 'OTHER',
    url: ''
  });
  const [addingStep, setAddingStep] = useState(false);
  const [addingResource, setAddingResource] = useState(false);

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingStep(true);
    
    try {
      await addStep(newStep.title, newStep.description);
      setNewStep({ title: '', description: '' });
      setShowStepForm(false);
    } catch (error) {
      console.error('Error adding step:', error);
    } finally {
      setAddingStep(false);
    }
  };

  const handleAddResource = async (stepId: string) => {
    setAddingResource(true);
    
    try {
      await addResource(stepId, {
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        url: newResource.url
      });
      setNewResource({ 
        title: '', 
        description: '', 
        type: 'VIDEO', 
        url: '' 
      });
      setShowResourceForm(null);
    } catch (error) {
      console.error('Error adding resource:', error);
    } finally {
      setAddingResource(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-red-50 text-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error Loading Roadmap</h2>
            <p>{error || "Roadmap not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{roadmap.title}</h1>
          <p className="text-gray-600">{roadmap.description}</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Created: {new Date(roadmap.createdAt).toLocaleDateString()}</p>
            <p>Enrollments: {roadmap._count.enrollments}</p>
          </div>
        </div>

        <div className="space-y-8">
          {roadmap.steps.map((step, index) => (
            <div key={step.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{step.description}</p>
                </div>
              </div>

              {/* Resources */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Resources</h4>
                  <button
                    onClick={() => setShowResourceForm(step.id)}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 8v8M8 12h8"></path>
                    </svg>
                    Add Resource
                  </button>
                </div>

                {showResourceForm === step.id && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <input
                        type="text"
                        placeholder="Resource Title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={addingResource}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={addingResource}
                      />
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({ 
                          ...newResource, 
                          type: e.target.value as 'VIDEO' | 'ARTICLE' | 'COURSE' | 'PROJECT' | 'DOCUMENTATION' | 'OTHER'
                        })}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={addingResource}
                      >
                        <option value="VIDEO">Video</option>
                        <option value="ARTICLE">Article</option>
                        <option value="COURSE">Course</option>
                        <option value="PROJECT">Project</option>
                        <option value="DOCUMENTATION">Documentation</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <input
                        type="url"
                        placeholder="URL"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={addingResource}
                      />
                      <button
                        onClick={() => handleAddResource(step.id)}
                        className={`${
                          addingResource ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                        } text-white px-4 py-2 rounded-md flex items-center justify-center gap-2`}
                        disabled={addingResource}
                      >
                        {addingResource ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                          </>
                        ) : 'Add Resource'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {step.resources.length === 0 ? (
                    <p className="text-gray-500 italic">No resources added yet</p>
                  ) : (
                    step.resources.map((resource) => (
                      <div key={resource.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-purple-600">
                          {ResourceTypeIcons[resource.type] || ResourceTypeIcons.OTHER}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{resource.title}</h5>
                          <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block"
                          >
                            View Resource
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Step Button */}
        {!showStepForm && (
          <button
            onClick={() => setShowStepForm(true)}
            className="mt-8 flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v8M8 12h8"></path>
            </svg>
            {roadmap.steps.length === 0 ? 'Add your first step' : 'Add another step'}
          </button>
        )}

        {/* Step Form */}
        {showStepForm && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Step</h3>
            <form onSubmit={handleAddStep} className="space-y-4">
              <div>
                <label htmlFor="stepTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Step Title
                </label>
                <input
                  id="stepTitle"
                  type="text"
                  value={newStep.title}
                  onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={addingStep}
                />
              </div>
              <div>
                <label htmlFor="stepDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="stepDescription"
                  value={newStep.description}
                  onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  required
                  disabled={addingStep}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowStepForm(false)}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={addingStep}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${
                    addingStep ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                  } text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                  disabled={addingStep}
                >
                  {addingStep ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : 'Add Step'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}