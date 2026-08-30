import { useState, useEffect } from "react";
import { API, S } from "./data/catalogue";
import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import SellerOnboard from "./pages/seller/SellerOnboard";
import MainApp from "./pages/MainApp";

export default function App() {
  const [screen, setScreen] = useState(S.APP);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const go = (nextScreen) => setScreen(nextScreen);

  // Restore session from a saved token on page load/refresh
  useEffect(() => {
    const token = localStorage.getItem("shopToken");
    if (!token) { setAuthLoading(false); return; }

    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("shopUser", JSON.stringify(data.user));
        } else {
          localStorage.removeItem("shopToken");
          localStorage.removeItem("shopUser");
        }
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ width: 34, height: 34, border: "3px solid #f0f0f0", borderTopColor: "#fe2c55", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      {screen === S.LAND && <Landing go={go} />}
      {screen === S.LOGIN && <Login go={go} setUser={setUser} />}
      {screen === S.REG && <Register go={go} setUser={setUser} />}
      {screen === S.VERIFY && <Verify go={go} />}
      {screen === S.ONBOARD && <SellerOnboard go={go} setUser={setUser} />}
      {screen === S.APP && (
        <MainApp
          user={user}
          setUser={setUser}
          goAuth={go}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
    </>
  );
}
