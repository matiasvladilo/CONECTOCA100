/**
 * Utility functions for formatting Chilean pesos (CLP)
 */

/**
 * Formats a number as Chilean pesos
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the $ symbol (default: true)
 * @returns Formatted string (e.g., "$5.000" or "5.000")
 */
export function formatCLP(amount: number, showSymbol: boolean = true): string {
  // Format with dot as thousand separator and no decimals
  const formatted = Math.round(amount).toLocaleString('es-CL');
  return showSymbol ? `$${formatted}` : formatted;
}

/**
 * Parses a Chilean peso string into a number
 * Accepts formats like: "5.000", "5000", "$5.000", etc.
 * @param value - The string value to parse
 * @returns The numeric value
 */
export function parseCLP(value: string): number {
  // Remove $ symbol and any spaces
  const cleaned = value.replace(/\$/g, '').replace(/\s/g, '');
  
  // Remove dots (thousand separators)
  const withoutDots = cleaned.replace(/\./g, '');
  
  // Parse as integer (Chilean pesos don't use decimals in practice)
  return parseInt(withoutDots) || 0;
}

/**
 * Formats an input value as the user types in Chilean peso format
 * @param value - The current input value
 * @returns Formatted string
 */
export function formatCLPInput(value: string): string {
  // Remove all non-numeric characters
  const numericOnly = value.replace(/[^\d]/g, '');
  
  if (!numericOnly) return '';
  
  // Convert to number and format
  const number = parseInt(numericOnly);
  return formatCLP(number, false);
}
