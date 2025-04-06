
import React, { useState } from 'react';
import { useMemory } from '../contexts/MemoryContext';
import MemoryBlock from './MemoryBlock';
import { MemoryBlock as MemoryBlockType } from '../types/memory';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MemoryGrid: React.FC = () => {
  const { blocks } = useMemory();
  const [selectedBlock, setSelectedBlock] = useState<MemoryBlockType | null>(null);
  const [viewMode, setViewMode] = useState<'physical' | 'logical'>('physical');

  const handleBlockClick = (block: MemoryBlockType) => {
    setSelectedBlock(block);
  };

  const closeDialog = () => {
    setSelectedBlock(null);
  };

  // Format address to hexadecimal
  const formatAddress = (address: number) => {
    return `0x${address.toString(16).toUpperCase().padStart(8, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Memory Map</h2>
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'physical' | 'logical')}
          className="w-[300px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="logical">Logical</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="border rounded-lg border-gray-700 p-2 overflow-hidden bg-gray-900">
        <div className="memory-grid overflow-y-auto max-h-[500px]">
          {blocks.map((block) => (
            <MemoryBlock 
              key={block.id} 
              block={block} 
              onClick={handleBlockClick} 
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Memory Block Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected memory block.
            </DialogDescription>
          </DialogHeader>

          {selectedBlock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground">Type</div>
                  <div className="font-medium">{selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground">Address</div>
                  <div className="font-medium">{formatAddress(selectedBlock.address)}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground">Size</div>
                  <div className="font-medium">{selectedBlock.size} MB</div>
                </div>
                
                {selectedBlock.processId !== undefined && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">Process ID</div>
                    <div className="font-medium">{selectedBlock.processId}</div>
                  </div>
                )}
                
                {selectedBlock.pageNumber !== undefined && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">Page Number</div>
                    <div className="font-medium">{selectedBlock.pageNumber}</div>
                  </div>
                )}
                
                {selectedBlock.segmentId && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">Segment ID</div>
                    <div className="font-medium">{selectedBlock.segmentId}</div>
                  </div>
                )}
                
                {selectedBlock.isSwapped !== undefined && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">Swapped</div>
                    <div className="font-medium">{selectedBlock.isSwapped ? 'Yes' : 'No'}</div>
                  </div>
                )}
              </div>
              
              <Button variant="outline" onClick={closeDialog} className="w-full">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoryGrid;
