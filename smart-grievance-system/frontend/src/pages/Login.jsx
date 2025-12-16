import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/auth";

// --- UI Constants & Helpers ---
const COLORS = {
  primary: "#4a90e2", // Blue
  success: "#28a745",
  danger: "#dc3545",
  background: "#f7f9fc",
  card: "#ffffff",
  border: "#dee2e6",
  textPrimary: "#333333",
  textSecondary: "#6c757d",
  link: "#007bff",
};

// --- Main Component ---
export default function Login() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // NOTE: Logic unchanged - original onLogin implementation
  const onLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login({ email, password });
      // Check that selected role matches the returned role (if user chose one)
      if (role && user.role && role !== user.role) {
        setError("Selected role does not match your account role");
        return;
      }
      // Redirect by role
      if (user.role === "officer") navigate("/officer");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // NOTE: Logic unchanged - original onRegister implementation
  const onRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // For the prototype, UI registration only creates citizens; admin/officer must be seeded
      await register({ name, email, password, role: "citizen" });
      setMessage("Registration successful. Please login to continue.");
      setTab("login");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const commonInputStyle = {
    padding: '10px 12px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '5px',
    marginBottom: '15px',
    fontSize: '15px',
  };

  const commonLabelStyle = {
    display: 'block',
    fontWeight: 600,
    fontSize: '14px',
    color: COLORS.textPrimary,
  };

  const primaryButtonStyle = {
    padding: '10px 20px',
    backgroundColor: COLORS.primary,
    color: COLORS.card,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 600,
    fontSize: '16px',
    transition: 'background-color 0.2s',
  };

  const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: '12px 0',
    border: 'none',
    borderBottom: `3px solid ${isActive ? COLORS.primary : COLORS.border}`,
    backgroundColor: 'transparent',
    color: isActive ? COLORS.primary : COLORS.textSecondary,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'color 0.2s, border-bottom-color 0.2s',
  });

  return (
    <div 
        className="auth-page" 
        style={{ 
            minHeight: '100vh', 
            backgroundColor: COLORS.background, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '20px' 
        }}
    >
      <div 
        className="auth-card" 
        style={{ 
            width: '100%', 
            maxWidth: '400px', 
            backgroundColor: COLORS.card, 
            borderRadius: '12px', 
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)', 
            padding: '30px' 
        }}
      >
        <h2 style={{ 
            fontSize: '24px', 
            textAlign: 'center', 
            color: COLORS.textPrimary, 
            marginBottom: '25px' 
        }}>
          Citizen Service Gateway
        </h2>
        
        {/* Tabs */}
        <div 
            className="tabs" 
            style={{ 
                display: 'flex', 
                marginBottom: '20px', 
                borderBottom: `1px solid ${COLORS.border}` 
            }}
        >
          <button
            style={tabButtonStyle(tab === "login")}
            onClick={() => {
              setTab("login");
              setError(null);
              setMessage(null);
            }}
          >
            Login
          </button>
          <button
            style={tabButtonStyle(tab === "signup")}
            onClick={() => {
              setTab("signup");
              setError(null);
              setMessage(null);
            }}
          >
            Sign Up
          </button>
        </div>

        {/* --- Login Form --- */}
        {tab === "login" && (
          <form onSubmit={onLogin}>
            <div>
              <label style={commonLabelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={commonInputStyle}
              />
            </div>
            <div>
              <label style={commonLabelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={commonInputStyle}
              />
            </div>
            <div>
              <label style={commonLabelStyle}>Role (for routing)</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={commonInputStyle}
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginTop: '10px' }}>
              <button 
                type="submit" 
                style={primaryButtonStyle}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = COLORS.primary}
              >
                Sign In
              </button>
            </div>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Forgot password flow not implemented in prototype.");
                }}
                style={{ color: COLORS.link, textDecoration: 'none', fontSize: '14px' }}
              >
                Forgot Password?
              </a>
            </div>
          </form>
        )}

        {/* --- Signup Form --- */}
        {tab === "signup" && (
          <form onSubmit={onRegister}>
            <div>
              <label style={commonLabelStyle}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={commonInputStyle}
              />
            </div>
            <div>
              <label style={commonLabelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={commonInputStyle}
              />
            </div>
            <div>
              <label style={commonLabelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={commonInputStyle}
              />
            </div>
            <div>
              <label style={commonLabelStyle}>Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={commonInputStyle}
              >
                <option value="citizen">Citizen</option>
                <option value="officer" disabled>
                  Officer (must be created by Admin)
                </option>
                <option value="admin" disabled>
                  Admin (must be created by Admin)
                </option>
              </select>
              <small style={{ display: 'block', color: COLORS.textSecondary, marginTop: '-10px', marginBottom: '15px', fontSize: '12px' }}>
                For this prototype, only **Citizen** can sign up via the UI.
              </small>
            </div>
            <div style={{ marginTop: '10px' }}>
              <button 
                type="submit" 
                style={{ ...primaryButtonStyle, backgroundColor: COLORS.success }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e7e34'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = COLORS.success}
              >
                Register Account
              </button>
            </div>
          </form>
        )}

        {/* Messages and Errors */}
        {message && <p style={{ color: COLORS.success, backgroundColor: '#e6f7eb', padding: '10px', borderRadius: '4px', textAlign: 'center', marginTop: '15px' }}>{message}</p>}
        {error && <p style={{ color: COLORS.danger, backgroundColor: '#ffecec', padding: '10px', borderRadius: '4px', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
      </div>
    </div>
  );
}