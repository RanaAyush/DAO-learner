import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const walletAddress = req.headers['wallet-address'];
      if (!walletAddress) {
        return res.status(401).json({ error: 'No wallet address provided' });
      }
      // Verify wallet signature
      // Add user to request
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid authentication' });
    }
  };
  
  // middleware/expert.ts
  export const expertAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }

      const walletAddress = authHeader.split(' ')[1];
      let user = await client.user.findUnique({
        where: { walletAddress: walletAddress },
        select: { id: true, isExpert: true }
      });

      if (!user) {
        user = await client.user.create({
          data: {
            walletAddress: walletAddress as string,
            isExpert: true
          },
          select: {
            id: true,
            isExpert: true
          }
        });
      }
      
      if (!user.isExpert) {
        return res.status(403).json({ error: 'Expert access required' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Expert verification failed' });
    }
  };
  
  export const learnerAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const walletAddress = req.headers['wallet-address'];
      const user = await client.user.findUnique({
        where: { walletAddress: walletAddress as string },
        select: { id: true, isExpert: true }
      });
      
      if (user?.isExpert) {
        return res.status(403).json({ error: 'Learner access required' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Learner verification failed' });
    }
  };