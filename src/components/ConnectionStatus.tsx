
import React from 'react';
import { useMemory } from '../contexts/MemoryContext';
import { Badge } from '@/components/ui/badge';

const ConnectionStatus: React.FC = () => {
  const { isConnected, isSimulating } = useMemory();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "secondary"} className="animate-pulse">
        {isConnected ? 'Connected' : 'Demo Mode'}
      </Badge>
      
      {isConnected && isSimulating && (
        <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-500">
          Simulating
        </Badge>
      )}
    </div>
  );
};

export default ConnectionStatus;
