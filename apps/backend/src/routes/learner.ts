import { Router, Request, Response } from "express";
import { learnerAuth } from "../middleware";
import { PrismaClient } from "@prisma/client";
import { web3Service } from "../services/web3Service";

const client = new PrismaClient();

const router: Router = Router();

// Browse all available roadmaps
router.get("/roadmaps", async (req: Request, res: Response) => {
    try {
        // Get all public roadmaps with some metadata
        const roadmaps = await client.roadmap.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                expert: {
                    select: {
                        id: true,
                        walletAddress: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true,
                        steps: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.status(200).json(roadmaps);
    } catch (error) {
        console.error("Error fetching roadmaps:", error);
        res.status(500).json({ error: "Failed to fetch roadmaps" });
    }
});

// View a specific roadmap with details
//@ts-ignore
router.get("/roadmap/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const roadmap = await client.roadmap.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        resources: true
                    }
                },
                expert: {
                    select: {
                        id: true,
                        walletAddress: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            }
        });
        
        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }
        
        res.status(200).json(roadmap);
    } catch (error) {
        console.error("Error fetching roadmap:", error);
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
});

// Enroll in a roadmap
//@ts-ignore
router.post("/roadmap/:id/enroll", learnerAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Check if roadmap exists
        const roadmap = await client.roadmap.findUnique({
            where: { id }
        });
        
        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }
        
        // Check if already enrolled
        const existingEnrollment = await client.enrollment.findFirst({
            where: {
                roadmapId: id,
                learnerId: req.user.id
            }
        });
        
        if (existingEnrollment) {
            return res.status(400).json({ error: "Already enrolled in this roadmap" });
        }
        
        // Create enrollment using connect syntax to fix TypeScript error
        const enrollment = await client.enrollment.create({
            data: {
                progress: 0,
                roadmap: {
                    connect: { id }
                },
                learner: {
                    connect: { id: req.user.id }
                }
            }
        });
        
        res.status(201).json(enrollment);
    } catch (error) {
        console.error("Error enrolling in roadmap:", error);
        res.status(500).json({ error: "Failed to enroll in roadmap" });
    }
});

// Get user's enrollments
//@ts-ignore
router.get("/enrollments", learnerAuth, async (req: Request, res: Response) => {
    try {
        const enrollments = await client.enrollment.findMany({
            where: {
                learnerId: req.user.id
            },
            include: {
                roadmap: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        expert: {
                            select: {
                                id: true,
                                walletAddress: true
                            }
                        },
                        _count: {
                            select: {
                                steps: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        
        res.status(200).json(enrollments);
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        res.status(500).json({ error: "Failed to fetch enrollments" });
    }
});

// Update enrollment progress
//@ts-ignore
router.put("/enrollment/:id/progress", learnerAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;
        
        // Validate progress
        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
            return res.status(400).json({ error: "Progress must be a number between 0 and 100" });
        }
        
        // Check if enrollment exists and belongs to user
        const enrollment = await client.enrollment.findUnique({
            where: {
                id,
                learnerId: req.user.id
            },
            include: {
                roadmap: true
            }
        });
        
        if (!enrollment) {
            return res.status(404).json({ error: "Enrollment not found" });
        }
        
        // Update progress
        const updatedEnrollment = await client.enrollment.update({
            where: { id },
            data: { progress }
        });
        
        res.status(200).json(updatedEnrollment);
    } catch (error) {
        console.error("Error updating progress:", error);
        res.status(500).json({ error: "Failed to update progress" });
    }
});

// Claim a completion certificate NFT
//@ts-ignore
router.post("/roadmap/:id/claim-certificate", learnerAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // roadmapId
        
        // Get the enrollment to check progress
        const enrollment = await client.enrollment.findFirst({
            where: {
                roadmapId: id,
                learnerId: req.user.id
            }
        });
        
        // Check if learner is enrolled and has 100% progress
        if (!enrollment) {
            return res.status(404).json({ error: "You are not enrolled in this roadmap" });
        }
        
        if (enrollment.progress < 100) {
            return res.status(400).json({ 
                error: "You must complete 100% of the roadmap to claim a certificate",
                currentProgress: enrollment.progress
            });
        }
        
        // Get learner's wallet address
        const learner = await client.user.findUnique({
            where: { id: req.user.id },
            select: { walletAddress: true }
        });
        
        if (!learner || !learner.walletAddress) {
            return res.status(400).json({ error: "No wallet address found for your account" });
        }
        
        // Check if learner already has a certificate for this roadmap
        const alreadyCompleted = await web3Service.hasCompletedRoadmap(
            learner.walletAddress as string,
            id
        );
        
        if (alreadyCompleted) {
            return res.status(400).json({ error: "You have already claimed a certificate for this roadmap" });
        }
        
        // Mint NFT certificate
        try {
            const txHash = await web3Service.mintCompletionCertificate(
                learner.walletAddress as string,
                id
            );
            
            if (txHash) {
                console.log(`Completion certificate NFT minted for roadmap ${id} by learner ${req.user.id}`);
                
                // You could store the certificate info in your database
                // For example, create a new model for certificates
                
                return res.status(200).json({
                    message: "Certificate claimed successfully",
                    txHash: txHash,
                    roadmapId: id
                });
            } else {
                return res.status(500).json({ error: "Failed to mint certificate NFT" });
            }
        } catch (nftError) {
            console.error("Error minting certificate NFT:", nftError);
            return res.status(500).json({ error: "Error creating certificate" });
        }
    } catch (error) {
        console.error("Error claiming certificate:", error);
        res.status(500).json({ error: "Failed to claim certificate" });
    }
});

export default router;
