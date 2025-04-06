
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MemoryLegend: React.FC = () => {
  const legendItems = [
    { color: 'bg-memory-free', label: 'Free Memory', description: 'Unallocated memory available for use' },
    { color: 'bg-memory-used', label: 'Used Memory', description: 'Memory in use by processes' },
    { color: 'bg-memory-allocated', label: 'Allocated', description: 'Specifically allocated blocks' },
    { color: 'bg-memory-page', label: 'Page', description: 'Memory page unit' },
    { color: 'bg-memory-segment', label: 'Segment', description: 'Memory segment' },
    { color: 'bg-memory-kernel', label: 'Kernel', description: 'Memory used by the kernel' },
    { color: 'bg-memory-system', label: 'System', description: 'Reserved for system operations' }
  ];

  return (
    <Card className="bg-card border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle>Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`${item.color} w-4 h-4 rounded-sm`}></div>
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MemoryLegend;
