function isPiBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("pi browser");
}

// Example usage
if (isPiBrowser()) {
    console.log("You are using the Pi Browser!");
    // Add specific logic for Pi Browser here
} else {
    console.log("You are not using the Pi Browser.");
    // Add fallback logic for other browsers here
}

function BrowserDetection() {
  return (
    <div>
      <h1>Browser Detection</h1>
      <p>This application works best in the Pi Browser.</p>
    </div>
  );
}

export default BrowserDetection;