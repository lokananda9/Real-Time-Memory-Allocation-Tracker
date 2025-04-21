
import React from 'react';
import { useMemory } from '../contexts/MemoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TLBEntry } from '../types/memory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, FileX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TLB: React.FC = () => {
  const { tlbEntries, stats } = useMemory();
  
  // Format the TLB hit rate
  const hitRate = stats.tlbHits + stats.tlbMisses > 0 
    ? ((stats.tlbHits / (stats.tlbHits + stats.tlbMisses)) * 100).toFixed(1) 
    : "0.0";
  
  // Helper function to determine badge variant
  const getBadgeVariant = (rate: number) => {
    if (rate > 80) return "default";
    if (rate > 50) return "secondary";
    return "destructive";
  };
  
  return (
    <Card className="bg-card border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Translation Lookaside Buffer (TLB)</CardTitle>
          <Badge variant={getBadgeVariant(parseFloat(hitRate))} className="ml-2">
            {hitRate}% hit rate
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-900 z-10">
              <TableRow>
                <TableHead className="w-[80px]">Process ID</TableHead>
                <TableHead className="w-[60px]">VPN</TableHead>
                <TableHead className="w-[60px]">PPN</TableHead>
                <TableHead className="w-[60px]">Valid</TableHead>
                <TableHead className="w-[120px]">Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tlbEntries.length > 0 ? (
                tlbEntries.map((entry: TLBEntry, index) => (
                  <TableRow key={`tlb-entry-${index}`} className={!entry.valid ? "opacity-60" : ""}>
                    <TableCell className="font-mono">{entry.processId}</TableCell>
                    <TableCell className="font-mono">{entry.vpn}</TableCell>
                    <TableCell className="font-mono">{entry.ppn}</TableCell>
                    <TableCell>
                      {entry.valid ? 
                        <Check size={16} className="text-green-500" /> : 
                        <FileX size={16} className="text-red-500" />
                      }
                    </TableCell>
                    <TableCell className="text-xs">
                      {entry.lastUsed ? formatDistanceToNow(entry.lastUsed, { addSuffix: true }) : "never"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    TLB is empty
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TLB;
