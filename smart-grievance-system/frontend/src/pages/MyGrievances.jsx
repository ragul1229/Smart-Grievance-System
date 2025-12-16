import React, { useEffect, useState } from "react";
import api from "../services/api";

// --- UI Constants & Helpers ---
const COLORS = {
  primary: "#4a90e2", // Blue
  success: "#4cd964", // Green
  warning: "#f5a623", // Orange/Yellow
  danger: "#ff3b30", // Red
  background: "#f7f9fc", // Lightest Grey Background
  card: "#ffffff",
  textPrimary: "#333333",
  textSecondary: "#888888",
  border: "#e0e0e0",
};

const STATUS_COLORS_MAP = {
  resolved: { color: COLORS.success, bg: "#e6f7eb" },
  submitted: { color: COLORS.primary, bg: "#e9f2fb" },
  assigned: { color: COLORS.primary, bg: "#e9f2fb" },
  in_progress: { color: COLORS.warning, bg: "#fff7e6" },
  rejected: { color: COLORS.danger, bg: "#ffecec" },
  escalated: { color: COLORS.danger, bg: "#ffecec" },
  // Optional: 'closed' could be light gray
};

const StatusTag = ({ status }) => {
  const { color, bg } = STATUS_COLORS_MAP[status] || {
    color: COLORS.textPrimary,
    bg: COLORS.border,
  };
  const formattedStatus = status.replace(/_/g, " ").toUpperCase();
  return (
    <span
      style={{
        backgroundColor: bg,
        color: color,
        padding: "4px 10px",
        borderRadius: "15px", // Pill shape
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
      }}
    >
      {formattedStatus}
    </span>
  );
};

// --- Main Component ---
export default function MyGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      // The backend should automatically filter by citizen ID
      const res = await api.get("/grievances");
      setGrievances(res.data.grievances || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch grievances. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filtered = grievances.filter((g) => {
    if (statusFilter && g.status !== statusFilter) return false;
    // Simple case-insensitive search filter for category
    if (
      categoryFilter &&
      !g.category.toLowerCase().includes(categoryFilter.toLowerCase())
    )
      return false;
    return true;
  });

  // Extract unique categories for a more user-friendly dropdown filter
  const uniqueCategories = [
    ...new Set(grievances.map((g) => g.category)),
  ].sort();

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: COLORS.background,
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          color: COLORS.textPrimary,
          marginBottom: "25px",
          borderBottom: `2px solid ${COLORS.border}`,
          paddingBottom: "10px",
        }}
      >
        My Grievances ({grievances.length} Total)
      </h2>

      {/* --- Filter Bar --- */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
          backgroundColor: COLORS.card,
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "14px",
            color: COLORS.textSecondary,
            minWidth: "150px",
          }}
        >
          Status Filter
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: `1px solid ${COLORS.border}`,
              marginTop: "5px",
            }}
          >
            <option value="">All statuses</option>
            {Object.keys(STATUS_COLORS_MAP).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ").charAt(0).toUpperCase() +
                  status.replace(/_/g, " ").slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "14px",
            color: COLORS.textSecondary,
            minWidth: "150px",
          }}
        >
          Category Filter (Dropdown)
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: `1px solid ${COLORS.border}`,
              marginTop: "5px",
            }}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "14px",
            color: COLORS.textSecondary,
            minWidth: "150px",
          }}
        >
          Category Filter (Search)
          <input
            placeholder="Search Category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: `1px solid ${COLORS.border}`,
              marginTop: "5px",
            }}
          />
        </label>
      </div>

      {/* --- Content Area --- */}
      {error && (
        <div
          style={{
            color: COLORS.danger,
            padding: "10px",
            backgroundColor: STATUS_COLORS_MAP.rejected.bg,
            borderRadius: "6px",
            marginBottom: 15,
          }}
        >
          {error}
        </div>
      )}
      {loading && (
        <p style={{ color: COLORS.textSecondary }}>
          Loading your submission history...
        </p>
      )}

      <div className="grievance-list-container">
        {filtered.length === 0 && !loading ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: COLORS.textSecondary,
              border: `1px dashed ${COLORS.border}`,
              borderRadius: "8px",
              backgroundColor: COLORS.card,
            }}
          >
            <p>No grievances found matching your filters.</p>
          </div>
        ) : (
          filtered.map((g) => (
            <div
              key={g._id}
              className="grievance-card"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                transition: "transform 0.1s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                {/* Left Side: Title and Details */}
                <div style={{ flexGrow: 1, minWidth: "250px" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      color: COLORS.textPrimary,
                    }}
                  >
                    <span style={{ color: COLORS.primary, marginRight: "8px" }}>
                      #{g.grievanceId}
                    </span>
                    {g.title}
                  </h3>
                  <div
                    style={{
                      fontSize: "14px",
                      color: COLORS.textSecondary,
                      marginTop: "5px",
                    }}
                  >
                    <strong>Category:</strong>{" "}
                    <span style={{ fontWeight: 500 }}>{g.category}</span>
                  </div>
                  <div
                    style={{ fontSize: "14px", color: COLORS.textSecondary }}
                  >
                    <strong>Submitted:</strong>{" "}
                    {new Date(g.createdAt).toLocaleDateString()} at{" "}
                    {new Date(g.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Right Side: Status and Officer */}
                <div style={{ textAlign: "right", minWidth: "150px" }}>
                  <StatusTag status={g.status} />
                  <div
                    style={{
                      fontSize: "12px",
                      color: COLORS.textSecondary,
                      marginTop: "8px",
                    }}
                  >
                    <strong>Assigned Officer:</strong>{" "}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                    }}
                  >
                    {g.assignedOfficer?.name ?? "Unassigned"}
                  </div>
                </div>
              </div>

              {/* Footer/Extra Info */}
              <div
                style={{
                  marginTop: "15px",
                  paddingTop: "10px",
                  borderTop: `1px dashed ${COLORS.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                <div>
                  {g.images?.length > 0 && (
                    <span>
                      <strong>Attachments:</strong> {g.images.length} file(s)
                    </span>
                  )}
                </div>
                {/* Placeholder for viewing details - CitizenDashboard already has this logic integrated */}
                <a
                  href={`/dashboard#${g.grievanceId}`}
                  style={{
                    color: COLORS.primary,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  View Details & History →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
