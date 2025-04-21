
import React, { useState } from 'react';
import { useMemory } from '../contexts/MemoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { HardDrive, Layers, Table } from 'lucide-react';

const AddressTranslation: React.FC = () => {
  const { performOperation, stats } = useMemory();
  const [virtualAddress, setVirtualAddress] = useState<string>('');
  const [translationResult, setTranslationResult] = useState<{
    virtualAddress?: number;
    physicalAddress?: number;
    pageOffset?: number;
    vpn?: number;
    ppn?: number;
    tlbHit?: boolean;
    pageFault?: boolean;
  } | null>(null);
  
  const handleTranslate = () => {
    const vAddr = parseInt(virtualAddress, 16);
    
    if (isNaN(vAddr)) {
      toast.error('Invalid hexadecimal address');
      return;
    }
    
    // Simulate address translation
    performOperation({
      type: 'translateAddress',
      virtualAddress: vAddr
    });
    
    // For simulation purposes, we'll calculate these values here
    const pageSize = stats.pageSize * 1024 * 1024; // Convert MB to bytes
    const pageOffsetBits = Math.log2(pageSize);
    const pageOffset = vAddr & ((1 << pageOffsetBits) - 1);
    const vpn = vAddr >> pageOffsetBits;
    
    // Simulate a TLB lookup and potential page fault
    const tlbHit = Math.random() > 0.3; // 70% chance of TLB hit
    const pageFault = !tlbHit && Math.random() > 0.6; // 40% chance of page fault if TLB miss
    
    // Generate a physical page number (in reality this would come from TLB or page table)
    let ppn;
    if (pageFault) {
      ppn = null; // Page fault, no physical address
    } else {
      // Some random PPN that's not the same as VPN
      ppn = (vpn + 100) % 1024;
    }
    
    // Calculate physical address if no page fault
    const physicalAddress = pageFault ? null : (ppn << pageOffsetBits) | pageOffset;
    
    // Set translation result
    setTranslationResult({
      virtualAddress: vAddr,
      physicalAddress,
      pageOffset,
      vpn,
      ppn,
      tlbHit,
      pageFault
    });
    
    // Show appropriate toast message
    if (pageFault) {
      toast.error('Page fault occurred! Page not in physical memory.');
    } else if (tlbHit) {
      toast.success('TLB hit! Address translated using TLB.');
    } else {
      toast.info('TLB miss! Address translated using page table.');
    }
  };
  
  return (
    <Card className="bg-card border-gray-700">
      <CardHeader>
        <CardTitle>Virtual Address Translation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-grow">
            <Input
              placeholder="Enter virtual address (hex, e.g. 0x3F24A)"
              value={virtualAddress}
              onChange={(e) => setVirtualAddress(e.target.value)}
              className="font-mono"
            />
          </div>
          <Button onClick={handleTranslate}>Translate</Button>
        </div>
        
        {translationResult && (
          <div className="border border-gray-700 rounded-md p-4 bg-gray-900">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="text-sm font-medium text-muted-foreground">Virtual Address:</div>
              <div className="font-mono">0x{translationResult.virtualAddress?.toString(16).toUpperCase()}</div>
              
              <div className="text-sm font-medium text-muted-foreground">Virtual Page Number:</div>
              <div className="font-mono">{translationResult.vpn}</div>
              
              <div className="text-sm font-medium text-muted-foreground">Page Offset:</div>
              <div className="font-mono">0x{translationResult.pageOffset?.toString(16).toUpperCase()}</div>
              
              <div className="col-span-2">
                <Separator className="my-2" />
              </div>
              
              <div className="text-sm font-medium text-muted-foreground">Translation Path:</div>
              <div className="flex items-center gap-1">
                {translationResult.tlbHit ? (
                  <div className="flex items-center text-green-400">
                    <Layers size={16} className="mr-1" />
                    TLB Hit
                  </div>
                ) : (
                  <div className="flex items-center text-amber-400">
                    <Table size={16} className="mr-1" />
                    Page Table
                  </div>
                )}
              </div>
              
              {translationResult.pageFault ? (
                <>
                  <div className="text-sm font-medium text-muted-foreground">Status:</div>
                  <div className="flex items-center text-rose-500">
                    <HardDrive size={16} className="mr-1" />
                    PAGE FAULT
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-muted-foreground">Physical Page Number:</div>
                  <div className="font-mono">{translationResult.ppn}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground">Physical Address:</div>
                  <div className="font-mono">0x{translationResult.physicalAddress?.toString(16).toUpperCase()}</div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressTranslation;
