import flood from '../public/images/flood-recovery.jpg';
import emergency from '../public/images/emergency-aid.jpg';
import rebuild from '../public/images/rebuild-after.jpg';
import mobile from '../public/images/mobile-clinics.jpg';
import global from '../public/images/global-relief.jpg';
import combating from '../public/images/combating.jpg';
// import hurricane from '../public/images/hurricane-relief.jpg';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate the percentage of a target reached
 * @param current - Current amount
 * @param target - Target amount
 * @returns Percentage as a number (0-100)
 */
export const calculatePercentage = (current: number, target: number): number => {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
};

/**
 * Format a date to a human-readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get a color for each category
 * @param category - Category name
 * @returns CSS color value
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Natural Disasters': '#e63946',
    'Conflict Zone': '#457b9d',
    'Health Emergencies': '#2a9d8f',
    'Food & Water Crisis': '#e9c46a',
  };
  
  return colors[category] || '#4f46e5'; // Default color if category not found
};

/**
 * Generate a shareable URL for a cause
 * @param causeId - ID of the cause
 * @returns Shareable URL
 */
export const getShareableUrl = (causeId: string): string => {
  return `${window.location.origin}/causes/${causeId}`;
};

/**
 * Get social sharing URLs
 * @param url - URL to share
 * @param title - Title of the content
 * @returns Object with social sharing URLs
 */
export const getSocialShareUrls = (url: string, title: string): Record<string, string> => {
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this cause: ${url}`)}`,
  };
}; 

export const image: Record<string, string> = {
  'images/flood-recovery.jpg': flood,
  'images/emergency-aid.jpg': emergency,
  'images/rebuild-after.jpg': rebuild,
  'images/mobile-clinics.jpg': mobile,
  'images/global-relief.jpg': global,
  'images/combating.jpg': combating,
  // 'images/hurricane-relief.jpg': hurricane
}