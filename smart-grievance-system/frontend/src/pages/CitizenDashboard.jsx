import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getCurrentUser } from "../services/auth";

// --- UI Constants and Helpers ---
const COLORS = {
  primary: "#4a90e2", // Modern Blue
  secondary: "#50e3c2", // Teal Accent
  success: "#4cd964", // Green
  warning: "#f5a623", // Orange/Yellow
  danger: "#ff3b30", // Red
  background: "#f7f9fc", // Lightest Grey Background
  card: "#ffffff",
  textPrimary: "#333333",
  textSecondary: "#888888",
};

// Placeholder Icons (Using simpler design for integration)
const IconTotal = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 8v4l3 3"></path>
  </svg>
);
const IconResolved = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);
const IconPending = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);
const IconNewGrievance = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const IconRefresh = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.5 9a10 10 0 0 1 14.5-5.5m-15.5 11a10 10 0 0 0 14.5 5.5"></path>
  </svg>
);

// Status to Color mapping for visual coherence
const getStatusColor = (status) => {
  switch (status) {
    case "resolved":
      return { color: COLORS.success, bg: "#e6f7eb" }; // Light green
    case "submitted":
    case "assigned":
      return { color: COLORS.primary, bg: "#e9f2fb" }; // Light blue
    case "in_progress":
    case "escalated":
      return { color: COLORS.warning, bg: "#fff7e6" }; // Light yellow/orange
    case "closed": // Final status after citizen action
      return { color: COLORS.textSecondary, bg: "#f0f0f0" };
    default:
      return { color: COLORS.textSecondary, bg: "#f0f0f0" };
  }
};

const StatusTag = ({ status }) => {
  const { color, bg } = getStatusColor(status);
  const formattedStatus = status.replace(/_/g, " ").toUpperCase();
  return (
    <span
      style={{
        backgroundColor: bg,
        color: color,
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        minWidth: "80px",
        textAlign: "center",
      }}
    >
      {formattedStatus}
    </span>
  );
};

// Component for a styled Stat Card (Enhanced)
const StatCard = ({ title, value, icon, color }) => (
  <div
    className="dashboard-stat-card"
    style={{
      flex: 1,
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)", // Deeper, softer shadow
      backgroundColor: COLORS.card,
      display: "flex",
      flexDirection: "column",
      minWidth: "200px",
      borderLeft: `5px solid ${color}`, // Accent border
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ color: color, opacity: 0.8, marginBottom: "8px" }}>
      {icon}
    </div>
    <div
      style={{
        fontSize: "14px",
        fontWeight: 500,
        color: COLORS.textSecondary,
        textTransform: "uppercase",
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: "38px",
        fontWeight: 800,
        color: COLORS.textPrimary,
        marginTop: "4px",
      }}
    >
      {value}
    </div>
  </div>
);

// Component for the skeleton loading effect (Enhanced)
const SkeletonCard = () => (
  <div
    className="skeleton-card"
    style={{
      flex: 1,
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)",
      backgroundColor: COLORS.card,
      minWidth: "200px",
      animation: "pulse 1.5s infinite ease-in-out", // CSS animation for pulse effect
    }}
  >
    <style>{`
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `}</style>
    <div
      style={{
        height: "16px",
        width: "50%",
        backgroundColor: "#f0f0f0",
        marginBottom: "12px",
        borderRadius: "4px",
      }}
    ></div>
    <div
      style={{
        height: "40px",
        width: "30%",
        backgroundColor: "#e0e0e0",
        borderRadius: "4px",
      }}
    ></div>
  </div>
);

// --- Main Component ---
export default function CitizenDashboard() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  // The following state is used for the grievance list and its interactivity
  const [grievances, setGrievances] = useState([]);
  const [error, setError] = useState(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [sending, setSending] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch grievances (backend filters by user when role=citizen)
        const res = await api.get("/grievances");
        // Add a local UI state for toggling details, without modifying the fetched data directly
        const gs = (res.data.grievances || []).map((g) => ({
          ...g,
          _showDesc: false,
        }));
        setGrievances(gs);

        const total = gs.length;
        const resolved = gs.filter((g) => g.status === "resolved").length;
        const pending = gs.filter((g) =>
          ["submitted", "assigned", "in_progress", "escalated"].includes(
            g.status
          )
        ).length;
        setStats({ total, resolved, pending });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get("/grievances");
      const gs = (res.data.grievances || []).map((g) => ({
        ...g,
        _showDesc: false,
      }));

      setGrievances(gs);
      setStats({
        total: gs.length,
        resolved: gs.filter((g) => g.status === "resolved").length,
        pending: gs.filter((g) =>
          ["submitted", "assigned", "in_progress", "escalated"].includes(
            g.status
          )
        ).length,
      });
    } catch (err) {
      console.error("Error refreshing grievances:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (id, closed = false) => {
    const note = feedbackDrafts[id] ?? "";
    setSending((s) => ({ ...s, [id]: true }));
    try {
      await api.patch(`/grievances/${id}/feedback`, { feedback: note, closed });
      // Update local grievance state so the UI reflects the change immediately
      const updated = grievances.map((g) =>
        g._id === id
          ? { ...g, feedback: note || g.feedback, closedByCitizen: closed }
          : g
      );
      setGrievances(updated);
      // Recalculate stats locally without full refresh
      setStats({
        total: updated.length,
        resolved: updated.filter((g) => g.status === "resolved").length,
        pending: updated.filter((g) =>
          ["submitted", "assigned", "in_progress", "escalated"].includes(
            g.status
          )
        ).length,
      });
      // clear draft
      setFeedbackDrafts((d) => ({ ...d, [id]: "" }));
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setSending((s) => ({ ...s, [id]: false }));
    }
  };

  // Handler for the prominent button (you'd replace this with real navigation/router logic)
  const handleNewGrievanceClick = () => {
    alert("Navigating to New Grievance Submission Form...");
    // In a real application, you'd use history.push('/submit-grievance') or similar
  };

  // Handler for toggling grievance details
  const toggleGrievanceDetails = (id) => {
    setGrievances((prev) =>
      prev.map((p) => (p._id === id ? { ...p, _showDesc: !p._showDesc } : p))
    );
  };

  return (
    <div
      className="citizen-dashboard-container"
      style={{
        padding: "30px",
        backgroundColor: COLORS.background,
        minHeight: "100vh",
      }}
    >
      {/* 🚀 Header Section: Welcome and Primary Action */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            color: COLORS.textPrimary,
            margin: 0,
            fontWeight: 700,
          }}
        >
          Welcome back, {user?.name ?? "Citizen"}
        </h1>
        <button
          className="btn-primary"
          onClick={handleNewGrievanceClick}
          style={{
            padding: "12px 25px",
            fontSize: "16px",
            fontWeight: 600,
            backgroundColor: COLORS.primary,
            color: COLORS.card,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: `0 4px 15px ${COLORS.primary}40`,
            transition: "background-color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#3c7cd0")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = COLORS.primary)
          }
        >
          <IconNewGrievance /> Submit New Grievance
        </button>
      </div>

      {/* 📊 Stat Cards Section */}
      <h2
        style={{
          fontSize: "24px",
          color: COLORS.textPrimary,
          marginBottom: "25px",
        }}
      >
        Dashboard Overview
      </h2>

      <div
        className="dashboard-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
          marginBottom: "40px",
        }}
      >
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Submissions"
              value={stats.total}
              icon={<IconTotal />}
              color={COLORS.primary}
            />
            <StatCard
              title="Resolved Issues"
              value={stats.resolved}
              icon={<IconResolved />}
              color={COLORS.success}
            />
            <StatCard
              title="Pending Action"
              value={stats.pending}
              icon={<IconPending />}
              color={COLORS.warning}
            />
          </>
        )}
      </div>

      {/* 📋 Recent Activity & Help Center Section */}
      <div
        className="dashboard-content-layout"
        style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}
      >
        {/* Recent Grievances (Main Content) */}
        <div
          className="recent-activity"
          style={{
            flex: 2,
            minWidth: "300px",
            padding: "30px",
            backgroundColor: COLORS.card,
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                fontSize: "20px",
                color: COLORS.textPrimary,
              }}
            >
              Recent Grievances
            </h3>
            <div>
              <button
                onClick={refresh}
                style={{
                  background: "none",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "8px 15px",
                  cursor: "pointer",
                  color: COLORS.textSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <IconRefresh /> Refresh
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: COLORS.danger,
                padding: "10px",
                backgroundColor: "#ffecec",
                borderRadius: "6px",
                marginBottom: 15,
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <p style={{ color: COLORS.textSecondary }}>
              Loading recent grievances...
            </p>
          ) : grievances.length === 0 ? (
            <div
              style={{
                color: COLORS.textSecondary,
                padding: "20px",
                textAlign: "center",
                border: "1px dashed #ddd",
                borderRadius: "6px",
              }}
            >
              You have not submitted any grievances yet. Use the **Submit New
              Grievance** button to start.
            </div>
          ) : (
            grievances.map((g) => (
              <div
                key={g._id}
                style={{
                  border: `1px solid ${getStatusColor(g.status).bg}`,
                  padding: 15,
                  marginBottom: 15,
                  borderRadius: 8,
                  backgroundColor: "#fcfcfc",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fcfcfc")
                }
              >
                {/* Grievance Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ flexGrow: 1, minWidth: "200px" }}>
                    <h4
                      style={{
                        margin: 0,
                        color: COLORS.textPrimary,
                        fontSize: "16px",
                      }}
                    >
                      #{g.grievanceId} - {g.title}
                    </h4>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      Submitted: {new Date(g.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "4px",
                    }}
                  >
                    <StatusTag status={g.status} />
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      Officer: {g.assignedOfficer?.name ?? "Unassigned"}
                    </div>
                  </div>
                </div>

                {/* Toggle Details Link */}
                <div style={{ marginBottom: 10 }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleGrievanceDetails(g._id);
                    }}
                    style={{
                      fontSize: 12,
                      color: COLORS.primary,
                      textDecoration: "none",
                    }}
                  >
                    {g._showDesc ? "▲ Hide details" : "▼ Show details"}
                  </a>
                </div>

                {/* Collapsible Details */}
                {g._showDesc && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      background: COLORS.background,
                      borderRadius: "6px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: 14,
                        color: COLORS.textPrimary,
                      }}
                    >
                      <strong>Description:</strong> {g.description}
                    </p>
                    {g.images?.length > 0 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: COLORS.textSecondary,
                          marginBottom: 6,
                        }}
                      >
                        <strong>Attachments:</strong> {g.images.length} image(s)
                      </div>
                    )}
                    {g.lastNote && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "8px",
                          borderLeft: `3px solid ${COLORS.secondary}`,
                          background: "#effffc",
                        }}
                      >
                        <b style={{ fontSize: 12 }}>Officer's Last Note:</b>{" "}
                        <span style={{ fontSize: 14 }}>{g.lastNote}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback Section */}
                <div
                  style={{
                    marginTop: 15,
                    paddingTop: 10,
                    borderTop: "1px solid #eee",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      color: COLORS.textPrimary,
                    }}
                  >
                    Citizen Feedback / Action
                  </label>
                  <textarea
                    value={feedbackDrafts[g._id] ?? g.feedback ?? ""}
                    onChange={(e) =>
                      setFeedbackDrafts((prev) => ({
                        ...prev,
                        [g._id]: e.target.value,
                      }))
                    }
                    placeholder="Enter your comments or additional information here..."
                    style={{
                      width: "100%",
                      minHeight: 80,
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ marginTop: 10 }}>
                    <button
                      disabled={sending[g._id]}
                      onClick={() => submitFeedback(g._id, false)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: COLORS.primary,
                        color: COLORS.card,
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: 10,
                        opacity: sending[g._id] ? 0.6 : 1,
                      }}
                    >
                      {sending[g._id] ? "Saving..." : "Save Feedback"}
                    </button>
                    {g.status === "resolved" && ( // Only show 'Close Grievance' if it's resolved and awaiting user closure
                      <button
                        disabled={sending[g._id]}
                        onClick={() => submitFeedback(g._id, true)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: COLORS.success,
                          color: COLORS.card,
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          opacity: sending[g._id] ? 0.6 : 1,
                        }}
                      >
                        {sending[g._id] ? "Closing..." : "Mark as Closed"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Links / Help Center (Sidebar) */}
        <div
          className="quick-links"
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "30px",
            backgroundColor: COLORS.card,
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
            alignSelf: "flex-start",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              fontSize: "20px",
              color: COLORS.textPrimary,
            }}
          >
            Quick Links & Help
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "15px" }}>
              <a
                href="#"
                style={{
                  textDecoration: "none",
                  color: COLORS.primary,
                  fontWeight: 500,
                }}
              >
                Track All Submissions
              </a>
            </li>
            <li style={{ marginBottom: "15px" }}>
              <a
                href="#"
                style={{
                  textDecoration: "none",
                  color: COLORS.primary,
                  fontWeight: 500,
                }}
              >
                View Resolution Policy
              </a>
            </li>
            <li style={{ marginBottom: "15px" }}>
              <a
                href="#"
                style={{
                  textDecoration: "none",
                  color: COLORS.primary,
                  fontWeight: 500,
                }}
              >
                Contact Support / FAQ
              </a>
            </li>
            <li
              style={{
                marginBottom: "15px",
                borderTop: "1px solid #eee",
                paddingTop: "15px",
              }}
            >
              <a
                href="#"
                style={{
                  textDecoration: "none",
                  color: COLORS.textSecondary,
                  fontSize: 14,
                }}
              >
                Edit Profile Information
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
