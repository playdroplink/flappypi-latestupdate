import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'ScreamPiPage.tsx');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // First, remove all malformed characters that are causing the unterminated regex error
  content = content.replace(/[^\x00-\x7F]+/g, '');
  
  // Fix the Tap Mode button emoji (should be 👆 not 🔊)
  content = content.replace(/<div className="text-4xl mb-4">🔊<\/div>/g, '<div className="text-4xl mb-4">👆</div>');
  
  // Restore all missing emojis properly
  content = content.replace(/ Scream Pi!/g, '🎤 Scream Pi!');
  content = content.replace(/<div className="text-4xl mb-4"><\/div>/g, '<div className="text-4xl mb-4">🔊</div>');
  content = content.replace(/<div className="text-2xl mb-2"><\/div>/g, '<div className="text-2xl mb-2">📚</div>');
  content = content.replace(/<button onClick={togglePause} className="text-xl text-black"><\/button>/g, '<button onClick={togglePause} className="text-xl text-black">⏸️</button>');
  content = content.replace(/<div className="text-lg text-black"><\/div>/g, '<div className="text-lg text-black">🎯</div>');
  content = content.replace(/<span className="text-xl"><\/span>/g, '<span className="text-xl">🪙</span>');
  content = content.replace(/<span className="text-3xl"><\/span>/g, '<span className="text-3xl">🔒</span>');
  content = content.replace(/<span className="text-2xl mb-2"><\/span>/g, '<span className="text-2xl mb-2">📖</span>');
  content = content.replace(/<div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"><\/div>/g, '<div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">✓</div>');
  content = content.replace(/ Learn How to Play/g, '📚 Learn How to Play');
  
  // Fix any malformed text in alerts or other places
  content = content.replace(/unlock🎤 Scream Pi!/g, 'unlock 🎤 Scream Pi!');
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Fixed all remaining issues in ScreamPiPage.tsx');
} catch (error) {
  console.error('❌ Error fixing file:', error);
} 