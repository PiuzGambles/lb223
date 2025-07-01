export default async function handler(req, res) {
  const token = "b98726a4c3542fbb3d8605938108cbef:29b010c44d00d548c4c7ea8837bf615e2fb4058ce375839caaa4ee306ce820e7";
  const API_URL = "https://api.bandit.camp/affiliates/leaderboard";

  // Визначаємо початок і кінець тижня (понеділок до понеділка)
  const now = new Date();
  const day = now.getDay(); // 0=неділя, 1=понеділок...
  const diffToMonday = (day + 6) % 7; // скільки днів від понеділка
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0,0,0,0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setHours(0,0,0,0);

  // Формат в yyyy-mm-dd
  const formatDate = (d) => d.toISOString().slice(0,10);

  const limit = 10; // топ 10

  try {
    const response = await fetch(`${API_URL}?limit=${limit}&start=${formatDate(start)}&end=${formatDate(end)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from Bandit API" });
    }

    const data = await response.json();
    res.status(200).json(data.response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}