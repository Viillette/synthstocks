'use client';

import Dashboard from "../../components/Dashboard";
import { useTerminal } from "./TerminalContext";

export default function Home() {
  const { auditLogs } = useTerminal();

  return (
    <div className="relative min-h-screen bg-black text-white pb-6">
      {/* Your original existing dashboard feature stays untouched */}
      <Dashboard />

      {/* Persistent System Audit Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-zinc-950 border-t border-zinc-900 px-4 flex items-center justify-between text-[10px] text-zinc-500 font-mono z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            AETRIS CORE: ONLINE
          </span>
          <span>|</span>
          <span>SUBSYSTEM LINK: VERIFIED</span>
        </div>
        
        <div className="flex gap-4 truncate max-w-xl">
          {auditLogs && auditLogs.length > 0 ? (
            auditLogs.map((log: string, idx: number) => (
              <span key={idx} className="transition-opacity duration-300">
                {log}
              </span>
            ))
          ) : (
            <span className="text-zinc-700">[SYSTEM IDLE - MONITORING STREAM]</span>
          )}
        </div>
      </div>
    </div>
  );
}