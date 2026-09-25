import { SectorIndex, Stock } from '../domain/types.ts';

export interface SectorDefinition {
  symbol: string;
  name: string;
  previousClose: number;
  initialCurrentValue: number;
}

export const INITIAL_NSE_SECTORS: SectorDefinition[] = [
  {
    symbol: 'NIFTY IT',
    name: 'Nifty IT',
    previousClose: 39420.50,
    initialCurrentValue: 40536.10, // +2.83%
  },
  {
    symbol: 'NIFTY BANK',
    name: 'Nifty Bank',
    previousClose: 51240.25,
    initialCurrentValue: 52475.15, // +2.41%
  },
  {
    symbol: 'NIFTY AUTO',
    name: 'Nifty Auto',
    previousClose: 24890.10,
    initialCurrentValue: 25368.00, // +1.92%
  },
  {
    symbol: 'NIFTY PHARMA',
    name: 'Nifty Pharma',
    previousClose: 21850.40,
    initialCurrentValue: 21345.65, // -2.31%
  },
  {
    symbol: 'NIFTY FMCG',
    name: 'Nifty FMCG',
    previousClose: 57420.80,
    initialCurrentValue: 55847.45, // -2.74%
  },
  {
    symbol: 'NIFTY REALTY',
    name: 'Nifty Realty',
    previousClose: 1045.20,
    initialCurrentValue: 1011.65, // -3.21%
  },
  {
    symbol: 'NIFTY METAL',
    name: 'Nifty Metal',
    previousClose: 9340.50,
    initialCurrentValue: 9415.20, // +0.80%
  },
  {
    symbol: 'NIFTY ENERGY',
    name: 'Nifty Energy',
    previousClose: 38650.00,
    initialCurrentValue: 38920.50, // +0.70%
  },
  {
    symbol: 'NIFTY FIN SERVICE',
    name: 'Nifty Financial Services',
    previousClose: 23150.30,
    initialCurrentValue: 23428.10, // +1.20%
  },
  {
    symbol: 'NIFTY PSU BANK',
    name: 'Nifty PSU Bank',
    previousClose: 6920.40,
    initialCurrentValue: 6996.50, // +1.10%
  },
  {
    symbol: 'NIFTY HEALTHCARE',
    name: 'Nifty Healthcare',
    previousClose: 13450.60,
    initialCurrentValue: 13343.00, // -0.80%
  },
  {
    symbol: 'NIFTY MEDIA',
    name: 'Nifty Media',
    previousClose: 2040.50,
    initialCurrentValue: 2022.15, // -0.90%
  },
];

export interface StockDefinition {
  symbol: string;
  companyName: string;
  sector: string;
  previousClose: number;
  initialLtp: number;
  initialVolume: number;
  isHalted?: boolean;
}

export const INITIAL_NSE_STOCKS: StockDefinition[] = [
  // --- NIFTY IT ---
  { symbol: 'INFY', companyName: 'Infosys Limited', sector: 'NIFTY IT', previousClose: 1845.50, initialLtp: 1940.90, initialVolume: 4892300 }, // +5.17%
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', sector: 'NIFTY IT', previousClose: 4120.00, initialLtp: 4251.85, initialVolume: 2104500 }, // +3.20%
  { symbol: 'WIPRO', companyName: 'Wipro Limited', sector: 'NIFTY IT', previousClose: 520.40, initialLtp: 535.50, initialVolume: 3410200 }, // +2.90%
  { symbol: 'HCLTECH', companyName: 'HCL Technologies Ltd', sector: 'NIFTY IT', previousClose: 1740.00, initialLtp: 1785.25, initialVolume: 1850100 }, // +2.60%
  { symbol: 'TECHM', companyName: 'Tech Mahindra Limited', sector: 'NIFTY IT', previousClose: 1560.80, initialLtp: 1595.10, initialVolume: 1240900 }, // +2.20%
  { symbol: 'LTIM', companyName: 'LTIMindtree Limited', sector: 'NIFTY IT', previousClose: 5850.00, initialLtp: 5937.75, initialVolume: 490200 }, // +1.50%

  // --- NIFTY BANK ---
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', sector: 'NIFTY BANK', previousClose: 1640.00, initialLtp: 1690.85, initialVolume: 9450300 }, // +3.10%
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Limited', sector: 'NIFTY BANK', previousClose: 1210.50, initialLtp: 1244.40, initialVolume: 8120400 }, // +2.80%
  { symbol: 'AXISBANK', companyName: 'Axis Bank Limited', sector: 'NIFTY BANK', previousClose: 1180.00, initialLtp: 1209.50, initialVolume: 5320100 }, // +2.50%
  { symbol: 'KOTAKBANK', companyName: 'Kotak Mahindra Bank Ltd', sector: 'NIFTY BANK', previousClose: 1780.20, initialLtp: 1812.25, initialVolume: 2890500 }, // +1.80%
  { symbol: 'INDUSINDBK', companyName: 'IndusInd Bank Limited', sector: 'NIFTY BANK', previousClose: 1410.00, initialLtp: 1428.35, initialVolume: 1980300 }, // +1.30%
  { symbol: 'FEDERALBNK', companyName: 'The Federal Bank Limited', sector: 'NIFTY BANK', previousClose: 190.50, initialLtp: 192.60, initialVolume: 6200100 }, // +1.10%

  // --- NIFTY AUTO ---
  { symbol: 'M&M', companyName: 'Mahindra & Mahindra Ltd', sector: 'NIFTY AUTO', previousClose: 2950.00, initialLtp: 3044.40, initialVolume: 3120400 }, // +3.20%
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', sector: 'NIFTY AUTO', previousClose: 940.50, initialLtp: 966.85, initialVolume: 7420100 }, // +2.80%
  { symbol: 'BAJAJ-AUTO', companyName: 'Bajaj Auto Limited', sector: 'NIFTY AUTO', previousClose: 11200.00, initialLtp: 11446.40, initialVolume: 412000 }, // +2.20%
  { symbol: 'MARUTI', companyName: 'Maruti Suzuki India Ltd', sector: 'NIFTY AUTO', previousClose: 12350.00, initialLtp: 12560.00, initialVolume: 590300 }, // +1.70%
  { symbol: 'EICHERMOT', companyName: 'Eicher Motors Limited', sector: 'NIFTY AUTO', previousClose: 4850.00, initialLtp: 4913.05, initialVolume: 620100 }, // +1.30%
  { symbol: 'HEROMOTOCO', companyName: 'Hero MotoCorp Limited', sector: 'NIFTY AUTO', previousClose: 5410.00, initialLtp: 5464.10, initialVolume: 510400 }, // +1.00%

  // --- NIFTY REALTY (Lowest Sector #1) ---
  { symbol: 'DLF', companyName: 'DLF Limited', sector: 'NIFTY REALTY', previousClose: 840.00, initialLtp: 789.25, initialVolume: 4320100 }, // -6.04%
  { symbol: 'GODREJPROP', companyName: 'Godrej Properties Limited', sector: 'NIFTY REALTY', previousClose: 2980.00, initialLtp: 2833.95, initialVolume: 1240300 }, // -4.90%
  { symbol: 'OBEROIRLTY', companyName: 'Oberoi Realty Limited', sector: 'NIFTY REALTY', previousClose: 1820.00, initialLtp: 1738.10, initialVolume: 980400 }, // -4.50%
  { symbol: 'PHOENIXLTD', companyName: 'The Phoenix Mills Limited', sector: 'NIFTY REALTY', previousClose: 1650.00, initialLtp: 1595.55, initialVolume: 640100 }, // -3.30%
  { symbol: 'BRIGADE', companyName: 'Brigade Enterprises Limited', sector: 'NIFTY REALTY', previousClose: 1210.00, initialLtp: 1183.35, initialVolume: 510000 }, // -2.20%

  // --- NIFTY FMCG (Lowest Sector #2) ---
  { symbol: 'NESTLEIND', companyName: 'Nestle India Limited', sector: 'NIFTY FMCG', previousClose: 2480.00, initialLtp: 2378.35, initialVolume: 1120400 }, // -4.10%
  { symbol: 'BRITANNIA', companyName: 'Britannia Industries Ltd', sector: 'NIFTY FMCG', previousClose: 5850.00, initialLtp: 5633.55, initialVolume: 890200 }, // -3.70%
  { symbol: 'HINDUNILVR', companyName: 'Hindustan Unilever Limited', sector: 'NIFTY FMCG', previousClose: 2840.00, initialLtp: 2743.45, initialVolume: 2940300 }, // -3.40%
  { symbol: 'ITC', companyName: 'ITC Limited', sector: 'NIFTY FMCG', previousClose: 495.00, initialLtp: 482.60, initialVolume: 8210400 }, // -2.50%
  { symbol: 'TATACONSUM', companyName: 'Tata Consumer Products Ltd', sector: 'NIFTY FMCG', previousClose: 1150.00, initialLtp: 1128.15, initialVolume: 1640200 }, // -1.90%
  { symbol: 'DABUR', companyName: 'Dabur India Limited', sector: 'NIFTY FMCG', previousClose: 610.00, initialLtp: 601.45, initialVolume: 1420100 }, // -1.40%

  // --- NIFTY PHARMA (Lowest Sector #3) ---
  { symbol: 'CIPLA', companyName: 'Cipla Limited', sector: 'NIFTY PHARMA', previousClose: 1620.00, initialLtp: 1547.10, initialVolume: 2310400 }, // -4.50%
  { symbol: 'DRREDDY', companyName: 'Dr. Reddy\'s Laboratories Ltd', sector: 'NIFTY PHARMA', previousClose: 6580.00, initialLtp: 6323.40, initialVolume: 740100 }, // -3.90%
  { symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical Ind Ltd', sector: 'NIFTY PHARMA', previousClose: 1820.00, initialLtp: 1761.75, initialVolume: 2840200 }, // -3.20%
  { symbol: 'DIVISLAB', companyName: 'Divi\'s Laboratories Limited', sector: 'NIFTY PHARMA', previousClose: 5210.00, initialLtp: 5085.00, initialVolume: 610300 }, // -2.40%
  { symbol: 'ZYDUSLIFE', companyName: 'Zydus Lifesciences Limited', sector: 'NIFTY PHARMA', previousClose: 1040.00, initialLtp: 1021.25, initialVolume: 1140000 }, // -1.80%

  // --- NIFTY METAL ---
  { symbol: 'TATASTEEL', companyName: 'Tata Steel Limited', sector: 'NIFTY METAL', previousClose: 152.00, initialLtp: 154.25, initialVolume: 12400300 }, // +1.48%
  { symbol: 'JSWSTEEL', companyName: 'JSW Steel Limited', sector: 'NIFTY METAL', previousClose: 980.00, initialLtp: 991.75, initialVolume: 2410200 }, // +1.20%
  { symbol: 'HINDALCO', companyName: 'Hindalco Industries Limited', sector: 'NIFTY METAL', previousClose: 680.00, initialLtp: 686.10, initialVolume: 3840100 }, // +0.90%
  { symbol: 'VEDL', companyName: 'Vedanta Limited', sector: 'NIFTY METAL', previousClose: 460.00, initialLtp: 462.30, initialVolume: 6120400 }, // +0.50%

  // --- NIFTY ENERGY ---
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Limited', sector: 'NIFTY ENERGY', previousClose: 2940.00, initialLtp: 2975.30, initialVolume: 5120400 }, // +1.20%
  { symbol: 'NTPC', companyName: 'NTPC Limited', sector: 'NIFTY ENERGY', previousClose: 395.00, initialLtp: 398.95, initialVolume: 7420100 }, // +1.00%
  { symbol: 'ONGC', companyName: 'Oil & Natural Gas Corp Ltd', sector: 'NIFTY ENERGY', previousClose: 290.00, initialLtp: 291.45, initialVolume: 9140200 }, // +0.50%
  { symbol: 'POWERGRID', companyName: 'Power Grid Corp of India', sector: 'NIFTY ENERGY', previousClose: 330.00, initialLtp: 331.30, initialVolume: 4210300 }, // +0.40%

  // --- NIFTY PSU BANK ---
  { symbol: 'SBIN', companyName: 'State Bank of India', sector: 'NIFTY PSU BANK', previousClose: 810.00, initialLtp: 824.60, initialVolume: 11200400 }, // +1.80%
  { symbol: 'BANKBARODA', companyName: 'Bank of Baroda', sector: 'NIFTY PSU BANK', previousClose: 245.00, initialLtp: 248.65, initialVolume: 6410200 }, // +1.50%
  { symbol: 'PNB', companyName: 'Punjab National Bank', sector: 'NIFTY PSU BANK', previousClose: 112.00, initialLtp: 113.35, initialVolume: 14201000 }, // +1.20%

  // --- NIFTY MEDIA (Contains only 2 stocks to test edge-case: "Only 2 eligible stocks available") ---
  { symbol: 'ZEEL', companyName: 'Zee Entertainment Enterprises Ltd', sector: 'NIFTY MEDIA', previousClose: 135.00, initialLtp: 133.10, initialVolume: 5410000 }, // -1.40%
  { symbol: 'PVRINOX', companyName: 'PVR INOX Limited', sector: 'NIFTY MEDIA', previousClose: 1540.00, initialLtp: 1530.75, initialVolume: 820400 }, // -0.60%

  // --- HALTED STOCK FOR TESTING ---
  { symbol: 'TESTHALT', companyName: 'NSE Halted Security Demo Ltd', sector: 'NIFTY IT', previousClose: 100.00, initialLtp: 100.00, initialVolume: 0, isHalted: true },
];

/**
 * Normalizes initial definitions into domain model objects with baseline formula
 */
export function buildInitialSectorIndex(def: SectorDefinition, timestamp: number = Date.now()): SectorIndex {
  const change = Math.round((def.initialCurrentValue - def.previousClose) * 100) / 100;
  const changePercent = Math.round(((def.initialCurrentValue - def.previousClose) / def.previousClose) * 10000) / 100;
  return {
    name: def.name,
    symbol: def.symbol,
    previousClose: def.previousClose,
    currentValue: def.initialCurrentValue,
    change,
    changePercent,
    timestamp,
    dataStatus: 'MOCK',
  };
}

export function buildInitialStock(def: StockDefinition, timestamp: number = Date.now()): Stock {
  const change = Math.round((def.initialLtp - def.previousClose) * 100) / 100;
  const changePercent = Math.round(((def.initialLtp - def.previousClose) / def.previousClose) * 10000) / 100;
  return {
    symbol: def.symbol,
    companyName: def.companyName,
    exchange: 'NSE',
    sector: def.sector,
    previousClose: def.previousClose,
    ltp: def.initialLtp,
    change,
    changePercent,
    volume: def.initialVolume,
    timestamp,
    dataStatus: def.isHalted ? 'HALTED' : 'MOCK',
    isHalted: def.isHalted,
  };
}
