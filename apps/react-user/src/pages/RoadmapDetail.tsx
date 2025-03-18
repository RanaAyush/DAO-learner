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
  const { roadmap, loading, error } = useRoadmap(id);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const handleClaimCertificate = async () => {
    if (!id) return;
    
    setClaiming(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const response = await fetch(`http://localhost:3000/v1/api/learner/roadmap/${id}/claim-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Get your auth token from wherever you store it
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setClaimSuccess(`Certificate claimed successfully! Transaction: ${data.txHash}`);
      } else {
        setClaimError(data.error || 'Failed to claim certificate');
      }
    } catch (error) {
      setClaimError('Failed to connect to server');
    } finally {
      setClaiming(false);
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{roadmap.title}</h1>
              <p className="text-gray-600">{roadmap.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Created: {new Date(roadmap.createdAt).toLocaleDateString()}</p>
                <p>Enrollments: {roadmap._count.enrollments}</p>
              </div>
            </div>
            <button
              onClick={handleClaimCertificate}
              disabled={claiming}
              className={`${
                claiming ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
              } text-white px-6 py-3 rounded-lg flex items-center gap-2`}
            >
              {claiming ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Claiming...
                </>
              ) : 'Mark as Complete & Claim Certificate'}
            </button>
          </div>

          {claimError && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
              {claimError}
            </div>
          )}

          {claimSuccess && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
              {claimSuccess}
            </div>
          )}
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
                <h4 className="text-lg font-medium text-gray-900 mb-4">Resources</h4>
                <div className="space-y-4">
                  {step.resources.length === 0 ? (
                    <p className="text-gray-500 italic">No resources available</p>
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
      </div>
    </div>
  );
}