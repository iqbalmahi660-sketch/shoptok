import { useState } from "react";

export const Field = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  name,
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 10,
            color: "#666",
            marginBottom: 5,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative" }}>
        <input
          name={name}
          type={isPassword && show ? "text" : type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: "11px 14px",
            paddingRight: isPassword ? 42 : 14,
            background: "#ffffff",
            border: `1px solid ${error ? "#fe2c55" : "#e5e5e5"}`,
            borderRadius: 8,
            color: "#111",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#fe2c55";
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        />

        {isPassword && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#555",
              cursor: "pointer",
              fontSize: 13,
              width: 26,
              height: 26,
            }}
          >
            {show ? "◉" : "○"}
          </button>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 11, color: "#fe2c55", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
