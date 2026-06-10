'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Layers, PieChart, ShieldAlert, Activity, FileText, Scale, PlusCircle, Send, Shield, Info, AlertTriangle, Terminal, Cpu } from 'lucide-react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { isMarketOpen, INDIAN_MARKET_MASTER } from '@/data/stocks';

interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  volatility: 'Low' | 'Medium' | 'Moderate' | 'High' | string;
  momentum: string;
  beta: number;
  drawdown: string;
  returnPct: number;
  lastTickDir?: 'up' | 'down' | 'neutral'; 
}

export default function Dashboard() {
  // Landing Welcome Engine Node Tracker
  const [isWorkspaceInitialized, setIsWorkspaceInitialized] = useState<boolean>(false);
  
  // Navigation Menu Hub matching the exact system views from the reference images
  const [currentView, setCurrentView] = useState<'dashboard' | 'portfolio' | 'risk' | 'momentum' | 'news' | 'rebalance'>('dashboard');
  
  const [queue, setQueue] = useState<Stock[]>([]);
  const [inputTicker, setInputTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [marketLiveStatus, setMarketLiveStatus] = useState(false);

  // Gemini Chatbot System State Hub
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>>([
    {
      role: 'model',
      parts: [{ text: 'SYSTEM INITIALIZED. I am your personalized SynthStock engine, backed by AETRIS-AI Labs. Query any structural strategy or system telemetry.' }]
    }
  ]);

  // Viewport Element References
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial Core Asset Seed Array Loading
  useEffect(() => {
    const initializeCoreFeeds = async () => {
      await fetchStockData('RELIANCE');
      await fetchStockData('TCS');
      const defaultAsset = await fetchStockData('INFY');
      if (defaultAsset) setSelectedStock(defaultAsset);
    };
    initializeCoreFeeds();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Market hours continuous validation poller 
  useEffect(() => {
    setMarketLiveStatus(isMarketOpen());
    const clockPoller = setInterval(() => {
      setMarketLiveStatus(isMarketOpen());
    }, 5000);
    return () => clearInterval(clockPoller);
  }, []);

  // High-Frequency Real-Time Asset Stream Engine
  useEffect(() => {
    if (queue.length === 0) return;

    const streamInterval = setInterval(() => {
      if (!isMarketOpen()) {
        setQueue(prevQueue =>
          prevQueue.map(stock => {
            const staticMaster = INDIAN_MARKET_MASTER[stock.ticker];
            if (!staticMaster) return stock;
            return {
              ...stock,
              price: staticMaster.closingPrice,
              change: staticMaster.closingPrice - staticMaster.prevClose,
              lastTickDir: 'neutral'
            };
          })
        );
        return;
      }

      setQueue(prevQueue => 
        prevQueue.map(stock => {
          const tickVariance = (Math.random() - 0.5) * (stock.price * 0.0004);
          const dynamicPrice = stock.price + tickVariance;
          const masterReference = INDIAN_MARKET_MASTER[stock.ticker];
          const previousClosingBase = masterReference ? masterReference.prevClose : (stock.price - stock.change);
          
          if (selectedStock && selectedStock.ticker === stock.ticker) {
            setSelectedStock(prev => prev ? { ...prev, price: dynamicPrice, change: dynamicPrice - previousClosingBase } : null);
          }

          return {
            ...stock,
            price: dynamicPrice,
            change: dynamicPrice - previousClosingBase,
            lastTickDir: tickVariance > 0 ? 'up' : 'down'
          };
        })
      );
    }, 900);

    return () => clearInterval(streamInterval);
  }, [queue.length, selectedStock?.ticker]);

  // Technical Candlestick Graph Mount Loop with customized Green & Red Chart nodes
  useEffect(() => {
    if (!isWorkspaceInitialized || currentView !== 'dashboard' || !selectedStock || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#a1a1aa',
      },
      width: chartContainerRef.current.clientWidth || 450,
      height: 250,
      grid: {
        vertLines: { color: '#16161d' },
        horzLines: { color: '#16161d' },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',         
      downColor: '#ef4444',       
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    const basePrice = selectedStock.price;
    const dataPoints = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const open = basePrice + (Math.random() * 20 - 10);
      const close = open + (Math.random() * 16 - 8);
      const high = Math.max(open, close) + (Math.random() * 6);
      const low = Math.min(open, close) - (Math.random() * 6);

      dataPoints.push({
        time: d.toISOString().split('T')[0],
        open: open,
        high: high,
        low: low,
        close: close,
      });
    }

    candlestickSeries.setData(dataPoints);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [selectedStock?.ticker, currentView, isWorkspaceInitialized]);

  const fetchStockData = async (ticker: string) => {
    try {
      const res = await fetch(`/api/stock?ticker=${ticker}`);
      const data = await res.json();
      if (res.ok) {
        const enrichedAsset = {
          ...data,
          beta: data.beta || parseFloat((Math.random() * 0.7 + 0.8).toFixed(2)),
          drawdown: data.drawdown || `-${(Math.random() * 12 + 4).toFixed(1)}%`,
          returnPct: data.returnPct || parseFloat((Math.random() * 16 - 6).toFixed(2))
        };
        setQueue(prev => {
          if (prev.some(s => s.ticker === data.ticker)) return prev;
          return [...prev, enrichedAsset];
        });
        setError('');
        return enrichedAsset;
      } else {
        setError(data.error || 'FAILED MATCHING ASSET PARAMETERS');
      }
    } catch (err) {
      setError('TELEMETRY TIMEOUT ERROR');
    }
    return null;
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTicker.trim()) return;
    setLoading(true);
    const searchTarget = inputTicker.toUpperCase().trim();
    const loadedData = await fetchStockData(searchTarget);
    if (loadedData) setSelectedStock(loadedData);
    setInputTicker('');
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatLoading(true);

    const updatedHistory = [
      ...chatHistory,
      { role: 'user' as const, parts: [{ text: userMessage }] }
    ];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory, currentQueue: queue })
      });
      const data = await response.json();
      if (response.ok) {
        setChatHistory([...updatedHistory, { role: 'model' as const, parts: [{ text: data.text }] }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const getRiskColor = (volatility: string) => {
    const vol = volatility.toLowerCase();
    if (vol === 'low') return { hex: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (vol === 'medium' || vol === 'moderate') return { hex: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    return { hex: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
  };

  const totalPortfolioSum = queue.reduce((acc, curr) => acc + (curr.price * 60), 0);
  const countLowRisk = queue.filter(s => s.volatility.toLowerCase() === 'low').length;
  const countMedRisk = queue.filter(s => s.volatility.toLowerCase() === 'medium' || s.volatility.toLowerCase() === 'moderate').length;
  const countHighRisk = queue.filter(s => s.volatility.toLowerCase() === 'high').length;
  const totalBullish = queue.filter(s => s.momentum === 'Bullish').length;

  // Render Cinematic Monochrome Welcome Screen if uninitialized
  if (!isWorkspaceInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 relative font-mono overflow-hidden select-none">
        
        {/* RUNNING BLACK & WHITE GEOMETRIC BACKGROUND MATRIX */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px] animate-[pulse_4s_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-3xl animate-[ping_10s_infinite]" />
        
        {/* WELCOME PORTAL CARD CONTAINER */}
        <div className="max-w-2xl w-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md p-8 text-center space-y-6 relative z-10 shadow-2xl">
          
          <div className="flex justify-center mb-2">
            <div className="relative w-16 h-16 border border-zinc-700 bg-black flex items-center justify-center">
              <Cpu className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-white">
              Welcome to SynthStocks
            </h1>
            <p className="text-[10px] text-zinc-400 tracking-widest font-sans font-bold uppercase">
              Powered Exclusively by AETRIS-AI Labs
            </p>
          </div>

          <div className="w-12 h-[1px] bg-white mx-auto" />

          <p className="text-zinc-400 text-xs leading-relaxed max-w-lg mx-auto uppercase text-center tracking-wide">
            SynthStock coordinates high-frequency asset streams, algorithmic trend diagnostics, and premium risk exposure matrices into a singular synchronized workspace terminal. Real-time Indian equity datasets calibrate natively to evaluate momentum deviations, volatility indices, and localized portfolio optimization metrics.
          </p>

          <div className="pt-4">
            <button 
              onClick={() => setIsWorkspaceInitialized(true)}
              className="bg-white text-black text-xs font-black uppercase px-8 py-3 tracking-widest transition-all hover:bg-zinc-200 hover:tracking-[0.15em] focus:outline-none flex items-center gap-2 mx-auto border border-white"
            >
              <Terminal className="w-3.5 h-3.5" /> Initialize Workspace
            </button>
          </div>
        </div>

        {/* FOOTER STEM FLAG */}
        <span className="absolute bottom-4 text-zinc-600 text-[9px] uppercase tracking-widest">
          SECURE EXCHANGE TERMINAL LAYER // V2.04
        </span>
      </div>
    );
  }

  // Render Operational Terminal Workspace View once initialized
  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono text-[11px] antialiased selection:bg-white selection:text-black animate-[fadeIn_0.5s_ease-out]">
      
      {/* HEADER CONTROLS NODE */}
      <header className="max-w-7xl mx-auto mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-zinc-800 bg-zinc-950 p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 border border-zinc-700 bg-black flex-shrink-0">
            <Image src="/logo.jpg" alt="SynthStock Core Icon" fill className="object-cover filter grayscale contrast-150" priority unoptimized />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-black tracking-tighter uppercase">SynthStock</h1>
              <span className="text-[8px] text-zinc-500 tracking-widest">BY AETRIS-AI LABS</span>
            </div>
            <p className="text-zinc-500 text-[9px] uppercase tracking-wider">High-Frequency Real-Time Asset Stream Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button className="border border-zinc-800 px-3 py-1.5 text-[10px] bg-black uppercase tracking-tight hover:bg-zinc-900 transition-all">
            ↑ Ingest CSV Portfolio
          </button>
          <div className="border border-zinc-800 px-3 py-1.5 text-[10px] bg-black text-zinc-400 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${marketLiveStatus ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
            <span>{marketLiveStatus ? 'LIVE TICKER ACTIVE' : 'MARKET LOCKED'}</span>
          </div>
        </div>
      </header>

      {/* SYSTEM ARCHITECTURE CONTENT GRID */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        
        {/* COLUMN 1: STARK NAVIGATION INDEX (Left Side Panel) */}
        <div className="lg:col-span-1 space-y-3">
          
          {/* Menu Options Controller Array exactly mapping the screens */}
          <div className="border border-zinc-800 bg-zinc-950 p-1.5 space-y-0.5">
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left uppercase transition-all ${currentView === 'dashboard' ? 'bg-white text-black font-bold' : 'hover:bg-zinc-900 text-zinc-400'}`}
            >
              <Layers className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('portfolio')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left uppercase transition-all ${currentView === 'portfolio' ? 'bg-white text-black font-bold' : 'hover:bg-zinc-900 text-zinc-400'}`}
            >
              <PieChart className="w-3.5 h-3.5" /> Portfolio
            </button>
            <button 
              onClick={() => setCurrentView('risk')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left uppercase transition-all ${currentView === 'risk' ? 'bg-white text-black font-bold' : 'hover:bg-zinc-900 text-zinc-400'}`}
            >
              <Shield className="w-3.5 h-3.5" /> Risk Analysis
            </button>
            <button 
              onClick={() => setCurrentView('momentum')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left uppercase transition-all ${currentView === 'momentum' ? 'bg-white text-black font-bold' : 'hover:bg-zinc-900 text-zinc-400'}`}
            >
              <Activity className="w-3.5 h-3.5" /> Momentum
            </button>
            <button 
              onClick={() => setCurrentView('news')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left uppercase transition-all ${currentView === 'news' ? 'bg-white text-black font-bold' : 'hover:bg-zinc-900 text-zinc-400'}`}
            >
              <FileText className="w-3.5 h-3.5" /> News & Events
            </button>
            <button 
              onClick={() => setCurrentView('rebalance')} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left uppercase transition-all ${currentView === 'rebalance' ? 'bg-white text-black font-bold' : 'hover:bg-zinc-900 text-zinc-400'}`}
            >
              <Scale className="w-3.5 h-3.5" /> Rebalance
            </button>
          </div>

          {/* Real-time Ticker Query Input Ingestion Form */}
          <div className="border border-zinc-800 bg-zinc-950 p-3 space-y-2">
            <form onSubmit={handleAddStock} className="flex gap-1">
              <input
                type="text"
                placeholder="ENTER ASSET TICKER ID..."
                value={inputTicker}
                onChange={(e) => setInputTicker(e.target.value)}
                className="flex-1 bg-black border border-zinc-800 px-2.5 py-2 text-white placeholder-zinc-700 text-[11px] uppercase focus:outline-none focus:border-zinc-500"
              />
              <button type="submit" className="bg-white text-black font-bold uppercase text-[10px] px-2.5 hover:bg-zinc-200 transition-colors">
                Analyze
              </button>
            </form>
            {error && (
              <div className="text-[9px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 p-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Dynamic Asset Grid Queue Selector */}
          <div className="border border-zinc-800 bg-zinc-950">
            <div className="px-3 py-2 border-b border-zinc-800 bg-black text-zinc-500 text-[9px] uppercase tracking-wider font-bold">
              Live Streaming Pipeline Feeds
            </div>
            <div className="divide-y divide-zinc-900 max-h-[220px] overflow-y-auto">
              {queue.map((stock) => {
                const isUp = stock.lastTickDir === 'up';
                const isDown = stock.lastTickDir === 'down';
                return (
                  <div 
                    key={stock.ticker} 
                    onClick={() => setSelectedStock(stock)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-all ${selectedStock?.ticker === stock.ticker ? 'bg-zinc-900 border-r border-white' : 'hover:bg-zinc-900/40'}`}
                  >
                    <div>
                      <span className="font-bold text-white block">{stock.ticker}</span>
                      <span className="text-[9px] text-zinc-500 truncate block max-w-[100px] uppercase">{stock.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-1.5 py-0.5 text-[10px] border block transition-colors ${
                        isUp ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' :
                        isDown ? 'bg-red-950/40 border-red-500 text-red-400' : 'bg-black border-zinc-800 text-zinc-400'
                      }`}>
                        ₹{stock.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Static Sidebar Metrics Panel pulled from Screen Footage layouts */}
          <div className="border border-zinc-800 bg-zinc-950 p-3 font-mono text-[10px]">
            <p className="text-zinc-500 uppercase tracking-tight mb-2">System Asset Value Valuation</p>
            <p className="text-base font-black text-white">₹{totalPortfolioSum ? totalPortfolioSum.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '2,68,912'}</p>
            <div className="mt-1 text-zinc-400 text-[9px] uppercase tracking-tighter">Current Portfolio Target Index</div>
          </div>
        </div>

        {/* COLUMN 2 & 3: MAIN WORKSPACE MATRIX VIEWS (Center Panel Router) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* VIEW A: STANDARD SYSTEM INITIALIZED DASHBOARD */}
          {currentView === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-zinc-800 bg-zinc-950 p-3 relative">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-tight">High Risk Trackers</p>
                  <h3 className={`text-xl font-black mt-1 ${countHighRisk > 0 ? 'text-red-400' : 'text-white'}`}>{countHighRisk}</h3>
                  <ShieldAlert className="w-4 h-4 text-zinc-600 absolute top-3 right-3" />
                </div>
                <div className="border border-zinc-800 bg-zinc-950 p-3 relative">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-tight">Bullish System Alignment</p>
                  <h3 className="text-xl font-black text-white mt-1">{totalBullish} <span className="text-xs font-normal text-zinc-600">/ {queue.length}</span></h3>
                  <Activity className="w-4 h-4 text-zinc-600 absolute top-3 right-3" />
                </div>
              </div>

              <div className="border border-zinc-800 bg-zinc-950 p-4">
                {selectedStock ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">{selectedStock.ticker} Terminal Feed</h3>
                        <p className="text-[9px] text-zinc-500 uppercase">{selectedStock.name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-white">₹{selectedStock.price.toFixed(2)}</span>
                        <span className={`text-[10px] ml-2 font-bold ${selectedStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)})
                        </span>
                      </div>
                    </div>
                    {/* Live Chart Target Canvas Element Container */}
                    <div ref={chartContainerRef} className="w-full bg-black border border-zinc-900 overflow-hidden" />
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center text-zinc-600 uppercase tracking-wider text-[10px]">
                    Select an entry from current pipeline arrays to initialize canvas terminal feed...
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW B: PORTFOLIO RISK SUMMARY DASHBOARD METRICS */}
          {currentView === 'portfolio' && (
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-4">
              <div className="border-b border-zinc-900 pb-2">
                <h2 className="text-sm font-black uppercase">Portfolio Status Overview</h2>
                <p className="text-[9px] text-zinc-400 uppercase mt-0.5">Summary metrics and core weight indices mapping</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="border border-emerald-500/20 bg-emerald-950/10 p-3">
                  <p className="text-[9px] text-emerald-500 uppercase font-bold">Low Risk Stocks</p>
                  <p className="text-base font-black text-emerald-400 mt-1">{countLowRisk}</p>
                </div>
                <div className="border border-amber-500/20 bg-amber-950/10 p-3">
                  <p className="text-[9px] text-amber-500 uppercase font-bold">Medium Risk Stocks</p>
                  <p className="text-base font-black text-amber-400 mt-1">{countMedRisk}</p>
                </div>
                <div className="border border-red-500/20 bg-red-950/10 p-3">
                  <p className="text-[9px] text-red-500 uppercase font-bold">High Risk Stocks</p>
                  <p className="text-base font-black text-red-400 mt-1">{countHighRisk}</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW C: FULL BLOWN RISK ANALYSIS VIEW (Scatter Matrix & Charts from Image) */}
          {currentView === 'risk' && (
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-4">
              <div className="border-b border-zinc-900 pb-1.5 flex justify-between items-baseline">
                <div>
                  <h2 className="text-sm font-black uppercase">Risk Analysis Suite</h2>
                  <p className="text-[9px] text-zinc-500 uppercase">Evaluate portfolio risk with volatility, beta, and drawdown metrics</p>
                </div>
              </div>

              {/* Advanced Risk vs Return Volatility Matrix Scatter Box from Image 5045 */}
              <div className="border border-zinc-900 bg-black p-3 space-y-2">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Risk vs Return Coordinate Space (Volatility vs P&L %)</p>
                <div className="relative border border-zinc-800 h-36 bg-zinc-950/40 grid grid-cols-4 grid-rows-4">
                  <div className="border-b border-r border-zinc-900/60" /><div className="border-b border-r border-zinc-900/60" /><div className="border-b border-r border-zinc-900/60" /><div className="border-b border-zinc-900/60" />
                  <div className="border-b border-r border-zinc-900/60" /><div className="border-b border-r border-zinc-900/60" /><div className="border-b border-r border-zinc-900/60" /><div className="border-b border-zinc-900/60" />
                  <div className="border-b border-r border-zinc-900/60" /><div className="border-b border-r border-zinc-900/60" /><div className="border-b border-r border-zinc-900/60" /><div className="border-b border-zinc-900/60" />
                  <div className="border-r border-zinc-900/60" /><div className="border-r border-zinc-900/60" /><div className="border-r border-zinc-900/60" /><div className="" />
                  
                  {queue.map((stock, i) => {
                    const cfg = getRiskColor(stock.volatility);
                    const positions = [
                      { top: '22%', left: '72%' },
                      { top: '68%', left: '42%' },
                      { top: '38%', left: '18%' },
                      { top: '12%', left: '88%' }
                    ];
                    const pos = positions[i % positions.length];
                    return (
                      <div 
                        key={stock.ticker}
                        style={{ top: pos.top, left: pos.left }}
                        className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 border flex items-center justify-center text-[10px] shadow-lg font-sans ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        title={`${stock.ticker}: Volatility Matrix Item`}
                      >
                        ●
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[8px] text-zinc-500 uppercase tracking-widest px-1">
                  <span>0% Volatility</span>
                  <span>18%</span>
                  <span>27%</span>
                  <span>36% Max</span>
                </div>
              </div>

              {/* Interactive Risk Heatmap Matrix block element grid row from Image 5046 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Risk Heatmap Blocks</p>
                <div className="grid grid-cols-4 gap-2">
                  {queue.map((stock) => {
                    const cfg = getRiskColor(stock.volatility);
                    return (
                      <div 
                        key={stock.ticker}
                        className={`p-2 border text-center transition-all ${cfg.bg} ${cfg.border} ${cfg.text}`}
                      >
                        <p className="text-[10px] font-black">{stock.ticker}</p>
                        <p className="text-[8px] opacity-90 uppercase tracking-tighter mt-0.5 font-bold">{stock.volatility} Risk</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Horizontal Breakdown Bars Layout from Image 5046 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Risk Factor Distribution Spectrum</p>
                <div className="bg-black p-3 border border-zinc-900 space-y-2">
                  {queue.map((stock) => {
                    const cfg = getRiskColor(stock.volatility);
                    const vol = stock.volatility.toLowerCase();
                    const fillerWidth = vol === 'high' ? 'w-4/5' : vol === 'medium' || vol === 'moderate' ? 'w-1/2' : 'w-1/4';
                    return (
                      <div key={stock.ticker} className="flex items-center text-[10px]">
                        <span className="w-14 text-zinc-400 font-bold">{stock.ticker}</span>
                        <div className="flex-1 bg-zinc-950 h-2 border border-zinc-900 mx-2 overflow-hidden">
                          <div className={`h-full ${fillerWidth} transition-all duration-300`} style={{ backgroundColor: cfg.hex }} />
                        </div>
                        <span className={`w-12 text-right uppercase text-[8px] font-bold ${cfg.text}`}>{stock.volatility}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW D: MOMENTUM ANALYSIS TRACK VIEW */}
          {currentView === 'momentum' && (
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-3">
              <div className="border-b border-zinc-900 pb-2">
                <h2 className="text-sm font-black uppercase">Momentum Strategy Metrics</h2>
                <p className="text-[9px] text-zinc-500 uppercase mt-0.5">Asset trajectory paths and positive alignment signals</p>
              </div>
              <div className="bg-black border border-zinc-900 divide-y divide-zinc-900">
                {queue.map(stock => {
                  const isBullish = stock.momentum === 'Bullish';
                  return (
                    <div key={stock.ticker} className="p-2.5 flex justify-between items-center">
                      <span className="text-white font-bold">{stock.ticker}</span>
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-tight border font-bold ${
                        isBullish ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}>
                        {stock.momentum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW E: NEWS & EVENTS FRAMEWORK CONTAINER VIEW */}
          {currentView === 'news' && (
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-3">
              <div className="border-b border-zinc-900 pb-2">
                <h2 className="text-sm font-black uppercase">News & System Events</h2>
                <p className="text-[9px] text-zinc-500 uppercase mt-0.5">Consolidated analytical dispatch monitoring</p>
              </div>
              <div className="space-y-2">
                <div className="border border-zinc-900 bg-black p-3">
                  <p className="text-[8px] text-zinc-500 font-bold">EXCHANGE RECONCILIATION DISPATCH</p>
                  <p className="text-zinc-300 mt-1 uppercase text-[10px]">Indian Market indices consolidation framework locked for standard cycle interval matching parameters.</p>
                </div>
                <div className="border border-zinc-900 bg-black p-3">
                  <p className="text-[8px] text-zinc-500 font-bold">AETRIS CORE STRATEGY DISPATCH</p>
                  <p className="text-zinc-300 mt-1 uppercase text-[10px]">Telemetry node streams linked seamlessly with local engine storage parameters cleanly.</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW F: REBALANCE OPTIMIZATION VIEW */}
          {currentView === 'rebalance' && (
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-3">
              <div className="border-b border-zinc-900 pb-2">
                <h2 className="text-sm font-black uppercase">Portfolio Rebalance Control Node</h2>
                <p className="text-[9px] text-zinc-500 uppercase mt-0.5">Under rebalancing protocol parameters to adjust target risk settings</p>
              </div>
              <div className="bg-black border border-zinc-900 p-4 text-center space-y-2.5">
                <p className="text-zinc-400 uppercase text-[10px] leading-relaxed">System tracking data detects variant alignment deviation within high risk sector fields.</p>
                <button className="bg-white text-black font-black uppercase px-4 py-2 hover:bg-zinc-200 transition-colors">
                  Execute Strategy Rebalance
                </button>
              </div>
            </div>
          )}

        </div>

        {/* COLUMN 4: LOCKED RIGHTSIDE GEMINI AETRIS-AI ANALYST CONTAINER PANEL (Preserved) */}
        <div className="lg:col-span-1 border border-zinc-800 bg-zinc-950 flex flex-col h-[560px]">
          <div className="p-3 border-b border-zinc-800 bg-black flex items-center gap-2">
            <div className="w-1 h-1 bg-emerald-400 animate-pulse" />
            <h2 className="font-black tracking-wider text-white text-[10px] uppercase">AETRIS-AI Core Analyst</h2>
          </div>
          
          {/* Chat Messaging Log Core Space */}
          <div className="p-3 flex-1 overflow-y-auto space-y-2.5 text-[10.5px] bg-black/40 scrollbar-none">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`p-2 border ${msg.role === 'user' ? 'bg-zinc-900 border-zinc-700 text-white ml-2' : 'bg-black border-zinc-900 text-zinc-400 mr-2'}`}>
                <p className="text-[8px] font-bold text-zinc-500 mb-1 tracking-wider uppercase">
                  {msg.role === 'user' ? '// USER PROMPT DISPATCH' : '// ANALYST STRATEGY CORE'}
                </p>
                <div className="whitespace-pre-wrap leading-normal uppercase tracking-tighter">{msg.parts[0].text}</div>
              </div>
            ))}
            {chatLoading && <div className="text-zinc-600 text-[9px] uppercase animate-pulse px-1 font-bold">Syncing strategy vectors...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* Interactive Input Form Control Field */}
          <form onSubmit={handleSendMessage} className="p-1.5 border-t border-zinc-800 bg-black flex gap-1">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ASK PORTFOLIO MATRIX..."
              className="flex-1 bg-zinc-950 text-[10.5px] border border-zinc-800 px-2 py-1.5 text-white focus:outline-none focus:border-zinc-600 uppercase tracking-tighter font-mono"
            />
            <button type="submit" className="bg-white text-black text-[10px] font-black uppercase px-2.5 transition-colors hover:bg-zinc-200">
              Send
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}