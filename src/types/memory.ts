
// Memory block types
export type MemoryBlockType = 
  | 'free'      // Free memory
  | 'used'      // Used memory (allocated but not specific)
  | 'allocated' // Specifically allocated memory
  | 'page'      // Page of memory
  | 'segment'   // Segment of memory
  | 'kernel'    // Kernel memory
  | 'system';   // System reserved memory

// Memory block representation
export interface MemoryBlock {
  id: string;
  type: MemoryBlockType;
  size: number;
  address: number;
  processId?: number;
  pageNumber?: number;
  segmentId?: string;
  isSwapped?: boolean;
}

// Memory statistics
export interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  pageSize: number;
  totalPages: number;
  usedPages: number;
  swappedPages: number;
  kernelMemory: number;
  systemMemory: number;
}

// Memory operation types
export type MemoryOperationType = 
  | 'allocate'
  | 'deallocate'
  | 'pageFault'
  | 'swapIn'
  | 'swapOut'
  | 'fragmentationFix'
  | 'reset';

// Memory operation definition
export interface MemoryOperation {
  type: MemoryOperationType;
  processId?: number;
  size?: number;
  address?: number;
  pageNumber?: number;
  segmentId?: string;
}

// WebSocket message format for C backend
export interface BackendMessage {
  type: 'memoryUpdate' | 'statsUpdate' | 'operation' | 'error';
  data: MemoryBlock[] | MemoryStats | MemoryOperation | string;
}
