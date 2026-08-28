import { formatDistanceToNow, format, parseISO } from 'date-fns';

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Format a timestamp to a readable date
 */
export function formatDate(timestamp, formatStr = 'MMM d, yyyy') {
  if (!timestamp) return '';
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    return format(date, formatStr);
  } catch {
    return '';
  }
}

/**
 * Format a number with K/M suffixes
 */
export function formatCount(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
}

/**
 * Validate file type and size
 */
export function validateFile(file, allowedTypes, maxSize) {
  const errors = [];
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`);
  }
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
  }
  return errors;
}

/**
 * Generate initials from a name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Slugify a string for URLs
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Classnames utility — merges conditional classnames
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
