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
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia?.("(display-mode: standalone)")?.matches || false
  );

  const go = (nextScreen) => setScreen(nextScreen);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
    }
  };

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

      {screen === S.LOGIN && installPrompt && !isInstalled && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "calc(100% - 32px)",
            maxWidth: 448,
            padding: 12,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
          }}
        >
          <button
            type="button"
            onClick={installApp}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 10,
              padding: "13px 16px",
              background: "linear-gradient(135deg,#fe2c55,#ff6b35)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Install TokZoo App
          </button>
          <p
            style={{
              margin: "8px 4px 0",
              textAlign: "center",
              fontSize: 11,
              color: "#666",
            }}
          >
            Install once to add TokZoo to your home screen or desktop.
          </p>
        </div>
      )}
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
