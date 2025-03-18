import { ethers } from 'ethers';

// Replace with your actual contract ABI and address after deployment
const ROADMAP_NFT_ABI = [
  "function mintRoadmapOwnership(address expert, string calldata roadmapId, string calldata metadataURI) external returns (uint256)",
  "function mintCompletionCertificate(address learner, string calldata roadmapId, string calldata metadataURI) external returns (uint256)",
  "function claimCompletionCertificate(string calldata roadmapId, string calldata metadataURI) external returns (uint256)",
  "function hasCompletedRoadmap(string calldata roadmapId, address learner) external view returns (bool)"
];

const ROADMAP_NFT_ADDRESS = "0xYourContractAddressHere"; // Replace with your deployed contract address
const RPC_URL = "0x17189fCDDafCDD6f7667841d8d99525b5449b68D"; // Replace with your educhain RPC URL

class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private nftContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Load private key from environment variable (more secure)
    const privateKey = process.env.MINTER_PRIVATE_KEY || "";
    if (!privateKey) {
      console.error("Warning: MINTER_PRIVATE_KEY environment variable not set!");
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.nftContract = new ethers.Contract(ROADMAP_NFT_ADDRESS, ROADMAP_NFT_ABI, this.wallet);
  }

  async mintRoadmapNFT(expertAddress: string, roadmapId: string): Promise<string | null> {
    try {
      // Simple metadata for the prototype
      const metadataURI = `ipfs://roadmap/${roadmapId}`;
      
      // Call the smart contract function
      const tx = await this.nftContract.mintRoadmapOwnership(
        expertAddress,
        roadmapId,
        metadataURI
      );

      // Wait for transaction to be confirmed
      const receipt = await tx.wait();
      
      console.log(`NFT minted for roadmap ${roadmapId} to expert ${expertAddress}`);
      console.log(`Transaction hash: ${receipt.hash}`);
      
      return receipt.hash;
    } catch (error) {
      console.error("Error minting roadmap NFT:", error);
      return null;
    }
  }

  async mintCompletionCertificate(learnerAddress: string, roadmapId: string): Promise<string | null> {
    try {
      // Simple metadata for the prototype
      const metadataURI = `ipfs://completion/${roadmapId}/${learnerAddress}`;
      
      // Call the smart contract function
      const tx = await this.nftContract.mintCompletionCertificate(
        learnerAddress,
        roadmapId,
        metadataURI
      );

      // Wait for transaction to be confirmed
      const receipt = await tx.wait();
      
      console.log(`Completion certificate minted for roadmap ${roadmapId} to learner ${learnerAddress}`);
      console.log(`Transaction hash: ${receipt.hash}`);
      
      return receipt.hash;
    } catch (error) {
      console.error("Error minting completion certificate:", error);
      return null;
    }
  }

  async hasCompletedRoadmap(learnerAddress: string, roadmapId: string): Promise<boolean> {
    try {
      return await this.nftContract.hasCompletedRoadmap(roadmapId, learnerAddress);
    } catch (error) {
      console.error("Error checking completion status:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const web3Service = new Web3Service(); 