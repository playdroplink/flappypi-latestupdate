// Script to add Socket.IO client to the HTML
// This should be run to add the Socket.IO client script to index.html

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Add Socket.IO client script before closing body tag
  const socketIOScript = `
  <!-- Socket.IO Client for Multiplayer -->
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
  <script>
    // Make io available globally
    window.io = io;
  </script>`;
  
  // Insert before closing body tag
  html = html.replace('</body>', `${socketIOScript}\n</body>`);
  
  fs.writeFileSync(indexPath, html);
  console.log('✅ Socket.IO client added to index.html');
} else {
  console.log('❌ index.html not found');
}
