
import React from 'react';
import { useMemory } from '../contexts/MemoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const MemoryStats: React.FC = () => {
  const { stats } = useMemory();
  
  // Calculate percentages for progress bars
  const usedPercentage = (stats.usedMemory / stats.totalMemory) * 100;
  const kernelPercentage = (stats.kernelMemory / stats.totalMemory) * 100;
  const systemPercentage = (stats.systemMemory / stats.totalMemory) * 100;
  const pageSwappedPercentage = stats.totalPages > 0 
    ? (stats.swappedPages / stats.totalPages) * 100 
    : 0;
  
  return (
    <Card className="bg-card border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle>Memory Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used Memory</span>
            <span>{stats.usedMemory} / {stats.totalMemory} MB ({usedPercentage.toFixed(1)}%)</span>
          </div>
          <Progress value={usedPercentage} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Free Memory</span>
            <span>{stats.freeMemory} / {stats.totalMemory} MB</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Kernel Memory</span>
            <span>{stats.kernelMemory} MB ({kernelPercentage.toFixed(1)}%)</span>
          </div>
          <Progress value={kernelPercentage} className="h-2 bg-gray-700">
            <div className="h-full bg-memory-kernel rounded-full" style={{ width: `${kernelPercentage}%` }} />
          </Progress>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>System Memory</span>
            <span>{stats.systemMemory} MB ({systemPercentage.toFixed(1)}%)</span>
          </div>
          <Progress value={systemPercentage} className="h-2 bg-gray-700">
            <div className="h-full bg-memory-system rounded-full" style={{ width: `${systemPercentage}%` }} />
          </Progress>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-1">Page Size</div>
            <div>{stats.pageSize} MB</div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Total Pages</div>
            <div>{stats.totalPages}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Used Pages</div>
            <div>{stats.usedPages} / {stats.totalPages}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Swapped Pages</div>
            <div>{stats.swappedPages}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Pages Swapped</span>
            <span>{stats.swappedPages} / {stats.totalPages}</span>
          </div>
          <Progress value={pageSwappedPercentage} className="h-2 bg-gray-700">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pageSwappedPercentage}%` }} />
          </Progress>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryStats;
