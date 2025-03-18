import { Router, Request, Response } from "express";
import { expertAuth } from "../middleware";
import { PrismaClient } from "@prisma/client";
import { ethers } from 'ethers';

const client = new PrismaClient();

const router: Router = Router();

// Contract details
const CONTRACT_ABI = [
  "function mintRoadmapOwnership(address expert, string calldata roadmapId, string calldata metadataURI) external returns (uint256)"
];
const CONTRACT_ADDRESS = "0x17189fCDDafCDD6f7667841d8d99525b5449b68D"; // Replace with your contract address
const RPC_URL = "https://rpc.open-campus-codex.gelato.digital"; // Replace with your RPC URL

// Create a new roadmap (basic details only)
//@ts-ignore
router.post("/roadmap", expertAuth, async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        
        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }
        
        // Create the roadmap with basic details only
        const roadmap = await client.roadmap.create({
            data: {
                title,
                description,
                expertId: req.user.id
            }
        });
        
        // Get expert's wallet address from the database
        const expert = await client.user.findUnique({
            where: { id: req.user.id },
            select: { walletAddress: true }
        });
        
        if (expert && expert.walletAddress) {
            try {
                // Simple direct minting of NFT for the expert
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                
                // Get private key from environment variable
                const privateKey = process.env.NFT_MINTER_PRIVATE_KEY || "5d2a5f35e52604b73365ad189eb3cda18c676436a4eb321a4ac070d150a36ea2";
                if (!privateKey) {
                    console.error("Warning: NFT_MINTER_PRIVATE_KEY not set in environment variables");
                    return res.status(201).json(roadmap);
                }
                
                const wallet = new ethers.Wallet(privateKey, provider);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
                
                // Simple metadata for the prototype
                const metadataURI = `ipfs://roadmap/${roadmap.id}`;
                
                // Call the contract to mint the NFT
                const tx = await contract.mintRoadmapOwnership?.(
                    expert.walletAddress,
                    roadmap.id,
                    metadataURI
                );
                
                if (!tx) {
                    console.error("Contract method mintRoadmapOwnership not found");
                    return res.status(201).json(roadmap);
                }
                
                // Wait for transaction to be confirmed
                const receipt = await tx.wait();
                const txHash = receipt.hash;
                
                console.log(`NFT minted successfully for roadmap ${roadmap.id}`);
                console.log(`Transaction hash: ${txHash}`);
                
                // Return the roadmap with the transaction hash
                return res.status(201).json({
                    ...roadmap,
                    nftTxHash: txHash
                });
            } catch (nftError) {
                // Log NFT minting error but don't fail the request
                console.error("Error minting NFT:", nftError);
                // We'll still return success for the roadmap creation
            }
        }
        
        // If we reach here, either there was no wallet address or NFT minting failed
        // but we still created the roadmap successfully
        res.status(201).json(roadmap);
    } catch (error) {
        console.error("Error creating roadmap:", error);
        res.status(500).json({ error: "Failed to create roadmap" });
    }
});

// Get all roadmaps for the current expert
//@ts-ignore
router.get("/roadmaps", expertAuth, async (req: Request, res: Response) => {
    try {
        console.log("1");
        const roadmaps = await client.roadmap.findMany({
            where: {
                expertId: req.user.id
            },
            include: {
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
        console.log("2");
        
        res.status(200).json(roadmaps);
    } catch (error) {
        console.error("Error fetching roadmaps:", error);
        res.status(500).json({ error: "Failed to fetch roadmaps" });
    }
});

// Get a single roadmap with all details
//@ts-ignore
router.get("/roadmap/:id", expertAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const roadmap = await client.roadmap.findUnique({
            where: {
                id,
                expertId: req.user.id
            },
            include: {
                steps: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        resources: true
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

// Update a roadmap's basic details
//@ts-ignore
router.put("/roadmap/:id", expertAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        
        // Check if roadmap exists and belongs to this expert
        const existingRoadmap = await client.roadmap.findUnique({
            where: {
                id,
                expertId: req.user.id
            }
        });
        
        if (!existingRoadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }
        
        // Update basic roadmap details
        const updatedRoadmap = await client.roadmap.update({
            where: { id },
            data: {
                title,
                description
            }
        });
        
        res.status(200).json(updatedRoadmap);
    } catch (error) {
        console.error("Error updating roadmap:", error);
        res.status(500).json({ error: "Failed to update roadmap" });
    }
});

// Delete a roadmap
//@ts-ignore
router.delete("/roadmap/:id", expertAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Check if roadmap exists and belongs to this expert
        const existingRoadmap = await client.roadmap.findUnique({
            where: {
                id,
                expertId: req.user.id
            }
        });
        
        if (!existingRoadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }
        
        // Delete the roadmap
        await client.roadmap.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting roadmap:", error);
        res.status(500).json({ error: "Failed to delete roadmap" });
    }
});

// Add step to a roadmap (without resources)
//@ts-ignore
router.post("/roadmap/:id/step", expertAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        
        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ error: "Step title and description are required" });
        }
        
        // Check if roadmap exists and belongs to this expert
        const existingRoadmap = await client.roadmap.findUnique({
            where: {
                id,
                expertId: req.user.id
            },
            include: {
                steps: true
            }
        });
        
        if (!existingRoadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }
        
        // Get the next order number
        const nextOrder = existingRoadmap.steps.length;
        
        // Create the step (without resources)
        const step = await client.step.create({
            data: {
                title,
                description,
                order: nextOrder,
                roadmap: {
                    connect: {
                        id
                    }
                }
            }
        });
        
        res.status(201).json(step);
    } catch (error) {
        console.error("Error adding step:", error);
        res.status(500).json({ error: "Failed to add step" });
    }
});

// Update a step
//@ts-ignore
router.put("/step/:id", expertAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        
        // Check if step exists and belongs to this expert's roadmap
        const existingStep = await client.step.findUnique({
            where: { id },
            include: {
                roadmap: true
            }
        });
        
        if (!existingStep || existingStep.roadmap.expertId !== req.user.id) {
            return res.status(404).json({ error: "Step not found" });
        }
        
        // Update the step
        const updatedStep = await client.step.update({
            where: { id },
            data: {
                title,
                description
            },
            include: {
                resources: true
            }
        });
        
        res.status(200).json(updatedStep);
    } catch (error) {
        console.error("Error updating step:", error);
        res.status(500).json({ error: "Failed to update step" });
    }
});

// Delete a step
//@ts-ignore
router.delete("/step/:id", expertAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Check if step exists and belongs to this expert's roadmap
        const existingStep = await client.step.findUnique({
            where: { id },
            include: {
                roadmap: true
            }
        });
        
        if (!existingStep || existingStep.roadmap.expertId !== req.user.id) {
            return res.status(404).json({ error: "Step not found" });
        }
        
        // Delete the step
        await client.step.delete({
            where: { id }
        });
        
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting step:", error);
        res.status(500).json({ error: "Failed to delete step" });
    }
});

// Add resource to a step
//@ts-ignore
router.post("/step/:id/resource", expertAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, type, url } = req.body;
        
        // Validate required fields
        if (!title || !description || !type || !url) {
            return res.status(400).json({ error: "Resource title, description, type, and URL are required" });
        }
        
        // Check if step exists and belongs to this expert's roadmap
        const existingStep = await client.step.findUnique({
            where: { id },
            include: {
                roadmap: true
            }
        });
        
        if (!existingStep || existingStep.roadmap.expertId !== req.user.id) {
            return res.status(404).json({ error: "Step not found" });
        }
        
        // Create the resource
        const resource = await client.resource.create({
            data: {
                title,
                description,
                type,
                url,
                step: {
                    connect: {
                        id
                    }
                }
            }
        });
        
        res.status(201).json(resource);
    } catch (error) {
        console.error("Error adding resource:", error);
        res.status(500).json({ error: "Failed to add resource" });
    }
});

export default router;
