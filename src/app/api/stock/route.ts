import { NextResponse } from 'next/server';
import { INDIAN_MARKET_MASTER } from '@/data/stocks';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase().trim();

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
  }

  // Check if we have the real closing asset context in our system dictionary
  const stockInfo = INDIAN_MARKET_MASTER[ticker];

  if (stockInfo) {
    return NextResponse.json({
      ticker: stockInfo.symbol,
      name: stockInfo.name,
      price: stockInfo.closingPrice,
      change: stockInfo.closingPrice - stockInfo.prevClose,
      volatility: 'High',
      momentum: (stockInfo.closingPrice - stockInfo.prevClose) >= 0 ? 'Bullish' : 'Bearish'
    });
  }

  // Dynamic fallback data frame for any generic searched asset symbols
  return NextResponse.json({
    ticker: ticker,
    name: `${ticker} Corporate Equity Asset`,
    price: 500.00,
    change: 0.00,
    volatility: 'Low',
    momentum: 'Neutral'
  });
}