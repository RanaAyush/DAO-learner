"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';

interface Roadmap {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    _count: {
        enrollments: number;
        steps: number;
    };
}

export default function Dashboard() {
    const { address, isConnected } = useWallet();
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roadmapToDelete, setRoadmapToDelete] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Redirect if not connected
        if (!isConnected) {
            router.push('/');
            return;
        }

        fetchRoadmaps();
    }, [isConnected, router]);

    const fetchRoadmaps = async () => {
        if (!address) return;
        
        try {
            setLoading(true);
            
            const response = await fetch('http://localhost:3001/api/expert/roadmaps', {
                headers: {
                    'wallet-address': address,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setRoadmaps(data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch roadmaps');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteRoadmap = async (id: string) => {
        if (!address) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/expert/roadmap/${id}`, {
                method: 'DELETE',
                headers: {
                    'wallet-address': address,
                },
            });
            
            if (response.ok) {
                // Remove the deleted roadmap from state
                setRoadmaps(roadmaps.filter(roadmap => roadmap.id !== id));
                setIsModalOpen(false);
                setRoadmapToDelete(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete roadmap');
            }
        } catch (err) {
            setError('An unexpected error occurred while deleting');
            console.error(err);
        }
    };

    const totalEnrollments = roadmaps.reduce((sum, roadmap) => 
        sum + roadmap._count.enrollments, 0);

    if (loading) return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Roadmaps</h1>
                <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
            </div>
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Roadmaps</h1>
                <Link
                    href="/roadmaps/create"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create New Roadmap
                </Link>
            </div>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Expert Dashboard</h1>
                <p className="text-gray-600">Manage your learning roadmaps</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button 
                        className="float-right font-bold"
                        onClick={() => setError('')}
                    >
                        &times;
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Roadmaps</h2>
                    <p className="text-3xl">{roadmaps.length}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Enrollments</h2>
                    <p className="text-3xl">{totalEnrollments}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Roadmaps</h2>
                <Link 
                    href="/roadmaps/create"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create New Roadmap
                </Link>
            </div>

            {roadmaps.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <h2 className="text-xl font-semibold mb-3">You haven't created any roadmaps yet</h2>
                    <p className="text-gray-600 mb-6">
                        Create your first roadmap to share your expertise with the community
                    </p>
                    <Link
                        href="/roadmaps/create"
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
                    >
                        Create Your First Roadmap
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((roadmap) => (
                        <div key={roadmap.id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{roadmap.title}</h3>
                                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                                    {roadmap.description}
                                </p>
                                <div className="flex justify-between text-sm text-gray-500 mb-4">
                                    <span>{roadmap._count.steps} steps</span>
                                    <span>{roadmap._count.enrollments} enrollments</span>
                                </div>
                                <div className="flex space-x-2">
                                    <Link
                                        href={`/roadmaps/${roadmap.id}`}
                                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-center text-sm hover:bg-blue-200"
                                    >
                                        Manage
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setRoadmapToDelete(roadmap.id);
                                            setIsModalOpen(true);
                                        }}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Custom Modal - No Dialog Component Required */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete this roadmap? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setRoadmapToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    if (roadmapToDelete) {
                                        deleteRoadmap(roadmapToDelete);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}