import React, { useEffect, useState } from "react";
import api from "../services/api";
import { suggestCategoryPriority } from "../utils/classifier";

// --- UI Constants & Helpers ---
const COLORS = {
  primary: "#007bff", // Action Blue
  secondary: "#6c757d", // Grey for text
  success: "#28a745", // Green
  warning: "#ffc107", // Yellow
  danger: "#dc3545", // Red
  background: "#f7f9fc",
  card: "#ffffff",
  border: "#dee2e6",
};

// Map status to color for visual cues
const STATUS_STYLES = {
  submitted: { color: COLORS.primary, bg: "#e9f2fb" },
  assigned: { color: COLORS.primary, bg: "#e9f2fb" },
  in_progress: { color: COLORS.warning, bg: "#fff7e6" },
  resolved: { color: COLORS.success, bg: "#e6f7eb" },
  rejected: { color: COLORS.danger, bg: "#ffecec" },
  escalated: { color: COLORS.danger, bg: "#ffecec" },
  default: { color: COLORS.secondary, bg: "#f0f0f0" },
};

const PRIORITY_STYLES = {
  low: { color: COLORS.success, bg: "#e6f7eb" },
  medium: { color: COLORS.warning, bg: "#fff7e6" },
  high: { color: COLORS.danger, bg: "#ffecec" },
  default: { color: COLORS.secondary, bg: "#f0f0f0" },
};

const Chip = ({ text, styleMap, type }) => {
  const style = styleMap[text] || styleMap.default;
  const formattedText = text ? text.replace(/_/g, " ").toUpperCase() : "N/A";
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: "4px 10px",
        borderRadius: "15px", // Pill shape
        fontSize: "11px",
        fontWeight: 600,
        marginRight: "8px",
        whiteSpace: "nowrap",
        border: type === "priority" ? `1px solid ${style.color}` : "none",
      }}
    >
      {formattedText}
    </span>
  );
};

// --- Stat Card Component ---
const StatCard = ({ title, value, color }) => (
  <div
    style={{
      flex: 1,
      minWidth: "150px",
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: COLORS.card,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div
      style={{ fontSize: "14px", color: COLORS.secondary, marginBottom: "4px" }}
    >
      {title}
    </div>
    <div
      style={{ fontSize: "30px", fontWeight: 700, color: COLORS.textPrimary }}
    >
      {value}
    </div>
  </div>
);

// --- Main Component ---
export default function OfficerDashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({}); // { [id]: { status, note, open } }
  const [showDesc, setShowDesc] = useState({});
  const [showExplain, setShowExplain] = useState({});
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [filters, setFilters] = useState({ status: "", priority: "" });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/grievances");
      const gs = res.data.grievances || [];
      setGrievances(gs);
      const total = gs.length;
      const resolved = gs.filter((g) => g.status === "resolved").length;
      const pending = gs.filter((g) =>
        ["submitted", "assigned", "in_progress", "escalated"].includes(g.status)
      ).length;
      setStats({ total, pending, resolved });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const note = editing[id]?.note;
      await api.patch(`/grievances/${id}/status`, { status, note });
      setEditing((prev) => ({ ...prev, [id]: { ...prev[id], open: false } }));
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const viewImages = (imgs) => {
    if (!imgs || !imgs.length) return alert("No images attached");
    // Open a new tab/window for the first image
    window.open(imgs[0], "_blank");
  };

  const toggleEdit = (id, g) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { status: g.status, note: g.lastNote || "", open: !prev[id]?.open },
    }));
  };

  const setEditField = (id, field, value) => {
    setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const filteredGrievances = grievances
    .filter((g) => {
      if (filters.status && g.status !== filters.status) return false;
      if (filters.priority && g.priority !== filters.priority) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by priority (High first) and then by creation date (oldest first)
      const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

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
          fontSize: "30px",
          color: COLORS.textPrimary,
          marginBottom: "25px",
        }}
      >
        Official Grievance Management Panel
      </h2>

      {/* --- Stat Cards --- */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <StatCard
          title="Total Assigned"
          value={stats.total}
          color={COLORS.primary}
        />
        <StatCard
          title="Pending Action"
          value={stats.pending}
          color={COLORS.warning}
        />
        <StatCard
          title="Resolved Issues"
          value={stats.resolved}
          color={COLORS.success}
        />
        {/* The original code had stats embedded in a div. We replace it with StatCards. */}
      </div>

      {loading && (
        <p style={{ color: COLORS.secondary }}>
          Loading assigned grievances...
        </p>
      )}
      {error && (
        <div
          style={{
            color: COLORS.danger,
            padding: "10px",
            backgroundColor: STATUS_STYLES.rejected.bg,
            borderRadius: "6px",
            marginBottom: 15,
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* --- Filter Bar --- */}
      <div
        style={{
          marginBottom: "25px",
          display: "flex",
          gap: "15px",
          padding: "15px",
          backgroundColor: COLORS.card,
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
            color: COLORS.secondary,
          }}
        >
          Status Filter
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            style={{
              padding: "8px 10px",
              borderRadius: "4px",
              border: `1px solid ${COLORS.border}`,
              marginTop: "5px",
            }}
          >
            <option value="">All statuses</option>
            {Object.keys(STATUS_STYLES)
              .filter((k) => k !== "default")
              .map((status) => (
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
            color: COLORS.secondary,
          }}
        >
          Priority Filter
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value }))
            }
            style={{
              padding: "8px 10px",
              borderRadius: "4px",
              border: `1px solid ${COLORS.border}`,
              marginTop: "5px",
            }}
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <button
          onClick={() => {
            setFilters({ status: "", priority: "" });
          }}
          style={{
            alignSelf: "flex-end",
            padding: "8px 15px",
            backgroundColor: COLORS.secondary,
            color: COLORS.card,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#5a6268")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = COLORS.secondary)
          }
        >
          Clear Filters
        </button>
      </div>

      {/* --- Grievance List --- */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredGrievances.length === 0 && !loading ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: COLORS.secondary,
              border: `1px dashed ${COLORS.border}`,
              borderRadius: "8px",
              backgroundColor: COLORS.card,
            }}
          >
            <p>No grievances found matching your criteria.</p>
          </div>
        ) : (
          filteredGrievances.map((g) => (
            <li
              key={g._id}
              style={{
                marginBottom: 15,
                padding: 20,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                backgroundColor: COLORS.card,
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)",
                transition: "box-shadow 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 5px rgba(0, 0, 0, 0.03)")
              }
            >
              {/* Header Row: Title, ID, Status & Priority */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "10px 15px",
                  marginBottom: "10px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    color: COLORS.textPrimary,
                  }}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDesc((prev) => ({
                        ...prev,
                        [g._id]: !prev[g._id],
                      }));
                    }}
                    style={{ color: COLORS.primary, textDecoration: "none" }}
                  >
                    <span style={{ fontWeight: 700 }}>#{g.grievanceId}</span> —{" "}
                    {g.title}
                  </a>
                </h3>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Chip
                    text={g.status}
                    styleMap={STATUS_STYLES}
                    type="status"
                  />
                  <Chip
                    text={g.priority}
                    styleMap={PRIORITY_STYLES}
                    type="priority"
                  />
                </div>
              </div>

              {/* Details Row */}
              <div
                style={{
                  fontSize: "14px",
                  color: COLORS.secondary,
                  marginBottom: "10px",
                  borderBottom: `1px dashed ${COLORS.border}`,
                  paddingBottom: "10px",
                }}
              >
                <span>
                  <strong>Citizen:</strong> {g.citizen?.name ?? "N/A"}
                </span>{" "}
                |
                <span style={{ marginLeft: 8 }}>
                  <strong>Category:</strong> {g.category}
                </span>{" "}
                |
                <span style={{ marginLeft: 8 }}>
                  <strong>Submitted:</strong>{" "}
                  {new Date(g.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Description Toggle */}
              {showDesc[g._id] && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: COLORS.background,
                    borderRadius: "6px",
                    borderLeft: `3px solid ${COLORS.primary}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                    }}
                  >
                    <strong>Description:</strong> {g.description}
                  </p>
                  {g.citizen?.feedback && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        background: "#fff0d8",
                        borderLeft: "3px solid #ff9900",
                        borderRadius: "4px",
                      }}
                    >
                      <strong style={{ color: "#9e5a00" }}>
                        Citizen Feedback:
                      </strong>{" "}
                      {g.citizen.feedback}
                    </div>
                  )}
                </div>
              )}

              {/* AI Prediction Section (Kept the original logic and structure) */}
              {(() => {
                const pred = suggestCategoryPriority(
                  g.title || "",
                  g.description || ""
                );
                return (
                  <div
                    style={{
                      marginTop: 15,
                      padding: "10px",
                      background: "#e8f0fe",
                      borderRadius: "4px",
                      border: "1px solid #c7d8f9",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: COLORS.primary,
                      }}
                    >
                      AI Suggestion:
                    </span>
                    <Chip
                      text={pred.priority}
                      styleMap={PRIORITY_STYLES}
                      type="priority"
                    />
                    <Chip
                      text={pred.category}
                      styleMap={STATUS_STYLES}
                      type="category"
                    />

                    <button
                      style={{
                        marginLeft: 8,
                        background: "none",
                        border: "none",
                        color: COLORS.primary,
                        cursor: "pointer",
                        fontSize: "12px",
                        textDecoration: "underline",
                      }}
                      onClick={() =>
                        setShowExplain((prev) => ({
                          ...prev,
                          [g._id]: !prev[g._id],
                        }))
                      }
                    >
                      {showExplain[g._id]
                        ? "Hide Explanation"
                        : "Explain Logic"}
                    </button>

                    {showExplain[g._id] && (
                      <pre
                        style={{
                          background: "#f0f5ff",
                          padding: 8,
                          marginTop: 6,
                          fontSize: "12px",
                          borderRadius: "4px",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {JSON.stringify(pred.explanation, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div style={{ marginTop: 15, display: "flex", gap: "10px" }}>
                <button
                  onClick={() => toggleEdit(g._id, g)}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: COLORS.primary,
                    color: COLORS.card,
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#0056b3")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.primary)
                  }
                >
                  {editing[g._id]?.open
                    ? "Close Update Panel"
                    : "Update Status/Add Note"}
                </button>
                <button
                  onClick={() => viewImages(g.images)}
                  disabled={!g.images?.length}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: COLORS.secondary,
                    color: COLORS.card,
                    border: "none",
                    borderRadius: "4px",
                    cursor: g.images?.length ? "pointer" : "not-allowed",
                    opacity: g.images?.length ? 1 : 0.6,
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#5a6268")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.secondary)
                  }
                >
                  View Image ({g.images?.length || 0})
                </button>
              </div>

              {/* Edit Panel (Collapsible) */}
              {editing[g._id]?.open && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 20,
                    border: `1px solid ${COLORS.warning}`,
                    backgroundColor: "#fffbe6", // Light warning background
                    borderRadius: "6px",
                  }}
                >
                  <h4
                    style={{
                      marginTop: 0,
                      fontSize: "16px",
                      color: COLORS.textPrimary,
                    }}
                  >
                    Resolution & Status Update
                  </h4>
                  <div style={{ marginBottom: 10 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: 500,
                        fontSize: "14px",
                      }}
                    >
                      New Status
                    </label>
                    <select
                      value={editing[g._id].status}
                      onChange={(e) =>
                        setEditField(g._id, "status", e.target.value)
                      }
                      style={{
                        padding: "8px 10px",
                        borderRadius: "4px",
                        border: `1px solid ${COLORS.border}`,
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">
                        Resolved (Requires Citizen Confirmation)
                      </option>
                      <option value="rejected">
                        Rejected (Provide detailed reason below)
                      </option>
                      <option value="escalated">
                        Escalate to Senior Officer/Admin
                      </option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 15 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: 500,
                        fontSize: "14px",
                      }}
                    >
                      Officer Notes (Visible to Citizen on status change)
                    </label>
                    <textarea
                      value={editing[g._id].note}
                      onChange={(e) =>
                        setEditField(g._id, "note", e.target.value)
                      }
                      placeholder="Enter detailed action taken, resolution steps, or reason for rejection/escalation..."
                      style={{
                        padding: "10px",
                        borderRadius: "4px",
                        border: `1px solid ${COLORS.border}`,
                        width: "100%",
                        minHeight: "80px",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => updateStatus(g._id, editing[g._id].status)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: COLORS.success,
                        color: COLORS.card,
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "10px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1e7e34")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = COLORS.success)
                      }
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => toggleEdit(g._id, g)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: COLORS.secondary,
                        color: COLORS.card,
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#5a6268")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          COLORS.secondary)
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
