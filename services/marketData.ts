/**
 * AETRIS-AI Service Layer
 * Centralized telemetry data fetching
 */
export async function fetchStockTelemetry(ticker: string) {
  try {
    const response = await fetch(`/api/stock?ticker=${ticker}`);
    if (!response.ok) throw new Error('Telemetry Link Error');
    return await response.json();
  } catch (error) {
    console.error('Market Data Service Failure:', error);
    return null;
  }
}