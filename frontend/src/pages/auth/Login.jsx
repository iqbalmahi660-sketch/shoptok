import { useState } from "react";
import { API, S } from "../../data/catalogue.js";
import Btn from "../../components/common/Btn.jsx";
import Field from "../../components/common/Field.jsx";

export const Login = ({ go, setUser }) => {
  const [f, sf] = useState({ email: "", password: "" });
  const [err, se] = useState({});
  const [loading, sl] = useState(false);

  const submit = async () => {
    const e = {};
    if (!f.email.includes("@")) e.email = "Invalid email";
    if (!f.password) e.password = "Password is required";
    if (Object.keys(e).length) {
      se(e);
      return;
    }

    se({});
    sl(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: f.email.trim(),
          password: f.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("shopToken", data.token);

      const loggedInUser = {
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
        city: data.user.city || "",
        role: data.user.role,
        avatar: data.user.role === "seller" ? "" : "",
        profileImg: data.user.profile_img || null,
        seller: data.user.seller || null,
      };

      setUser(loggedInUser);
      localStorage.setItem("shopUser", JSON.stringify(loggedInUser));
      go(S.APP);
    } catch (error) {
      se({
        form: error.message || "Unable to sign in. Please try again.",
      });
    } finally {
      sl(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !loading) submit();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "#f7f7f8",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }} onKeyDown={onKeyDown}>
        <button
          onClick={() => go(S.APP)}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 28,
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>

        <h2
          style={{
            fontFamily: "'TikTok Sans',sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: "#111",
            marginBottom: 4,
          }}
        >
          Welcome back
        </h2>

        <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>
          Sign in to your TokZoo account
        </p>

        {err.form && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(254,44,85,0.08)",
              border: "1px solid rgba(254,44,85,0.18)",
              color: "#fe2c55",
              fontSize: 12,
            }}
          >
            {err.form}
          </div>
        )}

        <Field
          label="Email"
          name="email"
          type="email"
          value={f.email}
          onChange={(v) => sf((p) => ({ ...p, email: v }))}
          placeholder="you@example.com"
          error={err.email}
          autoComplete="email"
        />

        <Field
          label="Password"
          name="password"
          type="password"
          value={f.password}
          onChange={(v) => sf((p) => ({ ...p, password: v }))}
          placeholder="••••••••"
          error={err.password}
          autoComplete="current-password"
        />

        <div
          style={{
            textAlign: "right",
            marginTop: -8,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              color: "#fe2c55",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Forgot password?
          </span>
        </div>

        <Btn full loading={loading} onClick={submit}>
          Log In
        </Btn>

        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 13,
            color: "#555",
          }}
        >
          No account?{" "}
          <span
            style={{ color: "#fe2c55", cursor: "pointer" }}
            onClick={() => go(S.REG)}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
