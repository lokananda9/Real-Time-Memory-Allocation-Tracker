
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { MemoryBlock, MemoryOperation, MemoryStats, BackendMessage, MemoryBlockType } from '../types/memory';
import { toast } from 'sonner';

interface MemoryState {
  blocks: MemoryBlock[];
  stats: MemoryStats;
  isConnected: boolean;
  isSimulating: boolean;
}

type MemoryAction = 
  | { type: 'SET_BLOCKS'; payload: MemoryBlock[] }
  | { type: 'SET_STATS'; payload: MemoryStats }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_SIMULATING'; payload: boolean }
  | { type: 'PERFORM_OPERATION'; payload: MemoryOperation };

interface MemoryContextType extends MemoryState {
  connect: (url: string) => void;
  disconnect: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  performOperation: (operation: MemoryOperation) => void;
}

const initialStats: MemoryStats = {
  totalMemory: 1024, // 1024 MB
  usedMemory: 0,
  freeMemory: 1024,
  pageSize: 4, // 4 MB
  totalPages: 256,
  usedPages: 0,
  swappedPages: 0,
  kernelMemory: 128,
  systemMemory: 64,
};

const initialState: MemoryState = {
  blocks: [],
  stats: initialStats,
  isConnected: false,
  isSimulating: false,
};

// Initialize with demo data
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

const memoryReducer = (state: MemoryState, action: MemoryAction): MemoryState => {
  switch (action.type) {
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_SIMULATING':
      return { ...state, isSimulating: action.payload };
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
    const { blocks, stats } = state;
    
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
          
          for (let i = 0; i < pagesNeeded; i++) {
            updatedBlocks[startIndex + i] = {
              ...updatedBlocks[startIndex + i],
              type: 'allocated',
              processId: operation.processId || 1,
              pageNumber: i
            };
          }
          
          // Update stats
          const updatedStats = { ...stats };
          updatedStats.usedMemory += pagesNeeded * pageSize;
          updatedStats.freeMemory -= pagesNeeded * pageSize;
          updatedStats.usedPages += pagesNeeded;
          
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          
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
          // Update stats
          const updatedStats = { ...stats };
          updatedStats.usedMemory -= freedPages * stats.pageSize;
          updatedStats.freeMemory += freedPages * stats.pageSize;
          updatedStats.usedPages -= freedPages;
          
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          
          toast.success(`Deallocated memory for process ${operation.processId}`);
        } else {
          toast.warning(`No memory found for process ${operation.processId}`);
        }
        break;
      }
      
      case 'pageFault': {
        toast.warning(`Page fault occurred for page ${operation.pageNumber}`);
        break;
      }
      
      case 'swapIn': {
        if (operation.pageNumber === undefined) return;
        
        const updatedBlocks = blocks.map(block => 
          block.pageNumber === operation.pageNumber && block.isSwapped
            ? { ...block, isSwapped: false }
            : block
        );
        
        const swappedInCount = blocks.filter(
          block => block.pageNumber === operation.pageNumber && block.isSwapped
        ).length;
        
        if (swappedInCount > 0) {
          const updatedStats = { ...stats };
          updatedStats.swappedPages -= swappedInCount;
          
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          
          toast.success(`Swapped in page ${operation.pageNumber}`);
        }
        break;
      }
      
      case 'swapOut': {
        if (operation.pageNumber === undefined) return;
        
        const updatedBlocks = blocks.map(block => 
          block.pageNumber === operation.pageNumber && !block.isSwapped
            ? { ...block, isSwapped: true }
            : block
        );
        
        const swappedOutCount = blocks.filter(
          block => block.pageNumber === operation.pageNumber && !block.isSwapped
        ).length;
        
        if (swappedOutCount > 0) {
          const updatedStats = { ...stats };
          updatedStats.swappedPages += swappedOutCount;
          
          dispatch({ type: 'SET_BLOCKS', payload: updatedBlocks });
          dispatch({ type: 'SET_STATS', payload: updatedStats });
          
          toast.info(`Swapped out page ${operation.pageNumber}`);
        }
        break;
      }
      
      case 'reset': {
        dispatch({ type: 'SET_BLOCKS', payload: initializeBlocks() });
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
