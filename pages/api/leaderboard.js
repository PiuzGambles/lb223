export default async function handler(req, res) {
  const banditToken = "b98726a4c3542fbb3d8605938108cbef:29b010c44d00d548c4c7ea8837bf615e2fb4058ce375839caaa4ee306ce820e7";
  const steamAPIKey = "BDF048EB98B238D5D5032D93B2A0AC9E";

  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - diffToMonday);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  const API_URL = `https://api.bandit.camp/affiliates/leaderboard?limit=30&start=${start}&end=${end}`;

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${banditToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: "Failed to fetch from Bandit API", details: errorText });
    }

    const banditData = await response.json();
    const steamIDs = banditData.response.map(user => user.steamid).join(',');

    const steamRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamAPIKey}&steamids=${steamIDs}`);
    const steamData = await steamRes.json();

    // Об’єднуємо Bandit і Steam дані
    const merged = banditData.response.map(user => {
      const steamUser = steamData.response.players.find(p => p.steamid === user.steamid);
      return {
        ...user,
        nickname: steamUser?.personaname || "Unknown",
        avatar: steamUser?.avatarfull || null
      };
    });

    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}