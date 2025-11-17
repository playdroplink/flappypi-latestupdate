import { useEffect, useState } from "react";

export function useNetworkQuality(pingUrl = "https://www.google.com/favicon.ico") {
  const [quality, setQuality] = useState<"good" | "slow" | "offline">("good");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkConnection = async () => {
      if (!navigator.onLine) {
        setQuality("offline");
        setLatency(null);
        return;
      }
      const start = Date.now();
      try {
        await fetch(pingUrl, { method: "HEAD", cache: "no-store" });
        const ms = Date.now() - start;
        setLatency(ms);
        setQuality(ms < 300 ? "good" : "slow");
      } catch {
        setQuality("offline");
        setLatency(null);
      }
    };

    checkConnection();
    interval = setInterval(checkConnection, 5000); // check every 5 seconds

    return () => clearInterval(interval);
  }, [pingUrl]);

  return { quality, latency };
} 