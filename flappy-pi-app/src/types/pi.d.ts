interface Pi {
  authenticate?: () => Promise<any>;
  // Add other Pi SDK methods as needed
}

interface Window {
  Pi?: Pi;
} 