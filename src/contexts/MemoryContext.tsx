
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { 
  MemoryBlock, 
  MemoryOperation, 
  MemoryStats, 
  BackendMessage, 
  MemoryBlockType,
  PageTableEntry,
  TLBEntry
} from '../types/memory';
import { toast } from 'sonner';

interface MemoryState {
  blocks: MemoryBlock[];
  diskBlocks: MemoryBlock[];
  stats: MemoryStats;
  isConnected: boolean;
  isSimulating: boolean;
  pageTable: PageTableEntry[];
  tlbEntries: TLBEntry[];
  currentProcessId: number;
}

type MemoryAction = 
  | { type: 'SET_BLOCKS'; payload: MemoryBlock[] }
  | { type: 'SET_DISK_BLOCKS'; payload: MemoryBlock[] }
  | { type: 'SET_STATS'; payload: MemoryStats }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_SIMULATING'; payload: boolean }
  | { type: 'SET_PAGE_TABLE'; payload: PageTableEntry[] }
  | { type: 'SET_TLB'; payload: TLBEntry[] }
  | { type: 'SET_CURRENT_PROCESS'; payload: number }
  | { type: 'PERFORM_OPERATION'; payload: MemoryOperation };

interface MemoryContextType extends MemoryState {
  connect: (url: string) => void;
  disconnect: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  performOperation: (operation: MemoryOperation) => void;
}

const initialStats: MemoryStats = {
  totalMemory: 1024, // 1024 MB physical memory
  usedMemory: 0,
  freeMemory: 1024,
  pageSize: 4, // 4 MB
  totalPages: 256,
  usedPages: 0,
  swappedPages: 0,
  kernelMemory: 128,
  systemMemory: 64,
  diskSize: 2048, // 2 GB swap space
  usedDiskSpace: 0,
  tlbHits: 0,
  tlbMisses: 0,
  pageFaults: 0,
};

const initialState: MemoryState = {
  blocks: [],
  diskBlocks: [],
  stats: initialStats,
  isConnected: false,
  isSimulating: false,
  pageTable: [],
  tlbEntries: [],
  currentProcessId: 1,
};

// Initialize with realistic data
const initializeBlocks = (): MemoryBlock[] => {
  const blocks: MemoryBlock[] = [];
  // Kernel space (0-128 MB)
  for (let i = 0; i < 32; i++) {
    blocks.push({
      id: `kernel-${i}`,
      type: 'kernel',
      size: 4,
      address: i * 4,
    });
  }
  
  // System space (128-192 MB)
  for (let i = 32; i < 48; i++) {
    blocks.push({
      id: `system-${i}`,
      type: 'system',
      size: 4,
      address: i * 4,
    });
  }
  
  // Free space (192-1024 MB)
  for (let i = 48; i < 256; i++) {
    blocks.push({
      id: `free-${i}`,
      type: 'free',
      size: 4,
      address: i * 4,
    });
  }
  
  return blocks;
};

// Initialize disk blocks
const initializeDiskBlocks = (): MemoryBlock[] => {
  const blocks: MemoryBlock[] = [];
  // Create 100 blocks of 20MB each to represent disk space
  for (let i = 0; i < 100; i++) {
    blocks.push({
      id: `disk-${i}`,
      type: 'free',
      size: 20,
      address: i * 20,
    });
  }
  return blocks;
};

// Initialize empty page table - will be filled during operation
const initializePageTable = (processId: number): PageTableEntry[] => {
  return [];
};

// Initialize empty TLB - will be filled during operation
const initializeTLB = (): TLBEntry[] => {
  return [];
};

const memoryReducer = (state: MemoryState, action: MemoryAction): MemoryState => {
  switch (action.type) {
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload };
    case 'SET_DISK_BLOCKS':
      return { ...state, diskBlocks: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_SIMULATING':
      return { ...state, isSimulating: action.payload };
    case 'SET_PAGE_TABLE':
      return { ...state, pageTable: action.payload };
    case 'SET_TLB':
      return { ...state, tlbEntries: action.payload };
    case 'SET_CURRENT_PROCESS':
      return { ...state, currentProcessId: action.payload };
    case 'PERFORM_OPERATION':
      // This would trigger the actual operation
      // For now we just return the state as is
      return state;
    default:
      return state;
  }
};

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(memoryReducer, initialState);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  // Initialize with demo data
  useEffect(() => {
    dispatch({ type: 'SET_BLOCKS', payload: initializeBlocks() });
    dispatch({ type: 'SET_DISK_BLOCKS', payload: initializeDiskBlocks() });
    dispatch({ type: 'SET_PAGE_TABLE', payload: initializePageTable(1) });
    dispatch({ type: 'SET_TLB', payload: initializeTLB() });
  }, []);
  
  const connect = (url: string) => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
        toast.success('Connected to memory backend');
      };
      
      ws.onclose = () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
        toast.error('Disconnected from memory backend');
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };
      
      ws.onmessage = (event) => {
        try {
          const message: BackendMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'memoryUpdate':
              if (Array.isArray(message.data)) {
                // Ensure the incoming data matches MemoryBlock[] type
                const typedData = message.data as MemoryBlock[];
                dispatch({ type: 'SET_BLOCKS', payload: typedData });
              }
              break;
            case 'statsUpdate':
              if (typeof message.data === 'object' && !Array.isArray(message.data)) {
                dispatch({ type: 'SET_STATS', payload: message.data as MemoryStats });
              }
              break;
            case 'error':
              toast.error(`Backend error: ${message.data}`);
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      setSocket(ws);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to memory backend');
    }
  };
  
  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };
  
  const startSimulation = () => {
    dispatch({ type: 'SET_SIMULATING', payload: true });
    // In a real implementation, tell the backend to start simulation
    toast.info('Started memory simulation');
  };
  
  const stopSimulation = () => {
    dispatch({ type: 'SET_SIMULATING', payload: false });
    // In a real implementation, tell the backend to stop simulation
    toast.info('Stopped memory simulation');
  };
  
  const performOperation = (operation: MemoryOperation) => {
    dispatch({ type: 'PERFORM_OPERATION', payload: operation });
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'operation',
        data: operation
      }));
    } else {
      // For demonstration, we'll simulate memory operations
      simulateOperation(operation);
    }
  };
  
  // Simulation logic for demonstration
  const simulateOperation = (operation: MemoryOperation) => {
    const { blocks, stats, pageTable, tlbEntries, diskBlocks } = state;
    
    switch (operation.type) {
      case 'allocate': {
        if (!operation.size) return;
        
        // Find contiguous free blocks
        const size = operation.size;
        const pageSize = stats.pageSize;
        const pagesNeeded = Math.ceil(size / pageSize);
        
        let startIndex = -1;
        let consecutiveFreeBlocks = 0;
        
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].type === 'free') {
            if (startIndex === -1) startIndex = i;
            consecutiveFreeBlocks++;
            
            if (consecutiveFreeBlocks === pagesNeeded) break;
          } else {
            startIndex = -1;
            consecutiveFreeBlocks = 0;
          }
        }
        
        if (startIndex !== -1 && consecutiveFreeBlocks === pagesNeeded) {
          const updatedBlocks: MemoryBlock[] = [...blocks];
          
          // Set up the virtual-to-physical page mapping
          const updatedPageTable = [...pageTable];
          const processId = operation.processId || state.currentProcessId;
          
          for (let i = 0; i < pagesNeeded; i++) {
            updatedBlocks[startIndex + i] = {
              ...updatedBlocks[startIndex + i],
              type: 'allocated',
              processId: processId,
              pageNumber: i
            };
            
            // Create page table entry for this allocation
            const vpn = updatedPageTable.length; // Virtual page number
            const ppn = startIndex + i; // Physical page number
            
            updatedPageTable.push({
              vpn: vpn,
              ppn: ppn,
              valid: true,
              dirty: false,
              referenced: false,
              protection: 7, // RWX permissions
              onDisk: false
            });
          }
          
          // Update stats
          const updatedStats = { ...stats };
          updatedStats.usedMemory += pagesNeeded * pageSize;
          updatedStats.freeMemory -= pagesNeeded * pageSize;
          updatedStats.usedPages += pagesNeeded;
          
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
          
          toast.success(`Allocated ${size} MB of memory`);
        } else {
          toast.error('Failed to allocate memory: Not enough contiguous free space');
        }
        break;
      }
      
      case 'deallocate': {
        if (!operation.processId) return;
        
        const updatedBlocks = blocks.map(block => 
          block.processId === operation.processId
            ? { ...block, type: 'free' as MemoryBlockType, processId: undefined, pageNumber: undefined, segmentId: undefined }
            : block
        );
        
        // Count freed pages
        const freedBlocks = blocks.filter(block => block.processId === operation.processId);
        const freedPages = freedBlocks.length;
        
        if (freedPages > 0) {
          // Update page table to invalidate entries for this process
          const updatedPageTable = pageTable.filter(entry => {
            const blockWithPPN = blocks.find(block => block.address / stats.pageSize === entry.ppn);
            return !blockWithPPN || blockWithPPN.processId !== operation.processId;
          });
          
          // Update TLB to remove entries for this process
          const updatedTLB = tlbEntries.filter(entry => entry.processId !== operation.processId);
          
          // Update stats
          const updatedStats = { ...stats };
          updatedStats.usedMemory -= freedPages * stats.pageSize;
          updatedStats.freeMemory += freedPages * stats.pageSize;
          updatedStats.usedPages -= freedPages;
          
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
          dispatch({ type: 'SET_TLB', payload: updatedTLB });
          
          toast.success(`Deallocated memory for process ${operation.processId}`);
        } else {
          toast.warning(`No memory found for process ${operation.processId}`);
        }
        break;
      }
      
      case 'pageFault': {
        // Update the page table to mark a page as invalid
        if (operation.pageNumber !== undefined) {
          const pageNum = operation.pageNumber;
          
          // Find the page table entry if it exists
          const entryIndex = pageTable.findIndex(entry => entry.vpn === pageNum);
          
          if (entryIndex >= 0) {
            const updatedPageTable = [...pageTable];
            
            // Mark the page as invalid and on disk
            updatedPageTable[entryIndex] = {
              ...updatedPageTable[entryIndex],
              valid: false,
              onDisk: true,
              diskAddress: Math.floor(Math.random() * 1000) * 4096
            };
            
            // Update page table
            dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
            
            // Update stats
            const updatedStats = { ...stats };
            updatedStats.pageFaults++;
            dispatch({ type: 'SET_STATS', payload: updatedStats });
            
            // Also simulate moving to disk
            const updatedDiskBlocks = [...diskBlocks];
            const freeDiskBlock = updatedDiskBlocks.findIndex(block => block.type === 'free');
            
            if (freeDiskBlock >= 0) {
              updatedDiskBlocks[freeDiskBlock] = {
                ...updatedDiskBlocks[freeDiskBlock],
                type: 'disk',
                pageNumber: pageNum,
                processId: state.currentProcessId
              };
              
              dispatch({ type: 'SET_DISK_BLOCKS', payload: updatedDiskBlocks });
              
              // Update disk stats
              updatedStats.usedDiskSpace += 20;
              dispatch({ type: 'SET_STATS', payload: updatedStats });
            }
            
            toast.warning(`Page fault occurred for page ${pageNum}`);
          } else {
            toast.error(`Page ${pageNum} not found in page table`);
          }
        }
        break;
      }
      
      case 'swapIn': {
        if (operation.pageNumber === undefined) return;
        
        // Find disk block with this page
        const diskBlockIndex = diskBlocks.findIndex(
          block => block.pageNumber === operation.pageNumber && block.type === 'disk'
        );
        
        if (diskBlockIndex >= 0) {
          // Update the page in the page table
          const pageIndex = pageTable.findIndex(entry => entry.vpn === operation.pageNumber);
          
          if (pageIndex >= 0) {
            const updatedPageTable = [...pageTable];
            
            // Find a free physical page
            const freePhysicalPage = blocks.findIndex(block => block.type === 'free');
            
            if (freePhysicalPage >= 0) {
              // Update the physical page
              const updatedBlocks = [...blocks];
              updatedBlocks[freePhysicalPage] = {
                ...updatedBlocks[freePhysicalPage],
                type: 'page',
                processId: state.currentProcessId,
                pageNumber: operation.pageNumber
              };
              
              // Mark the page as valid and in memory
              updatedPageTable[pageIndex] = {
                ...updatedPageTable[pageIndex],
                ppn: freePhysicalPage,
                valid: true,
                onDisk: false,
                referenced: true, // It was just accessed
                dirty: false // Fresh from disk, not modified yet
              };
              
              // Update disk blocks to free this block
              const updatedDiskBlocks = [...diskBlocks];
              updatedDiskBlocks[diskBlockIndex] = {
                ...updatedDiskBlocks[diskBlockIndex],
                type: 'free',
                pageNumber: undefined,
                processId: undefined
              };
              
              // Update stats
              const updatedStats = { ...stats };
              updatedStats.swappedPages--;
              updatedStats.usedDiskSpace -= 20;
              updatedStats.usedMemory += stats.pageSize;
              updatedStats.freeMemory -= stats.pageSize;
              
              // Update state
              dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
              dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
              dispatch({ type: 'SET_DISK_BLOCKS', payload: updatedDiskBlocks });
              dispatch({ type: 'SET_STATS', payload: updatedStats });
              
              toast.success(`Swapped in page ${operation.pageNumber}`);
            } else {
              toast.error('No free physical pages available for swap in');
            }
          } else {
            toast.error(`Page ${operation.pageNumber} not found in page table`);
          }
        } else {
          toast.warning(`Page ${operation.pageNumber} not found on disk`);
        }
        break;
      }
      
      case 'swapOut': {
        if (operation.pageNumber === undefined) return;
        
        // Find page in page table
        const pageIndex = pageTable.findIndex(entry => entry.vpn === operation.pageNumber);
        
        if (pageIndex >= 0 && !pageTable[pageIndex].onDisk) {
          const physicalPageNumber = pageTable[pageIndex].ppn;
          
          // Find a free disk block
          const freeDiskIndex = diskBlocks.findIndex(block => block.type === 'free');
          
          if (freeDiskIndex >= 0) {
            // Update the physical memory
            const updatedBlocks = [...blocks];
            
            if (physicalPageNumber < updatedBlocks.length) {
              // Free the physical page
              updatedBlocks[physicalPageNumber] = {
                ...updatedBlocks[physicalPageNumber],
                type: 'free',
                processId: undefined,
                pageNumber: undefined
              };
              
              // Update the page table entry
              const updatedPageTable = [...pageTable];
              updatedPageTable[pageIndex] = {
                ...updatedPageTable[pageIndex],
                valid: false,
                onDisk: true,
                diskAddress: freeDiskIndex * 20 * 1024 * 1024 // Simple mapping to disk address
              };
              
              // Update disk blocks
              const updatedDiskBlocks = [...diskBlocks];
              updatedDiskBlocks[freeDiskIndex] = {
                ...updatedDiskBlocks[freeDiskIndex],
                type: 'disk',
                pageNumber: operation.pageNumber,
                processId: state.currentProcessId
              };
              
              // Update stats
              const updatedStats = { ...stats };
              updatedStats.swappedPages++;
              updatedStats.usedDiskSpace += 20;
              updatedStats.usedMemory -= stats.pageSize;
              updatedStats.freeMemory += stats.pageSize;
              
              // Update state
              dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
              dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
              dispatch({ type: 'SET_DISK_BLOCKS', payload: updatedDiskBlocks });
              dispatch({ type: 'SET_STATS', payload: updatedStats });
              
              // Remove from TLB if present
              const updatedTLB = tlbEntries.filter(entry => 
                entry.vpn !== operation.pageNumber || entry.processId !== state.currentProcessId
              );
              dispatch({ type: 'SET_TLB', payload: updatedTLB });
              
              toast.info(`Swapped out page ${operation.pageNumber}`);
            } else {
              toast.error('Invalid physical page reference');
            }
          } else {
            toast.error('No free disk space available for swap');
          }
        } else if (pageIndex >= 0) {
          toast.warning(`Page ${operation.pageNumber} is already on disk`);
        } else {
          toast.error(`Page ${operation.pageNumber} not found in page table`);
        }
        break;
      }
      
      case 'translateAddress': {
        if (operation.virtualAddress === undefined) return;
        
        // Calculate page number and offset from virtual address
        const pageSize = stats.pageSize * 1024 * 1024; // Convert MB to bytes
        const pageOffsetBits = Math.log2(pageSize);
        const pageNumber = operation.virtualAddress >> pageOffsetBits;
        
        // First, check TLB
        const tlbIndex = tlbEntries.findIndex(entry => 
          entry.vpn === pageNumber && 
          entry.valid && 
          entry.processId === state.currentProcessId
        );
        
        const updatedStats = { ...stats };
        
        if (tlbIndex >= 0) {
          // TLB hit
          updatedStats.tlbHits++;
          
          // Update TLB entry's last used time
          const updatedTLB = [...tlbEntries];
          updatedTLB[tlbIndex] = {
            ...updatedTLB[tlbIndex],
            lastUsed: Date.now()
          };
          
          dispatch({ type: 'SET_TLB', payload: updatedTLB });
        } else {
          // TLB miss
          updatedStats.tlbMisses++;
          
          // Check page table
          const pageEntry = pageTable.find(entry => entry.vpn === pageNumber);
          
          if (!pageEntry || !pageEntry.valid) {
            // Page fault
            updatedStats.pageFaults++;
            
            // If this is a new virtual page, create a page table entry
            if (!pageEntry) {
              // Create a new page table entry
              const updatedPageTable = [...pageTable];
              updatedPageTable.push({
                vpn: pageNumber,
                ppn: 0, // This will be set when swapped in
                valid: false,
                dirty: false,
                referenced: true,
                protection: 7, // RWX
                onDisk: false // Not yet on disk
              });
              
              dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
            }
            
            // If we have the page entry but it's on disk, we can simulate a page fault
            else if (pageEntry && pageEntry.onDisk) {
              // Schedule a swap in operation (in real system this would be done by OS)
              setTimeout(() => {
                performOperation({
                  type: 'swapIn',
                  pageNumber: pageNumber
                });
              }, 1000);
            }
          } else {
            // Page table hit, add to TLB
            const updatedTLB = [...tlbEntries];
            
            // If TLB is full, replace the least recently used entry
            if (updatedTLB.length >= 8) {
              let lruIndex = 0;
              let lruTime = Date.now();
              
              updatedTLB.forEach((entry, index) => {
                if (entry.lastUsed < lruTime) {
                  lruTime = entry.lastUsed;
                  lruIndex = index;
                }
              });
              
              // Replace LRU entry
              updatedTLB[lruIndex] = {
                vpn: pageNumber,
                ppn: pageEntry.ppn,
                valid: true,
                lastUsed: Date.now(),
                processId: state.currentProcessId
              };
            } else {
              // Just add a new entry
              updatedTLB.push({
                vpn: pageNumber,
                ppn: pageEntry.ppn,
                valid: true,
                lastUsed: Date.now(),
                processId: state.currentProcessId
              });
            }
            
            dispatch({ type: 'SET_TLB', payload: updatedTLB });
          }
        }
        
        dispatch({ type: 'SET_STATS', payload: updatedStats });
        break;
      }
      
      case 'reset': {
        dispatch({ type: 'SET_BLOCKS', payload: initializeBlocks() });
        dispatch({ type: 'SET_DISK_BLOCKS', payload: initializeDiskBlocks() });
        dispatch({ type: 'SET_PAGE_TABLE', payload: initializePageTable(state.currentProcessId) });
        dispatch({ type: 'SET_TLB', payload: initializeTLB() });
        dispatch({ type: 'SET_STATS', payload: initialStats });
        toast.info('Memory state reset');
        break;
      }
      
      default:
        break;
    }
  };
  
  return (
    <MemoryContext.Provider value={{
      ...state,
      connect,
      disconnect,
      startSimulation,
      stopSimulation,
      performOperation
    }}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (context === undefined) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};
