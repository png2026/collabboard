export const COLORS = [
  { name: 'Yellow', value: '#FDE68A', dark: '#FCD34D' },
  { name: 'Pink', value: '#FBCFE8', dark: '#F9A8D4' },
  { name: 'Blue', value: '#BFDBFE', dark: '#93C5FD' },
  { name: 'Green', value: '#BBF7D0', dark: '#86EFAC' },
  { name: 'Purple', value: '#DDD6FE', dark: '#C4B5FD' },
  { name: 'Orange', value: '#FED7AA', dark: '#FDBA74' },
  { name: 'Red', value: '#FECACA', dark: '#FCA5A5' },
  { name: 'Gray', value: '#E5E7EB', dark: '#D1D5DB' },
  { name: 'Black', value: '#1F2937', dark: '#111827' },
];

export const DEFAULT_COLOR = COLORS[0].value; // Yellow

export const TYPE_DEFAULT_COLORS = {
  stickyNote: '#FDE68A', // Yellow
  rectangle: '#E5E7EB',  // Gray
  circle: '#E5E7EB',     // Gray
  line: '#6B7280',        // Medium gray
  text: '#374151',        // Dark gray
  frame: '#6B7280',       // Medium gray
};

export function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)].value;
}

export function getUserColor(userId) {
  // Generate consistent color for user based on their ID
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index].value;
}
