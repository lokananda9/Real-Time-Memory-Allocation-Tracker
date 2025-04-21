
import React from 'react';
import { useMemory } from '../contexts/MemoryContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DiskMemory: React.FC = () => {
  const { stats, diskBlocks, performOperation } = useMemory();
  
  // Calculate disk usage percentage
  const diskUsagePercentage = stats.diskSize > 0 
    ? (stats.usedDiskSpace / stats.diskSize) * 100 
    : 0;
  
  // Function to simulate disk operations
  const handleSimulateSwapIn = () => {
    // Find a page that is on disk
    const swappedPages = diskBlocks.filter(block => block.type === 'disk');
    if (swappedPages.length > 0) {
      const randomIndex = Math.floor(Math.random() * swappedPages.length);
      const pageToSwapIn = swappedPages[randomIndex];
      
      performOperation({
        type: 'swapIn',
        pageNumber: pageToSwapIn.pageNumber
      });
      
      toast.info(`Swapping in page ${pageToSwapIn.pageNumber}`);
    } else {
      toast.warning('No pages available on disk to swap in');
    }
  };
  
  const handleSimulateSwapOut = () => {
    performOperation({
      type: 'swapOut',
      // Use a random page number between 0-10
      pageNumber: Math.floor(Math.random() * 10)
    });
    toast.info('Simulating swap out operation');
  };
  
  return (
    <Card className="bg-card border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive size={18} />
          Disk Memory (Swap Space)
        </CardTitle>
        <CardDescription>
          Pages swapped to disk when physical memory is full
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Disk Usage</span>
            <span>{stats.usedDiskSpace} / {stats.diskSize} MB ({diskUsagePercentage.toFixed(1)}%)</span>
          </div>
          <Progress value={diskUsagePercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm font-medium mb-1">Swapped Pages</div>
            <div>{stats.swappedPages}</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Page Faults</div>
            <div>{stats.pageFaults}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleSimulateSwapIn}>
            Swap In Random Page
          </Button>
          <Button variant="outline" size="sm" onClick={handleSimulateSwapOut}>
            Swap Out Random Page
          </Button>
        </div>
        
        <div className="border border-gray-700 rounded-md p-2 bg-gray-900">
          <div className="text-sm font-medium mb-2">Disk Blocks</div>
          <div className="grid grid-cols-10 gap-1">
            {diskBlocks.map((block) => (
              <div 
                key={block.id} 
                className={`h-6 rounded-sm ${block.type === 'free' ? 'bg-gray-800' : 'bg-orange-800'}`}
                title={`Block ${block.id}: ${block.type === 'free' ? 'Free' : 'Used'}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiskMemory;
