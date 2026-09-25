/**
 * Performance Calculator for NSE securities and sector indices.
 * 
 * Baseline is strictly the previous trading-session close.
 * Formula: changePercent = ((currentValue - previousClose) / previousClose) * 100
 */

export class PerformanceCalculator {
  /**
   * Calculates performance percentage against previous close baseline.
   * Returns NaN if either value is invalid, null, undefined, or if previousClose <= 0.
   */
  public static calculateChangePercent(
    currentValue: number | undefined | null,
    previousClose: number | undefined | null
  ): number {
    if (
      currentValue === undefined ||
      currentValue === null ||
      Number.isNaN(currentValue) ||
      previousClose === undefined ||
      previousClose === null ||
      Number.isNaN(previousClose) ||
      previousClose <= 0
    ) {
      return Number.NaN;
    }

    const rawPercent = ((currentValue - previousClose) / previousClose) * 100;
    // Round to 4 decimal places internally to avoid JavaScript floating point errors
    return Math.round(rawPercent * 10000) / 10000;
  }

  /**
   * Calculates absolute price difference: (currentValue - previousClose)
   */
  public static calculateAbsoluteChange(
    currentValue: number | undefined | null,
    previousClose: number | undefined | null
  ): number {
    if (
      currentValue === undefined ||
      currentValue === null ||
      Number.isNaN(currentValue) ||
      previousClose === undefined ||
      previousClose === null ||
      Number.isNaN(previousClose)
    ) {
      return Number.NaN;
    }
    return Math.round((currentValue - previousClose) * 100) / 100;
  }

  /**
   * Format percentage for display with explicit directional sign
   * Example: +2.83% or -1.45% or 0.00% or "N/A"
   */
  public static formatPercent(val: number | null | undefined): string {
    if (val === null || val === undefined || Number.isNaN(val)) {
      return 'N/A';
    }
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  }

  /**
   * Format currency/price in Indian Rupee notation
   */
  public static formatINR(val: number | null | undefined): string {
    if (val === null || val === undefined || Number.isNaN(val)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }
}
