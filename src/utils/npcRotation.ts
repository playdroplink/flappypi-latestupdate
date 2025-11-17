// NPC Rotation Utility
// Ensures all NPCs are seen by implementing a systematic rotation system

// Array of all available NPC GIFs
export const npcGifs = [
  '/npc gif/npc-0.gif.gif',
  '/npc gif/npc-1.gif.gif',
  '/npc gif/npc-2.gif.gif',
  '/npc gif/npc-3.gif.gif',
  '/npc gif/npc-4.gif.gif',
  '/npc gif/npc-5.gif.gif',
  '/npc gif/npc-6.gif.gif',
  '/npc gif/npc-7.gif.gif',
  '/npc gif/npc-8.gif.gif',
  '/npc gif/npc-9.gif.gif',
  '/npc gif/npc-10.gif.gif',
  '/npc gif/npc-11.gif.gif',
  '/npc gif/npc-12.gif.gif',
];

// Global rotation indices for different NPC instances
const rotationIndices: Record<string, number> = {
  footer: 0,
  home: 0,
  shop: 0,
  leaderboard: 0,
  community: 0,
  default: 0,
};

// Function to get the next NPC in rotation for a specific instance
export const getNextNpcInRotation = (instance: string = 'default'): string => {
  const currentIndex = rotationIndices[instance] || 0;
  const npcGif = npcGifs[currentIndex];
  
  // Move to next NPC in rotation
  rotationIndices[instance] = (currentIndex + 1) % npcGifs.length;
  
  console.log(`🎮 NPC Rotation [${instance}]: Selected NPC ${currentIndex} of ${npcGifs.length}`);
  
  return npcGif;
};

// Function to get a random NPC GIF (for manual changes)
export const getRandomNpcGif = (): string => {
  const randomIndex = Math.floor(Math.random() * npcGifs.length);
  return npcGifs[randomIndex];
};

// Function to get current rotation status
export const getRotationStatus = (): Record<string, number> => {
  return { ...rotationIndices };
};

// Function to reset rotation for a specific instance
export const resetRotation = (instance: string = 'default'): void => {
  rotationIndices[instance] = 0;
  console.log(`🔄 NPC Rotation [${instance}]: Reset to beginning`);
};

// Function to reset all rotations
export const resetAllRotations = (): void => {
  Object.keys(rotationIndices).forEach(instance => {
    rotationIndices[instance] = 0;
  });
  console.log('🔄 All NPC Rotations: Reset to beginning');
};

// Function to get NPC info by index
export const getNpcInfo = (index: number) => {
  if (index < 0 || index >= npcGifs.length) {
    return null;
  }
  
  return {
    index,
    path: npcGifs[index],
    name: `NPC ${index}`,
    total: npcGifs.length
  };
};

// Function to get all NPC info
export const getAllNpcInfo = () => {
  return npcGifs.map((path, index) => getNpcInfo(index));
};

// Function to check if all NPCs have been seen for an instance
export const hasSeenAllNpcs = (instance: string = 'default'): boolean => {
  const currentIndex = rotationIndices[instance] || 0;
  return currentIndex === 0; // If we're back at 0, we've completed a full cycle
};

// Function to get remaining NPCs to see for an instance
export const getRemainingNpcs = (instance: string = 'default'): number => {
  const currentIndex = rotationIndices[instance] || 0;
  return npcGifs.length - currentIndex;
};
