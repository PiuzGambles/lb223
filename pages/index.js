import { useState, useEffect } from "react";

const SCRAP_EMOJI = "🪙"; // можна замінити на картинку якщо треба

function getNextMonday() {
  const now = new Date();
  const day = now.getDay();
  const diff = (8 - day) % 7 || 7; // днів до наступного понеділка
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + diff);
  nextMonday.setHours(0,0,0,0);
  return nextMonday;
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
}

export default function Home() {
  const [leaderboard, setLeaderboard] = useState({ current: [], previous: [] });
  const [showPrevious, setShowPrevious] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Таймер до наступного понеділка
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = getNextMonday() - now;
      setCountdown(formatCountdown(diff > 0 ? diff : 0));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Функція для форматування дати у YYYY-MM-DD
  const formatDate = (date) => date.toISOString().slice(0,10);

  // Функція отримання дат для current та previous тижня
  const getWeekRange = (offsetWeeks = 0) => {
    const now = new Date();
    // Понеділок цього тижня (з offset)
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday - offsetWeeks * 7);
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: formatDate(monday), end: formatDate(sunday) };
  };

  // Завантаження лідербордів з API
  useEffect(() => {
    async function fetchLeaderboards() {
      setLoading(true);
      setError(null);
      try {
        // Поточний тиждень (offsetWeeks=0)
        const currentRange = getWeekRange(0);
        const prevRange = getWeekRange(1);

        const [currentRes, prevRes] = await Promise.all([
          fetch(`/api/leaderboard?start=${currentRange.start}&end=${currentRange.end}`),
          fetch(`/api/leaderboard?start=${prevRange.start}&end=${prevRange.end}`)
        ]);
        if (!currentRes.ok) throw new Error("Failed to load current leaderboard");
        if (!prevRes.ok) throw new Error("Failed to load previous leaderboard");

        const currentData = await currentRes.json();
        const prevData = await prevRes.json();

        setLeaderboard({
          current: currentData.response || [],
          previous: prevData.response || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboards();
  }, []);

  // Рендер гравця топ 3 з glow
  const renderTopPlayer = (player, rank) => {
    if (!player) return null;
    return (
      <div className={`top-player glow glow-rank-${rank}`} title={player.nickname || player.steamid}>
        <img src={player.avatar} alt={player.nickname || player.steamid} />
        <div className="name">{player.nickname || player.steamid}</div>
        <div className="wager">{player.wagered.toLocaleString()} {SCRAP_EMOJI}</div>
        <div className="rank">#{rank}</div>
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Weekly Leaderboard</h1>
      <div className="timer">
        Next update in: <span>{countdown}</span>
      </div>
      <div className="btn-group">
        <button
          className={showPrevious ? "" : "active"}
          onClick={() => setShowPrevious(false)}
        >
          Current Week
        </button>
        <button
          className={showPrevious ? "active" : ""}
          onClick={() => setShowPrevious(true)}
        >
          Previous Week
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="top3-wrapper">
            {!showPrevious && <>
              {renderTopPlayer(leaderboard.current[1], 2)}
              {renderTopPlayer(leaderboard.current[0], 1)}
              {renderTopPlayer(leaderboard.current[2], 3)}
            </>}

            {showPrevious && <>
              {renderTopPlayer(leaderboard.previous[1], 2)}
              {renderTopPlayer(leaderboard.previous[0], 1)}
              {renderTopPlayer(leaderboard.previous[2], 3)}
            </>}
          </div>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Wagered</th>
              </tr>
            </thead>
            <tbody>
              {(!showPrevious ? leaderboard.current : leaderboard.previous)
                .slice(3)
                .map((player, i) => (
                <tr key={player.steamid}>
                  <td>{i + 4}</td>
                  <td className="player-cell">
                    <img className="avatar" src={player.avatar} alt={player.nickname || player.steamid} />
                    <span>{player.nickname || player.steamid}</span>
                  </td>
                  <td>{player.wagered.toLocaleString()} {SCRAP_EMOJI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="footer">
        Powered by Bandit.camp API
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 20px auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #d0e9ff;
          text-align: center;
          background: #001422;
          padding: 20px;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }
        h1 {
          margin-bottom: 5px;
          font-weight: 700;
          font-size: 2rem;
        }
        .timer {
          margin-bottom: 15px;
          font-size: 1.1rem;
          color: #a0c4ff;
        }
        .btn-group {
          margin-bottom: 25px;
        }
        button {
          cursor: pointer;
          border: none;
          background: #002c54;
          color: #9ecfff;
          padding: 8px 20px;
          font-weight: 600;
          font-size: 1rem;
          margin: 0 8px;
          border-radius: 8px;
          transition: all 0.25s ease;
          box-shadow: 0 0 0 transparent;
        }
        button:hover {
          box-shadow: 0 0 10px #55aaff, 0 0 20px #55aaff;
          transform: scale(1.1);
          color: #fff;
        }
        button.active {
          background: #5599ff;
          color: #fff;
          box-shadow: 0 0 15px #5599ff;
          transform: scale(1.1);
        }

        .top3-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 25px;
        }
        .top-player {
          background: #112b4a;
          border-radius: 15px;
          padding: 10px;
          width: 130px;
          box-sizing: border-box;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        .top-player:hover {
          transform: scale(1.15);
          box-shadow: 0 0 20px #55aaff, 0 0 40px #55aaff;
          z-index: 10;
        }
        .top-player img {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 8px;
          border: 3px solid transparent;
        }
        .top-player .name {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .top-player .wager {
          font-weight: 600;
          color: #a0c4ff;
        }
        .top-player .rank {
          position: absolute;
          top: 10px;
          left: 10px;
          font-weight: 900;
          font-size: 1.3rem;
          color: #55aaff;
        }

        /* Glow effect by rank */
        .glow-rank-1 img {
          border-color: #f9d71c;
          box-shadow: 0 0 12px 3px #f9d71c;
        }
        .glow-rank-2 img {
          border-color: #99cfff;
          box-shadow: 0 0 10px 2px #99cfff;
        }
        .glow-rank-3 img {
          border-color: #55aaff;
          box-shadow: 0 0 8px 2px #55aaff;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          color: #b0d0ff;
        }
        .leaderboard-table th, .leaderboard-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #224466;
          text-align: left;
        }
        .leaderboard-table th {
          background: #002040;
          font-weight: 700;
        }
        .player-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1.5px solid transparent;
          transition: border-color 0.3s ease;
        }

        /* Background sparkles effect */
        .container::before {
          content: "";
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          background: radial-gradient(circle at 50% 50%, #1a2b45 0%, #001422 100%);
          z-index: -2;
          animation: bgFade 10s linear infinite alternate;
        }
        @keyframes bgFade {
          0% {background-position: 0 0;}
          100% {background-position: 100% 100%;}
        }

      `}</style>
    </div>
  );
}