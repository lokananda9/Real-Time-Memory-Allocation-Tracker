
import React from 'react';
import { MemoryBlock as MemoryBlockType } from '../types/memory';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MemoryBlockProps {
  block: MemoryBlockType;
  onClick?: (block: MemoryBlockType) => void;
}

const MemoryBlock: React.FC<MemoryBlockProps> = ({ block, onClick }) => {
  const getBlockClass = () => {
    let baseClass = 'memory-block h-full w-full rounded-sm';
    
    switch (block.type) {
      case 'free':
        return `${baseClass} bg-memory-free`;
      case 'used':
        return `${baseClass} bg-memory-used`;
      case 'allocated':
        return `${baseClass} bg-memory-allocated`;
      case 'page':
        return `${baseClass} bg-memory-page`;
      case 'segment':
        return `${baseClass} bg-memory-segment`;
      case 'kernel':
        return `${baseClass} bg-memory-kernel`;
      case 'system':
        return `${baseClass} bg-memory-system`;
      default:
        return baseClass;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(block);
    }
  };

  // Format address to hexadecimal for display
  const formatAddress = (address: number) => {
    return `0x${address.toString(16).toUpperCase().padStart(8, '0')}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              getBlockClass(),
              block.isSwapped && 'opacity-30',
              'cursor-pointer transition-all hover:brightness-125 hover:scale-110'
            )}
            onClick={handleClick}
          >
            {block.processId && (
              <span className="text-xs font-bold text-white opacity-80">
                {block.processId}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <div className="font-bold">{block.type.charAt(0).toUpperCase() + block.type.slice(1)}</div>
            <div>Address: {formatAddress(block.address)}</div>
            <div>Size: {block.size} MB</div>
            {block.processId && <div>Process ID: {block.processId}</div>}
            {block.pageNumber !== undefined && <div>Page: {block.pageNumber}</div>}
            {block.segmentId && <div>Segment: {block.segmentId}</div>}
            {block.isSwapped && <div className="text-yellow-400">Swapped</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MemoryBlock;
