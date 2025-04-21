
import React from 'react';
import { MemoryProvider } from '../contexts/MemoryContext';
import MemoryGrid from '../components/MemoryGrid';
import MemoryStats from '../components/MemoryStats';
import MemoryControls from '../components/MemoryControls';
import MemoryLegend from '../components/MemoryLegend';
import ConnectionStatus from '../components/ConnectionStatus';
import BackendConnection from '../components/BackendConnection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTable from '../components/PageTable';
import DiskMemory from '../components/DiskMemory';
import AddressTranslation from '../components/AddressTranslation';

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
            {/* Main content area */}
            <div className="col-span-12 space-y-6">
              {/* Memory visualization tabs */}
              <Tabs defaultValue="physical" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="physical">Physical Memory</TabsTrigger>
                  <TabsTrigger value="logical">Logical Memory</TabsTrigger>
                  <TabsTrigger value="disk">Disk Memory</TabsTrigger>
                </TabsList>
                <TabsContent value="physical">
                  <MemoryGrid viewMode="physical" />
                </TabsContent>
                <TabsContent value="logical">
                  <MemoryGrid viewMode="logical" />
                </TabsContent>
                <TabsContent value="disk">
                  <DiskMemory />
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MemoryStats />
                <div className="space-y-6">
                  <AddressTranslation />
                  <MemoryControls />
                </div>
              </div>
              
              {/* Sidebar moved into main area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PageTable />
                <MemoryLegend />
              </div>
              
              <BackendConnection />
            </div>
          </div>
        </div>
      </div>
    </MemoryProvider>
  );
};

export default Index;
