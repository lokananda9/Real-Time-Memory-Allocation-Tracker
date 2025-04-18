
import React, { useState } from 'react';
import { useMemory } from '../contexts/MemoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const MemoryControls: React.FC = () => {
  const { isConnected, isSimulating, connect, disconnect, startSimulation, stopSimulation, performOperation } = useMemory();

  const [serverUrl, setServerUrl] = useState('ws://localhost:8765');
  const [processId, setProcessId] = useState(1);
  const [memorySize, setMemorySize] = useState(16);
  const [pageNumber, setPageNumber] = useState(1);

  const handleConnect = () => {
    if (!isConnected) {
      connect(serverUrl);
    } else {
      disconnect();
    }
  };

  const handleAllocate = () => {
    performOperation({
      type: 'allocate',
      processId,
      size: memorySize
    });
  };

  const handleDeallocate = () => {
    performOperation({
      type: 'deallocate',
      processId
    });
  };

  const handleSwapIn = () => {
    performOperation({
      type: 'swapIn',
      pageNumber
    });
  };

  const handleSwapOut = () => {
    performOperation({
      type: 'swapOut',
      pageNumber
    });
  };

  const handleReset = () => {
    performOperation({
      type: 'reset'
    });
  };

  const handleSimulatePageFault = () => {
    performOperation({
      type: 'pageFault',
      pageNumber
    });
  };

  return (
    <Card className="bg-card border-gray-700">
      <CardHeader>
        <CardTitle>Memory Controls</CardTitle>
        <CardDescription>Control memory allocation and connect to backend</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="allocate" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="allocate">Allocate</TabsTrigger>
            <TabsTrigger value="paging">Paging</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="allocate" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="processId">Process ID</Label>
              <Input 
                id="processId" 
                type="number" 
                value={processId} 
                onChange={(e) => setProcessId(Number(e.target.value))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memorySize">Memory Size (MB)</Label>
              <Input 
                id="memorySize" 
                type="number" 
                value={memorySize} 
                onChange={(e) => setMemorySize(Number(e.target.value))} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleAllocate} className="w-full">
                Allocate
              </Button>
              <Button 
                onClick={handleDeallocate} 
                variant="destructive" 
                className="w-full"
              >
                Deallocate
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="paging" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pageNumber">Page Number</Label>
              <Input 
                id="pageNumber" 
                type="number" 
                value={pageNumber} 
                onChange={(e) => setPageNumber(Number(e.target.value))} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleSwapIn} 
                variant="outline"
                className="w-full"
              >
                Swap In
              </Button>
              <Button 
                onClick={handleSwapOut} 
                variant="outline" 
                className="w-full"
              >
                Swap Out
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleSimulatePageFault} 
                variant="secondary"
                className="w-full"
              >
                Simulate Page Fault
              </Button>
              <Button 
                onClick={handleReset} 
                variant="destructive" 
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="connection" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverUrl">WebSocket Server URL</Label>
              <Input 
                id="serverUrl" 
                value={serverUrl} 
                onChange={(e) => setServerUrl(e.target.value)} 
                placeholder="ws://localhost:8765"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleConnect} 
                variant={isConnected ? "destructive" : "default"}
                className="w-full"
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
              
              <Button 
                onClick={isSimulating ? stopSimulation : startSimulation}
                variant={isSimulating ? "secondary" : "outline"}
                className="w-full"
                disabled={!isConnected}
              >
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </Button>
            </div>
            
            <div className="text-sm">
              <p className="mb-1">Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span></p>
              <p className="text-xs text-muted-foreground">
                Note: Without connecting to a C backend, simulated demo mode is used
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MemoryControls;
