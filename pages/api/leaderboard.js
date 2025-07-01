export default async function handler(req, res) {
  const API_KEY = "05a25c16c27c89e005184035acf58f07:9a79e2a1613650488d42a24e99e4ab5aea5127a303e1c72a021f910d10ce32f4";
  const API_URL = "https://api.bandit.camp/affiliates/top"; // Якщо цей не працює, спробуй https://api.bandit.camp/affiliates-data/users

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Basic ${Buffer.from(API_KEY).toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from Bandit API" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}