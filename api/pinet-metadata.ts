import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: "Flappy Pi",
    description: "The first play-to-earn Flappy Pi game on Pi Network. Earn Pi, collect NFTs, and compete globally!",
    icon: "https://flappypi2807.pinet.com/pi-logo.png",
    website: "https://flappypi2807.pinet.com",
    support_email: "support@flappypi.fun",
    version: "3.0.0"
    // Add any other fields required by PiNet here
  });
} 