
import React from 'react';
import { MemoryProvider } from '../contexts/MemoryContext';
import MemoryGrid from '../components/MemoryGrid';
import MemoryStats from '../components/MemoryStats';
import MemoryControls from '../components/MemoryControls';
import MemoryLegend from '../components/MemoryLegend';
import ConnectionStatus from '../components/ConnectionStatus';
import BackendConnection from '../components/BackendConnection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index: React.FC = () => {
  return (
    <MemoryProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container px-4 py-8 mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Memory Allocation Tracker</h1>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Real-time visualization of memory allocation, paging, and segmentation</p>
              <ConnectionStatus />
            </div>
          </header>
          
          <div className="grid grid-cols-12 gap-6">
            {/* Main memory visualization */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <MemoryGrid />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MemoryStats />
                <MemoryControls />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Tabs defaultValue="legend" className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="legend">Legend</TabsTrigger>
                  <TabsTrigger value="backend">Backend</TabsTrigger>
                </TabsList>
                <TabsContent value="legend">
                  <MemoryLegend />
                </TabsContent>
                <TabsContent value="backend">
                  <BackendConnection />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MemoryProvider>
  );
};

export default Index;
