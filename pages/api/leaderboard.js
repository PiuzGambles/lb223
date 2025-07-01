export default async function handler(req, res) {
  const token = "тут_твій_токен_без_пробілів";

  // Визначаємо початок та кінець поточного тижня (наприклад, понеділок - неділя)
  const today = new Date();
  
  // Знайти найближчий понеділок в минулому або сьогодні (початок тижня)
  const day = today.getDay(); // 0-неділя, 1-понеділок ...
  const diffToMonday = day === 0 ? 6 : day - 1; 
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - diffToMonday);

  // Кінець тижня — неділя (6 днів після понеділка)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  // Форматуємо дати у YYYY-MM-DD
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

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
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}