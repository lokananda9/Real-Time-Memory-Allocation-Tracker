
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code } from '@/components/ui/code';

const BackendConnection: React.FC = () => {
  return (
    <Card className="bg-card border-gray-700">
      <CardHeader>
        <CardTitle>C Backend Integration</CardTitle>
        <CardDescription>Instructions for connecting your C backend</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="websocket" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="websocket">WebSocket</TabsTrigger>
            <TabsTrigger value="c_code">C Code</TabsTrigger>
            <TabsTrigger value="data">Data Format</TabsTrigger>
          </TabsList>
          
          <TabsContent value="websocket" className="space-y-4">
            <p className="text-sm">
              This visualization tool connects to your C backend via WebSocket. Make sure your C program implements 
              a WebSocket server that sends memory allocation data in the expected format.
            </p>
            
            <div className="text-sm space-y-2">
              <h3 className="font-bold">Connection Steps:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Start your C WebSocket server</li>
                <li>Set the WebSocket URL in the Connection tab</li>
                <li>Click Connect to establish connection</li>
                <li>Your memory data will update in real-time</li>
              </ol>
            </div>
            
            <p className="text-sm text-muted-foreground">
              If no backend is connected, the visualization will run in demo mode with simulated data.
            </p>
          </TabsContent>
          
          <TabsContent value="c_code" className="space-y-4">
            <p className="text-sm">
              Sample C code using libwebsockets to create a WebSocket server:
            </p>
            
            <div className="bg-gray-900 rounded-md p-3 text-xs overflow-auto whitespace-pre">
              {`#include <libwebsockets.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

// Memory block representation
struct memory_block {
    int id;
    char type[20]; // "free", "used", "allocated", etc.
    int size;
    unsigned long address;
    int process_id;
    int page_number;
    int is_swapped;
};

// Memory statistics
struct memory_stats {
    int total_memory;
    int used_memory;
    int free_memory;
    int page_size;
    int total_pages;
    int used_pages;
    int swapped_pages;
    int kernel_memory;
    int system_memory;
};

// WebSocket callbacks would go here
// You'll need to convert your memory data to JSON
// and send it to connected clients

// Example JSON format:
// {
//   "type": "memoryUpdate",
//   "data": [{ ... memory blocks ... }]
// }

int main() {
    // Initialize libwebsockets
    // Start WebSocket server on port 8765
    // Send memory updates
    return 0;
}`}
            </div>
            
            <p className="text-sm text-muted-foreground">
              You'll need to install libwebsockets development libraries in your C environment.
            </p>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <div className="text-sm space-y-2">
              <h3 className="font-bold">Expected JSON Formats:</h3>
              
              <div>
                <h4 className="font-semibold text-xs uppercase text-muted-foreground">Memory Blocks Update:</h4>
                <div className="bg-gray-900 rounded-md p-3 text-xs overflow-auto whitespace-pre">
                  {`{
  "type": "memoryUpdate",
  "data": [
    {
      "id": "block-1",
      "type": "allocated",
      "size": 4,
      "address": 1024,
      "processId": 1,
      "pageNumber": 0,
      "isSwapped": false
    },
    // More blocks...
  ]
}`}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-xs uppercase text-muted-foreground">Memory Stats Update:</h4>
                <div className="bg-gray-900 rounded-md p-3 text-xs overflow-auto whitespace-pre">
                  {`{
  "type": "statsUpdate",
  "data": {
    "totalMemory": 1024,
    "usedMemory": 256,
    "freeMemory": 768,
    "pageSize": 4,
    "totalPages": 256,
    "usedPages": 64,
    "swappedPages": 8,
    "kernelMemory": 128,
    "systemMemory": 64
  }
}`}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BackendConnection;
