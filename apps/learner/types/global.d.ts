interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface Ethereum {
  request: (args: RequestArguments) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
}

interface Window {
  ethereum?: Ethereum;
} 