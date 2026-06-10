export interface StockMetadata {
  symbol: string;
  name: string;
  closingPrice: number;
  prevClose: number;
}

export const INDIAN_MARKET_MASTER: Record<string, StockMetadata> = {
  ZOMATO: {
    symbol: 'ZOMATO',
    name: 'Zomato Limited',
    closingPrice: 250.58,
    prevClose: 256.51
  },
  INFY: {
    symbol: 'INFY',
    name: 'Infosys Limited',
    closingPrice: 1160.90,
    prevClose: 1159.90
  },
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    closingPrice: 1321.20,
    prevClose: 1350.50
  },
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    closingPrice: 3850.00,
    prevClose: 3820.00
  }
};

export const isMarketOpen = (): boolean => {
  const now = new Date();
  
  // Convert current system clock to Indian Standard Time (IST)
  const localIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = localIST.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = localIST.getHours();
  const minutes = localIST.getMinutes();
  
  // Market closed on Weekends (Saturday & Sunday)
  if (day === 0 || day === 6) return false;
  
  // Active trading period: 09:15 to 15:30 (3:30 PM) IST
  const timeInMinutes = hours * 60 + minutes;
  const marketOpenTime = 9 * 60 + 15;
  const marketCloseTime = 15 * 60 + 30;
  
  return timeInMinutes >= marketOpenTime && timeInMinutes <= marketCloseTime;
};