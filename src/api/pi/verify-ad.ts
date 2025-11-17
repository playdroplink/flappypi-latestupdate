// Standard Node.js/Express handler for ad verification
const fetch = require('node-fetch');

module.exports = async function (req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { adId } = req.body;
  if (!adId) return res.status(400).json({ error: 'Missing adId' });
  const piRes = await fetch(`https://api.minepi.com/ads_network/status/${adId}`, {
    headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` }
  });
  if (!piRes.ok) return res.status(400).json({ error: 'Ad verification failed' });
  const adStatus = await piRes.json();
  if (adStatus.mediator_ack_status === 'granted') {
    // Grant reward to user here if needed
    return res.json({ success: true });
  }
  return res.status(400).json({ error: 'Ad not granted' });
}; 