export default async function handler(req, res) {
  const token = "b98726a4c3542fbb3d8605938108cbef:29b010c44d00d548c4c7ea8837bf615e2fb4058ce375839caaa4ee306ce820e7";

  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: "Missing start or end query params" });

  const API_URL = `https://api.bandit.camp/affiliates/leaderboard?limit=30&start=${start}&end=${end}`;

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: "Failed to fetch from Bandit API", details: errorText });
    }

    const data = await response.json();

    // Якщо хочеш, сюди можна дописати логіку для додавання nickname/avatar через Steam API (потрібен додатковий код)

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}