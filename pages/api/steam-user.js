const STEAM_API_KEY = "BDF048EB98B238D5D5032D93B2A0AC9E";

export default async function handler(req, res) {
  const { steamid } = req.query;
  if (!steamid) {
    return res.status(400).json({ error: "steamid is required" });
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamid}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from Steam API" });
    }
    const data = await response.json();
    if (!data.response.players.length) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.status(200).json(data.response.players[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}