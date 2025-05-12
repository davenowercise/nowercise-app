import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNowStrict, format as formatDate } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return "U"; // Default for unknown
  
  let initials = "";
  
  if (firstName) {
    initials += firstName[0].toUpperCase();
  }
  
  if (lastName) {
    initials += lastName[0].toUpperCase();
  } else if (initials.length === 0 && firstName && firstName.length > 1) {
    // If no last name but first name is at least 2 characters, use first two chars
    initials = firstName.substring(0, 2).toUpperCase();
  }
  
  return initials;
}

export function formatDistanceToNow(date: Date): string {
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch (error) {
    return "Invalid date";
  }
}

export { formatDate };

// Format a date to string
export function formatDateString(dateString: string, formatStr: string = "MMM d, yyyy"): string {
  try {
    return formatDate(new Date(dateString), formatStr);
  } catch (error) {
    return "Invalid date";
  }
}

// Determine if a date is today
export function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Calculate percentage between two values
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Create a simple hash from a string for keying
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}
