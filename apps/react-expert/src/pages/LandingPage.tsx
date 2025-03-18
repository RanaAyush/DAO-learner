import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, BookOpen, Target } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Create Expert Roadmaps
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Share your expertise with the Web3 community. Create detailed roadmaps with steps and resources to guide others on their journey.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all flex items-center gap-2 mx-auto"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <Compass className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-purple-200">Create comprehensive roadmaps with detailed steps and resources for the community.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <BookOpen className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Curated Resources</h3>
            <p className="text-purple-200">Add valuable resources to each step to provide in-depth learning materials.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <Target className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Clear Progress</h3>
            <p className="text-purple-200">Track progress through well-defined steps and milestones.</p>
          </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=2000&q=80"
            alt="Web3 Development"
            className="w-full h-96 object-cover"
          />
        </div>
      </div>
    </div>
  );
}