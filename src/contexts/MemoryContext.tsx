
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { 
  MemoryBlock, 
  MemoryOperation, 
  MemoryStats, 
  BackendMessage, 
  MemoryBlockType,
  PageTableEntry
} from '../types/memory';
import { toast } from 'sonner';

interface MemoryState {
  blocks: MemoryBlock[];
  logicalBlocks: MemoryBlock[];
  diskBlocks: MemoryBlock[];
  stats: MemoryStats;
  isConnected: boolean;
  isSimulating: boolean;
  pageTable: PageTableEntry[];
  currentProcessId: number;
}

type MemoryAction = 
  | { type: 'SET_BLOCKS'; payload: MemoryBlock[] }
  | { type: 'SET_LOGICAL_BLOCKS'; payload: MemoryBlock[] }
  | { type: 'SET_DISK_BLOCKS'; payload: MemoryBlock[] }
  | { type: 'SET_STATS'; payload: MemoryStats }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_SIMULATING'; payload: boolean }
  | { type: 'SET_PAGE_TABLE'; payload: PageTableEntry[] }
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
  pageFaults: 0,
};

const initialState: MemoryState = {
  blocks: [],
  logicalBlocks: [],
  diskBlocks: [],
  stats: initialStats,
  isConnected: false,
  isSimulating: false,
  pageTable: [],
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

// Initialize logical blocks (larger address space)
const initializeLogicalBlocks = (): MemoryBlock[] => {
  const blocks: MemoryBlock[] = [];
  // Create a much larger virtual memory space (4x physical memory)
  const totalLogicalBlocks = 1024; // 4096 MB total logical memory
  
  // Kernel space mapping (same as physical)
  for (let i = 0; i < 32; i++) {
    blocks.push({
      id: `logical-kernel-${i}`,
      type: 'kernel',
      size: 4,
      address: i * 4,
    });
  }
  
  // System space mapping (same as physical)
  for (let i = 32; i < 48; i++) {
    blocks.push({
      id: `logical-system-${i}`,
      type: 'system',
      size: 4,
      address: i * 4,
    });
  }
  
  // User space (much larger than physical)
  for (let i = 48; i < totalLogicalBlocks; i++) {
    blocks.push({
      id: `logical-${i}`,
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

const memoryReducer = (state: MemoryState, action: MemoryAction): MemoryState => {
  switch (action.type) {
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload };
    case 'SET_LOGICAL_BLOCKS':
      return { ...state, logicalBlocks: action.payload };
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
    dispatch({ type: 'SET_LOGICAL_BLOCKS', payload: initializeLogicalBlocks() });
    dispatch({ type: 'SET_DISK_BLOCKS', payload: initializeDiskBlocks() });
    dispatch({ type: 'SET_PAGE_TABLE', payload: initializePageTable(1) });
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
    const { blocks, logicalBlocks, stats, pageTable, diskBlocks } = state;
    
    switch (operation.type) {
      case 'allocate': {
        if (!operation.size) return;
        
        // Allocate in logical memory first
        const size = operation.size;
        const pageSize = stats.pageSize;
        const pagesNeeded = Math.ceil(size / pageSize);
        
        // Find free space in logical memory
        let startLogicalIndex = -1;
        let consecutiveFreeLogicalBlocks = 0;
        
        for (let i = 48; i < logicalBlocks.length; i++) {  // Start after system space
          if (logicalBlocks[i].type === 'free') {
            if (startLogicalIndex === -1) startLogicalIndex = i;
            consecutiveFreeLogicalBlocks++;
            
            if (consecutiveFreeLogicalBlocks === pagesNeeded) break;
          } else {
            startLogicalIndex = -1;
            consecutiveFreeLogicalBlocks = 0;
          }
        }
        
        if (startLogicalIndex !== -1 && consecutiveFreeLogicalBlocks === pagesNeeded) {
          const updatedLogicalBlocks = [...logicalBlocks];
          const processId = operation.processId || state.currentProcessId;
          const updatedPageTable = [...pageTable];
          
          // Allocate in physical memory if there's space
          // For now, we'll just find individual free pages, they don't need to be contiguous in physical
          const freePhysicalIndices: number[] = [];
          const updatedBlocks = [...blocks];
          
          // Find free physical pages
          for (let i = 48; i < blocks.length && freePhysicalIndices.length < pagesNeeded; i++) {
            if (blocks[i].type === 'free') {
              freePhysicalIndices.push(i);
            }
          }
          
          // Check if we have enough physical pages
          const needSwapOut = freePhysicalIndices.length < pagesNeeded;
          
          if (needSwapOut) {
            toast.warning('Not enough physical memory available, some pages will be swapped out');
          }
          
          // Mark logical blocks as allocated
          for (let i = 0; i < pagesNeeded; i++) {
            const logicalIndex = startLogicalIndex + i;
            updatedLogicalBlocks[logicalIndex] = {
              ...updatedLogicalBlocks[logicalIndex],
              type: 'allocated',
              processId: processId,
              pageNumber: i
            };
            
            // Create page table entry
            const vpn = logicalIndex;  // Virtual Page Number
            let ppn = -1;              // Physical Page Number (not yet assigned)
            let onDisk = false;
            
            // If we have a physical page available, use it
            if (i < freePhysicalIndices.length) {
              ppn = freePhysicalIndices[i];
              // Mark the physical page as allocated
              updatedBlocks[ppn] = {
                ...updatedBlocks[ppn],
                type: 'allocated',
                processId: processId,
                pageNumber: i
              };
            } else {
              // This page will be on disk
              onDisk = true;
              // Find a free disk block
              const freeDiskIndex = diskBlocks.findIndex(block => block.type === 'free');
              if (freeDiskIndex >= 0) {
                const updatedDiskBlocks = [...diskBlocks];
                updatedDiskBlocks[freeDiskIndex] = {
                  ...updatedDiskBlocks[freeDiskIndex],
                  type: 'disk',
                  pageNumber: i,
                  processId: processId
                };
                dispatch({ type: 'SET_DISK_BLOCKS', payload: updatedDiskBlocks });
                
                // Update disk stats
                const updatedStats = { ...stats };
                updatedStats.usedDiskSpace += 20;
                updatedStats.swappedPages++;
                dispatch({ type: 'SET_STATS', payload: updatedStats });
              }
            }
            
            // Add page table entry
            updatedPageTable.push({
              vpn: vpn,
              ppn: ppn,
              valid: !onDisk,
              dirty: false,
              referenced: true,
              protection: 7,  // RWX permissions
              onDisk: onDisk,
              diskAddress: onDisk ? Math.floor(Math.random() * 1000) * 4096 : undefined
            });
          }
          
          // Update stats
          const updatedStats = { ...stats };
          const physicalPagesAllocated = Math.min(pagesNeeded, freePhysicalIndices.length);
          updatedStats.usedMemory += physicalPagesAllocated * pageSize;
          updatedStats.freeMemory -= physicalPagesAllocated * pageSize;
          updatedStats.usedPages += pagesNeeded;
          
          dispatch({ type: 'SET_LOGICAL_BLOCKS', payload: updatedLogicalBlocks });
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
          
          toast.success(`Allocated ${size} MB of memory (${pagesNeeded} pages)`);
        } else {
          toast.error('Failed to allocate memory: Not enough space in logical memory');
        }
        break;
      }
      
      case 'deallocate': {
        if (!operation.processId) return;
        
        // Free physical memory
        const updatedBlocks = blocks.map(block => 
          block.processId === operation.processId
            ? { ...block, type: 'free' as MemoryBlockType, processId: undefined, pageNumber: undefined, segmentId: undefined }
            : block
        );
        
        // Free logical memory
        const updatedLogicalBlocks = logicalBlocks.map(block => 
          block.processId === operation.processId
            ? { ...block, type: 'free' as MemoryBlockType, processId: undefined, pageNumber: undefined, segmentId: undefined }
            : block
        );
        
        // Count freed pages
        const freedPhysicalBlocks = blocks.filter(block => block.processId === operation.processId);
        const freedLogicalBlocks = logicalBlocks.filter(block => block.processId === operation.processId);
        
        // Free disk blocks for this process
        const updatedDiskBlocks = diskBlocks.map(block => 
          block.processId === operation.processId
            ? { ...block, type: 'free' as MemoryBlockType, processId: undefined, pageNumber: undefined }
            : block
        );
        
        // Update page table to remove entries for this process
        const updatedPageTable = pageTable.filter(entry => {
          const logicalBlock = logicalBlocks.find(block => block.address / stats.pageSize === entry.vpn);
          return !logicalBlock || logicalBlock.processId !== operation.processId;
        });
        
        if (freedLogicalBlocks.length > 0) {
          // Update stats
          const updatedStats = { ...stats };
          updatedStats.usedMemory -= freedPhysicalBlocks.length * stats.pageSize;
          updatedStats.freeMemory += freedPhysicalBlocks.length * stats.pageSize;
          updatedStats.usedPages -= freedLogicalBlocks.length;
          
          // Count freed swapped pages
          const freedSwappedPages = diskBlocks.filter(
            block => block.processId === operation.processId && block.type === 'disk'
          ).length;
          
          if (freedSwappedPages > 0) {
            updatedStats.swappedPages -= freedSwappedPages;
            updatedStats.usedDiskSpace -= freedSwappedPages * 20;
          }
          
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_LOGICAL_BLOCKS', payload: updatedLogicalBlocks });
          dispatch({ type: 'SET_DISK_BLOCKS', payload: updatedDiskBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
          
          toast.success(`Deallocated memory for process ${operation.processId}`);
        } else {
          toast.warning(`No memory found for process ${operation.processId}`);
        }
        break;
      }
      
      case 'pageFault': {
        // Handle page fault by swapping in a page from disk
        if (operation.pageNumber !== undefined) {
          performOperation({
            type: 'swapIn',
            pageNumber: operation.pageNumber
          });
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
          const pageIndex = pageTable.findIndex(entry => entry.vpn.toString().includes(operation.pageNumber?.toString() || ''));
          
          if (pageIndex >= 0) {
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
              
              // Update page table
              const updatedPageTable = [...pageTable];
              updatedPageTable[pageIndex] = {
                ...updatedPageTable[pageIndex],
                ppn: freePhysicalPage,
                valid: true,
                onDisk: false,
                referenced: true,
                dirty: false
              };
              
              // Free the disk block
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
              
              dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
              dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
              dispatch({ type: 'SET_DISK_BLOCKS', payload: updatedDiskBlocks });
              dispatch({ type: 'SET_STATS', payload: updatedStats });
              
              toast.success(`Swapped in page ${operation.pageNumber}`);
            } else {
              // No free physical pages, need to swap something out first
              performOperation({
                type: 'swapOut',
                // Pick a random page that isn't the one we're trying to swap in
                pageNumber: Math.floor(Math.random() * 10)
              });
              
              // Then try again
              setTimeout(() => {
                performOperation({
                  type: 'swapIn',
                  pageNumber: operation.pageNumber
                });
              }, 100);
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
        
        // Find page in logical blocks
        const logicalBlockIndex = logicalBlocks.findIndex(
          block => block.pageNumber === operation.pageNumber && 
                  block.processId === state.currentProcessId
        );
        
        if (logicalBlockIndex >= 0) {
          // Find the corresponding page table entry
          const pageIndex = pageTable.findIndex(entry => 
            entry.vpn === logicalBlockIndex
          );
          
          if (pageIndex >= 0 && !pageTable[pageIndex].onDisk) {
            const physicalPageNumber = pageTable[pageIndex].ppn;
            
            // Find a free disk block
            const freeDiskIndex = diskBlocks.findIndex(block => block.type === 'free');
            
            if (freeDiskIndex >= 0 && physicalPageNumber >= 0) {
              // Free the physical page
              const updatedBlocks = [...blocks];
              updatedBlocks[physicalPageNumber] = {
                ...updatedBlocks[physicalPageNumber],
                type: 'free',
                processId: undefined,
                pageNumber: undefined
              };
              
              // Update page table entry
              const updatedPageTable = [...pageTable];
              updatedPageTable[pageIndex] = {
                ...updatedPageTable[pageIndex],
                valid: false,
                onDisk: true,
                diskAddress: freeDiskIndex * 20 * 1024 * 1024
              };
              
              // Update disk block
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
              
              dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
              dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
              dispatch({ type: 'SET_DISK_BLOCKS', payload: updatedDiskBlocks });
              dispatch({ type: 'SET_STATS', payload: updatedStats });
              
              toast.info(`Swapped out page ${operation.pageNumber}`);
            } else if (freeDiskIndex < 0) {
              toast.error('No free disk space available for swap');
            }
          } else if (pageIndex >= 0) {
            toast.warning(`Page ${operation.pageNumber} is already on disk`);
          } else {
            toast.error(`Page ${operation.pageNumber} not found in page table`);
          }
        } else {
          toast.error(`Page ${operation.pageNumber} not found for current process`);
        }
        break;
      }
      
      case 'translateAddress': {
        if (operation.virtualAddress === undefined) return;
        
        // Calculate page number and offset from virtual address
        const pageSize = stats.pageSize * 1024 * 1024; // Convert MB to bytes
        const pageOffsetBits = Math.log2(pageSize);
        const vpn = operation.virtualAddress >> pageOffsetBits;
        
        // Check page table
        const pageEntry = pageTable.find(entry => entry.vpn === vpn);
        
        if (!pageEntry || !pageEntry.valid) {
          // Page fault
          const updatedStats = { ...stats };
          updatedStats.pageFaults++;
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          
          // If this is a new virtual page, create a page table entry
          if (!pageEntry) {
            // Create a new page table entry for this virtual page
            const updatedPageTable = [...pageTable];
            updatedPageTable.push({
              vpn: vpn,
              ppn: 0, // Will be assigned when page is loaded
              valid: false,
              dirty: false,
              referenced: true,
              protection: 7, // RWX
              onDisk: false // Not yet on disk
            });
            
            dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
          }
          // If we have the page entry but it's on disk, we'll need to swap it in
          else if (pageEntry && pageEntry.onDisk) {
            setTimeout(() => {
              performOperation({
                type: 'pageFault',
                pageNumber: vpn
              });
            }, 500);
          }
        } else {
          // Page hit - mark as referenced
          const updatedPageTable = [...pageTable];
          const index = updatedPageTable.findIndex(entry => entry.vpn === vpn);
          if (index >= 0) {
            updatedPageTable[index] = {
              ...updatedPageTable[index],
              referenced: true
            };
            
            dispatch({ type: 'SET_PAGE_TABLE', payload: updatedPageTable });
          }
        }
        break;
      }
      
      case 'reset': {
        dispatch({ type: 'SET_BLOCKS', payload: initializeBlocks() });
        dispatch({ type: 'SET_LOGICAL_BLOCKS', payload: initializeLogicalBlocks() });
        dispatch({ type: 'SET_DISK_BLOCKS', payload: initializeDiskBlocks() });
        dispatch({ type: 'SET_PAGE_TABLE', payload: initializePageTable(state.currentProcessId) });
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
