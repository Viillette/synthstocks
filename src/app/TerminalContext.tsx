'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const TerminalContext = createContext<any>(null);

export const TerminalProvider = ({ children }: { children: ReactNode }) => {
  const [activeStocks, setActiveStocks] = useState<string[]>(['AAPL', 'TSLA']);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] AETRIS CORE INITIALIZED`
  ]);

  // Global function to push telemetry actions from anywhere in the app
  const addLog = (msg: string) => {
    setAuditLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg.toUpperCase()}`,
      ...prev
    ].slice(0, 3)); // Keeps the last 3 telemetry events visible
  };

  return (
    <TerminalContext.Provider value={{ activeStocks, setActiveStocks, auditLogs, addLog }}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => useContext(TerminalContext);