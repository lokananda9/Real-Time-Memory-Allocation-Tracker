
// Memory block types
export type MemoryBlockType = 
  | 'free'      // Free memory
  | 'used'      // Used memory (allocated but not specific)
  | 'allocated' // Specifically allocated memory
  | 'page'      // Page of memory
  | 'segment'   // Segment of memory
  | 'kernel'    // Kernel memory
  | 'system'    // System reserved memory
  | 'disk'      // Disk memory (swap space)
  | 'tlb';      // Translation lookaside buffer entry

// Memory block representation
export interface MemoryBlock {
  id: string;
  type: MemoryBlockType;
  size: number;
  address: number;
  processId?: number;
  pageNumber?: number;
  frameNumber?: number;
  segmentId?: string;
  isSwapped?: boolean;
  lastAccessed?: number;
  valid?: boolean;
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
  diskSize: number;
  usedDiskSpace: number;
  tlbHits: number;
  tlbMisses: number;
  pageFaults: number;
}

// Page Table Entry
export interface PageTableEntry {
  vpn: number;      // Virtual Page Number
  ppn: number;      // Physical Page Number
  valid: boolean;   // Whether this mapping is valid
  dirty: boolean;   // Whether page has been modified
  referenced: boolean; // Whether page has been accessed recently
  protection: number;  // Read/write/execute permissions
  onDisk: boolean;  // Whether page is currently on disk
  diskAddress?: number; // Location on disk if swapped
}

// Translation Lookaside Buffer Entry
export interface TLBEntry {
  vpn: number;     // Virtual Page Number
  ppn: number;     // Physical Page Number
  valid: boolean;  // Whether this entry is valid
  lastUsed: number; // Timestamp of last access
  processId: number; // Process ID this entry belongs to
}

// Memory operation types
export type MemoryOperationType = 
  | 'allocate'
  | 'deallocate'
  | 'pageFault'
  | 'swapIn'
  | 'swapOut'
  | 'fragmentationFix'
  | 'reset'
  | 'accessMemory'
  | 'translateAddress';

// Memory operation definition
export interface MemoryOperation {
  type: MemoryOperationType;
  processId?: number;
  size?: number;
  address?: number;
  pageNumber?: number;
  segmentId?: string;
  virtualAddress?: number;
}

// WebSocket message format for C backend
export interface BackendMessage {
  type: 'memoryUpdate' | 'statsUpdate' | 'operation' | 'error' | 'pageTable' | 'tlbUpdate';
  data: MemoryBlock[] | MemoryStats | MemoryOperation | string | PageTableEntry[] | TLBEntry[];
}
