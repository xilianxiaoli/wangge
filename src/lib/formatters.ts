/**
 * Shared formatting utilities used across multiple components.
 */

/**
 * Format a numeric value as Chinese Yuan (CNY) currency.
 * @param value - The number to format
 * @param fractionDigits - Number of decimal places (default: 2)
 */
export const formatCurrency = (value: number, fractionDigits = 2): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/**
 * Format a numeric value as a percentage.
 * @param value - The percentage value (e.g. pass 12.5 for 12.50%)
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

/**
 * Format an ISO date string as a localised Chinese date/time string.
 * @param dateString - ISO 8601 date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format an ISO date string as a short localised Chinese date/time string.
 * @param dateString - ISO 8601 date string
 */
export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
