import { useEffect, useState } from "react";

export default function Home() {
  const [current, setCurrent] = useState([]);
  const [previous, setPrevious] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (data && data.success && data.response) {
          const sorted = data.response.sort((a, b) => b.wagered - a.wagered);
          setCurrent(sorted);
        }
        const prev = JSON.parse(localStorage.getItem("previous_leaderboard")) || [];
        setPrevious(prev);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const lastReset = localStorage.getItem("last_reset");
    if (!lastReset || new Date(lastReset).getTime() < monday.getTime()) {
      localStorage.setItem("previous_leaderboard", JSON.stringify(current));
      localStorage.setItem("last_reset", monday.toISOString());
    }
  }, [current]);

  const renderLeaderboard = (players) => (
    <>
      <div className="flex justify-center gap-8 mb-10">
        {players.slice(0, 3).map((player, i) => (
          <div key={i} className={`text-center ${i === 0 ? "scale-110" : ""}`}>
            <img
              src={player.avatar}
              alt="avatar"
              className="w-24 h-24 mx-auto rounded-full border-4 shadow-lg"
              style={{
                borderColor: ["#FFD700", "#C0C0C0", "#CD7F32"][i],
                boxShadow: `0 0 20px 5px ${["#FFD700", "#C0C0C0", "#CD7F32"][i]}`,
              }}
            />
            <p className="text-white mt-2">{player.nickname}</p>
            <p className="text-blue-300">{player.wagered} wagered</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto max-w-3xl mx-auto">
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="border-b border-gray-600 p-2 text-left">#</th>
              <th className="border-b border-gray-600 p-2 text-left">Player</th>
              <th className="border-b border-gray-600 p-2 text-left">Wagered</th>
            </tr>
          </thead>
          <tbody>
            {players.slice(3).map((player, index) => (
              <tr key={index} className="hover:bg-blue-900/20">
                <td className="p-2">{index + 4}</td>
                <td className="p-2 flex items-center gap-2">
                  <img src={player.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                  {player.nickname}
                </td>
                <td className="p-2">{player.wagered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 relative overflow-hidden">
      {/* Background spark animation */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black to-blue-900 animate-pulse opacity-40 pointer-events-none" />

      <h1 className="text-3xl font-bold text-center text-blue-200 mb-4">Weekly Leaderboard</h1>

      <section className="mb-12">
        <h2 className="text-xl text-blue-400 mb-4 text-center">Current Week</h2>
        {renderLeaderboard(current)}
      </section>

      <section>
        <h2 className="text-xl text-blue-400 mb-4 text-center">Previous Week</h2>
        {renderLeaderboard(previous)}
      </section>
    </div>
  );
}