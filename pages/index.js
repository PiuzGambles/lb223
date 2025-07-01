import React, { useEffect, useState } from "react";
import '../styles/globals.css';

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeaderboard(data.response);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load leaderboard");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container">
      <h1>Weekly Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Wagered</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={player.steamid}>
              <td>{index + 1}</td>
              <td>
                <img
                  className={index < 3 ? "avatar avatar-glow" : "avatar"}
                  src={player.avatar}
                  alt={player.nickname}
                />
                {player.nickname || player.steamid}
              </td>
              <td>{(player.wagered / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}