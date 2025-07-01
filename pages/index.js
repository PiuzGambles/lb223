import { useEffect, useState } from "react";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Зберігаємо кеш для Steam user data, щоб не робити зайвих запитів
  const steamCache = {};

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();

        // Паралельно підтягуємо дані Steam для кожного гравця
        const detailed = await Promise.all(
          data.map(async (user) => {
            if (steamCache[user.steamid]) return steamCache[user.steamid];
            const steamRes = await fetch(`/api/steam-user?steamid=${user.steamid}`);
            if (!steamRes.ok) return {...user, personaname: "Unknown", avatarfull: "/default-avatar.png"};
            const steamData = await steamRes.json();
            const fullData = {...user, personaname: steamData.personaname, avatarfull: steamData.avatarfull};
            steamCache[user.steamid] = fullData;
            return fullData;
          })
        );

        setLeaderboard(detailed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={{color:"#0ff", textShadow:"0 0 8px #0ff"}}>Weekly Leaderboard</h1>
      {loading ? (
        <p style={{color:"#0cc"}}>Loading...</p>
      ) : (
        <ol style={styles.list}>
          {leaderboard.map((user, i) => (
            <li key={user.steamid} style={styles.item}>
              <img
                src={user.avatarfull || "/default-avatar.png"}
                alt={user.personaname || "User avatar"}
                style={styles.avatar}
              />
              <div>
                <div style={{fontWeight:"bold", color:"#0ff", textShadow:"0 0 5px #0ff"}}>
                  #{i + 1} {user.personaname || "Unknown"}
                </div>
                <div style={{color:"#0cc"}}>Wagered: {user.wagered / 100} coins</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: "radial-gradient(circle, #001f33, #000814)",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: 20,
    textAlign: "center",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: "20px auto",
    maxWidth: 600,
  },
  item: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#002f4b",
    borderRadius: 8,
    padding: "10px 20px",
    marginBottom: 12,
    boxShadow: "0 0 10px #00ffff44",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    marginRight: 15,
    boxShadow: "0 0 8px #0ff",
  },
};