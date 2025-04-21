
import React from 'react';
import { useMemory } from '../contexts/MemoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTableEntry } from '../types/memory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileX, Check, HardDrive } from 'lucide-react';

const PageTable: React.FC = () => {
  const { pageTable, currentProcessId } = useMemory();
  
  return (
    <Card className="bg-card border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Page Table (Process {currentProcessId})</CardTitle>
          <Badge variant="outline" className="ml-2">{pageTable.length} entries</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-900 z-10">
              <TableRow>
                <TableHead className="w-[60px]">VPN</TableHead>
                <TableHead className="w-[60px]">PPN</TableHead>
                <TableHead className="w-[60px]">Valid</TableHead>
                <TableHead className="w-[60px]">Dirty</TableHead>
                <TableHead className="w-[80px]">Referenced</TableHead>
                <TableHead className="w-[80px]">Location</TableHead>
                <TableHead className="w-[80px]">Protection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageTable.length > 0 ? (
                pageTable.map((entry: PageTableEntry, index) => (
                  <TableRow key={`page-entry-${index}`} className={!entry.valid ? "opacity-60" : ""}>
                    <TableCell className="font-mono">{entry.vpn}</TableCell>
                    <TableCell className="font-mono">{entry.ppn}</TableCell>
                    <TableCell>
                      {entry.valid ? 
                        <Check size={16} className="text-green-500" /> : 
                        <FileX size={16} className="text-red-500" />
                      }
                    </TableCell>
                    <TableCell>
                      {entry.dirty ? 
                        <Check size={16} className="text-yellow-500" /> : 
                        <span className="text-gray-500">-</span>
                      }
                    </TableCell>
                    <TableCell>
                      {entry.referenced ? 
                        <Check size={16} className="text-blue-500" /> : 
                        <span className="text-gray-500">-</span>
                      }
                    </TableCell>
                    <TableCell>
                      {entry.onDisk ? (
                        <div className="flex items-center">
                          <HardDrive size={14} className="mr-1 text-orange-400" />
                          <span className="text-orange-400">Disk</span>
                        </div>
                      ) : (
                        <span className="text-emerald-500">RAM</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.protection === 7 ? "RWX" : 
                       entry.protection === 6 ? "RW-" : 
                       entry.protection === 5 ? "R-X" :
                       entry.protection === 4 ? "R--" :
                       entry.protection === 3 ? "-WX" :
                       entry.protection === 2 ? "-W-" :
                       entry.protection === 1 ? "--X" : "---"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No page table entries available
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

export default PageTable;
