
import React from 'react';

const factStyle = 'text-base flex items-start gap-2 mb-2';

export default function MemoryFacts() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8 shadow space-y-2 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">Key Concepts & Facts (Virtual Memory)</h2>
      <ul>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-blue-400 inline-block" /> 
          <span className="text-blue-400 font-medium">Each program has virtual memory space.</span>
        </li>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-emerald-500 inline-block" /> 
          <span className="text-emerald-500 font-medium">Physical memory usually means RAM.</span>
        </li>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-orange-400 inline-block" /> 
          <span className="text-orange-400 font-medium">Virtual and Physical memory is split into pages.</span>
        </li>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-yellow-300 inline-block" /> 
          <span>
            <span className="text-yellow-300 font-medium">Last 12 bits (for </span>
            <span className="text-yellow-300 font-bold">4KiB</span>
            <span className="text-yellow-300 font-medium"> pages) are called offset.</span>
          </span>
        </li>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-gray-300 inline-block" /> 
          <span className="text-gray-200">Remaining bits are called virtual and physical page numbers.</span>
        </li>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-orange-400 inline-block" /> 
          <span className="text-orange-400 font-medium">Page table maps VPN to PPN.</span>
        </li>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-gray-200 inline-block" /> 
          <span className="text-gray-100">One page table per program.</span>
        </li>
        <li className={factStyle}>
          <span className="mt-1 w-4 h-4 rounded-full bg-rose-500 inline-block" /> 
          <span>
            <span className="text-rose-500 font-bold">Page fault</span>
            <span className="text-rose-500 font-medium"> is an exception raised when corresponding data is not in </span>
            <span className="text-rose-500 font-bold">RAM</span>
          </span>
        </li>
      </ul>
    </div>
  );
}
