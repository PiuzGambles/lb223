import { useEffect, useState } from "react";

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchPlayers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();

      // Припустимо, дані у data.players, підкоригуй під структуру
      const top10 = data.players ? data.players.slice(0, 10) : [];
      setPlayers(top10);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlayers();
  }, []);

  const top3 = players.slice(0, 3);
  const rest7 = players.slice(3, 10);

  return (
    <>
      <style>{`
        body,html,#__next {
          margin:0; padding:0; height:100%;
          background: #001021;
          color: #b0c7ff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow-x: hidden;
        }
        .glow-background {
          position: fixed;
          top:0; left:0; right:0; bottom:0;
          background: linear-gradient(270deg, #1e3a8a, #2563eb, #60a5fa, #1e3a8a);
          background-size: 800% 800%;
          animation: glowAnim 20s ease infinite;
          z-index: -1;
          filter: blur(70px);
        }
        @keyframes glowAnim {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        .container {
          max-width: 900px;
          margin: 60px auto 40px;
          padding: 0 20px;
          text-align: center;
        }
        h1 {
          margin-bottom: 30px;
          font-size: 2.4rem;
          color: #90cdf4;
          text-shadow: 0 0 10px #60a5fa;
        }
        .top3 {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
        }
        .player-card {
          background: rgba(96, 165, 250, 0.15);
          border-radius: 15px;
          padding: 20px;
          width: 150px;
          box-shadow: 0 0 10px #2563eb;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .player-card:hover {
          transform: scale(1.08);
          box-shadow: 0 0 25px #3b82f6;
        }
        .avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin-bottom: 15px;
          object-fit: cover;
          border: 2px solid #60a5fa;
          box-shadow: 0 0 10px #3b82f6;
        }
        .player-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: #cbd5e1;
          margin-bottom: 10px;
          text-shadow: 0 0 6px #60a5fa;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wager {
          font-size: 0.9rem;
          color: #93c5fd;
          font-weight: 600;
          text-shadow: 0 0 4px #2563eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          color: #cbd5e1;
        }
        th, td {
          padding: 8px 12px;
          border-bottom: 1px solid #3b82f6;
          text-align: left;
        }
        th {
          background: rgba(37, 99, 235, 0.3);
          text-shadow: 0 0 6px #2563eb;
        }
        tr:hover {
          background: rgba(37, 99, 235, 0.15);
        }
        button {
          background: transparent;
          border: 2px solid #60a5fa;
          border-radius: 8px;
          color: #60a5fa;
          padding: 10px 25px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 30px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
          text-shadow: 0 0 8px #60a5fa;
          user-select: none;
        }
        button:hover {
          box-shadow: 0 0 15px #3b82f6;
          transform: scale(1.1);
          border-color: #3b82f6;
        }
      `}</style>

      <div className="glow-background" />

      <main className="container">
        <h1>Bandit Leaderboard</h1>

        {loading && <p>Loading players...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && players.length > 0 && (
          <>
            <div className="top3">
              {top3.map((p, i) => (
                <div key={p.id || i} className="player-card" title={`Place #${i + 1}`}>
                  <img
                    src={p.avatar || "https://via.placeholder.com/70?text=No+Avatar"}
                    alt={p.name}
                    className="avatar"
                    loading="lazy"
                  />
                  <div className="player-name">{p.name}</div>
                  <div className="wager">{p.wager.toLocaleString()} coins</div>
                </div>
              ))}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Player</th>
                  <th>Wager</th>
                </tr>
              </thead>
              <tbody>
                {rest7.map((p, i) => (
                  <tr key={p.id || i}>
                    <td>{i + 4}</td>
                    <td>{p.name}</td>
                    <td>{p.wager.toLocaleString()} coins</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={fetchPlayers}>Refresh Leaderboard</button>
          </>
        )}
      </main>
    </>
  );
}