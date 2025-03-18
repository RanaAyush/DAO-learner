import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RoadmapDetail from './pages/RoadmapDetail';
import CreateRoadmap from './pages/CreateRoadmap';
import { useConnectors, useAddress, WagmiProvider, useAccount, useDisconnect, useReadContract } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { config } from './config';
import Appbar from './components/Appbar';
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>

    <Router>
      <Routes>
        <Route path="/" element={<><Appbar /><LandingPage /></>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expert/roadmaps/create" element={<CreateRoadmap />} />
        <Route path="/expert/roadmaps/:id" element={<RoadmapDetail />} />
      </Routes>
    </Router>
    </QueryClientProvider>
    </WagmiProvider>
  );
}

function ConnectWallet() {
  const connectors = useConnectors();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  if (address) {
    return <div>
      You are connected {address}
      <button onClick={() => { disconnect() }}>
        Disconnect
      </button>

    </div>
  }

  return <div>
    {connectors.map(connector => <button key={connector.uid} onClick={() => connector.connect()}>
      Connect via {connector.name}
    </button>)}
  </div>
}

export default App;