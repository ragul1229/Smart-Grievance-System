import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Submit from "./pages/Submit";
import OfficerDashboard from "./pages/OfficerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHome from "./pages/AdminHome";
import AllGrievancesAdmin from "./pages/AllGrievancesAdmin";
import AdminDepartments from "./pages/AdminDepartments";
import Login from "./pages/Login";
import { getCurrentUser, logout } from "./services/auth";
import { useState, useEffect } from "react";
import RoleRoute from "./components/RoleRoute";
import CitizenDashboard from "./pages/CitizenDashboard";
import MyGrievances from "./pages/MyGrievances";
import Profile from "./pages/Profile";

// --- New HomePage Component Definition ---
const HomePage = ({ currentUser }) => {
  const primaryActionLink = currentUser
    ? currentUser.role === "citizen"
      ? "/dashboard"
      : currentUser.role === "officer"
      ? "/officer"
      : "/admin"
    : "/submit";

  const primaryActionText = currentUser
    ? `Go to your Dashboard${currentUser.name ? ", " + currentUser.name : ""}`
    : "Submit a New Grievance Now";

  const welcomeText = currentUser
    ? `Welcome back, ${currentUser.name}.`
    : "Welcome to the Smart Grievance System.";

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2
        style={{
          fontSize: "36px",
          color: "#007bff",
          textAlign: "center",
          marginBottom: "20px",
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
        }}
      >
        Citizen Grievance & Resolution Platform
      </h2>

      <p
        style={{
          fontSize: "18px",
          textAlign: "center",
          color: "#555",
          marginBottom: "30px",
        }}
      >
        {welcomeText} This platform is designed to provide a transparent,
        efficient, and accountable way for citizens to raise concerns and track
        their resolution by relevant government departments.
      </p>

      {/* Primary Action Button */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Link
          to={primaryActionLink}
          style={{
            display: "inline-block",
            padding: "12px 30px",
            fontSize: "18px",
            fontWeight: 600,
            backgroundColor: "#28a745", // Success Green
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            transition: "background-color 0.2s",
            boxShadow: "0 4px 8px rgba(40, 167, 69, 0.3)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#218838")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#28a745")
          }
        >
          {primaryActionText}
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Feature Card 1: Transparency */}
        <div
          style={{
            flex: "1 1 250px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            borderLeft: "3px solid #007bff",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ color: "#007bff", marginTop: 0 }}>🔍 Transparency</h3>
          <p style={{ fontSize: "15px", color: "#666" }}>
            Submit your concern and receive a unique ID. Track the status,
            assigned officer, and resolution notes in real-time.
          </p>
        </div>

        {/* Feature Card 2: Accountability */}
        <div
          style={{
            flex: "1 1 250px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            borderLeft: "3px solid #ffc107",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ color: "#ffc107", marginTop: 0 }}>✅ Accountability</h3>
          <p style={{ fontSize: "15px", color: "#666" }}>
            Grievances are automatically routed to the correct department and
            officer for timely action, ensuring ownership.
          </p>
        </div>

        {/* Feature Card 3: Feedback Loop */}
        <div
          style={{
            flex: "1 1 250px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            borderLeft: "3px solid #28a745",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ color: "#28a745", marginTop: 0 }}>💬 Feedback Loop</h3>
          <p style={{ fontSize: "15px", color: "#666" }}>
            Citizens can provide feedback and confirm resolution, ensuring
            satisfaction is measured and recorded.
          </p>
        </div>
      </div>

      {/* Footer Instructions */}
      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #eee",
          textAlign: "center",
          fontSize: "14px",
          color: "#777",
        }}
      >
        Need Help? You can submit a grievance without logging in, but we
        recommend{" "}
        <Link to="/login" style={{ color: "#007bff" }}>
          logging in
        </Link>{" "}
        to access your full personalized dashboard.
      </div>
    </div>
  );
};

// --- Updated App Component ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const onAuthChange = () => setCurrentUser(getCurrentUser());
    window.addEventListener("authChange", onAuthChange);
    // storage event for other tabs
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, []);

  return (
    <div className="app">
      {/* Header component remains unchanged, but styling is applied to look modern */}
      <header
        className="header"
        style={{
          backgroundColor: "#007bff", // Primary color for header
          color: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="header-left"
          style={{ display: "flex", alignItems: "center", gap: "30px" }}
        >
          <h1 className="brand" style={{ margin: 0, fontSize: "24px" }}>
            Smart Grievance System
          </h1>
          <nav className="main-nav" style={{ display: "flex", gap: "20px" }}>
            {[
              { to: "/", label: "Home" },
              { to: "/submit", label: "Submit" },
              ...(currentUser
                ? [
                    ...(currentUser.role === "citizen"
                      ? [
                          { to: "/dashboard", label: "Dashboard" },
                          { to: "/my-grievances", label: "My Grievances" },
                        ]
                      : []),
                    ...(currentUser.role === "officer"
                      ? [{ to: "/officer", label: "Officer Panel" }]
                      : []),
                    ...(currentUser.role === "admin"
                      ? [
                          { to: "/admin", label: "Admin Home" },
                          { to: "/admin/all", label: "All Grievances" },
                          { to: "/admin/departments", label: "Departments" },
                        ]
                      : []),
                  ]
                : [{ to: "/login", label: "Login" }]),
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="header-right"
          style={{ textAlign: "right", lineHeight: 1.4 }}
        >
          {currentUser ? (
            <div>
              <small>Signed in as {currentUser.name}</small>
              <div style={{ marginTop: 4 }}>
                <Link
                  to="/profile"
                  style={{ color: "white", marginRight: "8px" }}
                >
                  Profile
                </Link>{" "}
                |{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    // Forced reload to clear state and redirect after logout
                    window.location.href = "/login";
                  }}
                  style={{ color: "white", marginLeft: "8px" }}
                >
                  Logout
                </a>
              </div>
            </div>
          ) : (
            <small>Not signed in</small>
          )}
        </div>
      </header>

      <main
        className="main"
        style={{
          padding: "20px",
          minHeight: "calc(100vh - 180px)",
          backgroundColor: "#f4f7f9",
        }}
      >
        <Routes>
          {/* The updated Route now uses the dedicated HomePage component, 
            passing currentUser as a prop to customize the view.
          */}
          <Route path="/" element={<HomePage currentUser={currentUser} />} />

          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/submit" element={<Submit />} />
          <Route
            path="/officer"
            element={
              <RoleRoute allowedRoles={["officer"]}>
                <OfficerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminHome />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/all"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AllGrievancesAdmin />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/manage"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDepartments />
              </RoleRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/my-grievances"
            element={
              <RoleRoute allowedRoles={["citizen"]}>
                <MyGrievances />
              </RoleRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      <footer
        style={{
          padding: "15px 30px",
          borderTop: "1px solid #ddd",
          textAlign: "center",
          backgroundColor: "#343a40", // Dark footer
          color: "#adb5bd",
          fontSize: "14px",
        }}
      >
        <div>Prototype – Demo Only © {new Date().getFullYear()}</div>
        <div>Contact: project@example.com</div>
      </footer>
    </div>
  );
}
