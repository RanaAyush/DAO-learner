import { useConnectors, useAccount, useDisconnect } from 'wagmi';

function Appbar() {
  const connectors = useConnectors();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Expert Roadmaps</h1>
          </div>

          <div className="flex items-center">
            {address ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Connected: {address.slice(0,6)}...{address.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {connectors.map(connector => (
                  <button
                    key={connector.uid}
                    onClick={() => connector.connect()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Connect {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Appbar;