// Format date to Polish locale (23 mar 2025)
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Get color for danger level
export function getDangerLevelColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-green-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-orange-500';
    case 4:
      return 'bg-red-500';
    case 5:
      return 'bg-red-800';
    default:
      return 'bg-gray-500';
  }
}

// Get text color for danger level
export function getDangerLevelTextColor(level: number): string {
  switch (level) {
    case 1:
      return 'text-green-500';
    case 2:
      return 'text-yellow-500';
    case 3:
      return 'text-orange-500';
    case 4:
      return 'text-red-500';
    case 5:
      return 'text-red-800';
    default:
      return 'text-gray-500';
  }
}

// Get border color for danger level
export function getDangerLevelBorderColor(level: number): string {
  switch (level) {
    case 1:
      return 'border-green-500';
    case 2:
      return 'border-yellow-500';
    case 3:
      return 'border-orange-500';
    case 4:
      return 'border-red-500';
    case 5:
      return 'border-red-800';
    default:
      return 'border-gray-500';
  }
}

// Truncate text to a specified length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Get human-readable danger level
export function getDangerLevelText(level: number): string {
  switch (level) {
    case 1:
      return 'Low';
    case 2:
      return 'Moderate';
    case 3:
      return 'Considerable';
    case 4:
      return 'High';
    case 5:
      return 'Extreme';
    default:
      return 'Unknown';
  }
}