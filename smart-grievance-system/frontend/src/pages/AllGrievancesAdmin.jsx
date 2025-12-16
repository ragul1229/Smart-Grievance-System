import React, { useEffect, useState } from "react";
import api from "../services/api";

// --- UI Constants & Helpers ---
const COLORS = {
  primary: "#4a90e2", // Blue
  secondary: "#6c757d", // Grey for text
  success: "#28a745", // Green
  warning: "#ffc107", // Yellow
  danger: "#dc3545", // Red
  background: "#f7f9fc",
  card: "#ffffff",
  border: "#dee2e6",
  textPrimary: "#333333",
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

const Chip = ({ text, styleMap, fallback = 'default' }) => {
  const status = text?.toLowerCase().replace(/ /g, '_');
  const style = styleMap[status] || styleMap[fallback];
  const formattedText = text ? text.replace(/_/g, ' ').toUpperCase() : 'N/A';
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {formattedText}
    </span>
  );
};

// --- Main Component ---
export default function AllGrievancesAdmin() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", category: "", sla: "" });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/grievances");
      setGrievances(res.data.grievances || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const now = new Date();
  
  // NOTE: Filtering logic is kept exactly the same as in the original code
  const filtered = grievances.filter((g) => {
    if (filters.status && g.status !== filters.status) return false;
    // Simple substring match for category filter
    if (filters.category && !g.category.toLowerCase().includes(filters.category.toLowerCase())) return false; 
    
    // SLA Breach Logic (original code)
    const isBreached = g.expectedResolutionAt && 
                       new Date(g.expectedResolutionAt) < now && 
                       !["resolved", "rejected"].includes(g.status);

    if (
      filters.sla === "breach" &&
      !isBreached
    )
      return false;
      
    // SLA OK Logic (original code simplified to check for non-breach)
    if (
      filters.sla === "ok" &&
      isBreached
    )
      return false;

    return true;
  });
  
  // Generate unique categories for a better dropdown filter
  const uniqueCategories = [...new Set(grievances.map(g => g.category))].sort();

  // Helper function to render the SLA status chip
  const getSLAStatus = (g) => {
    if (!g.expectedResolutionAt) return { text: "N/A", color: COLORS.secondary };
    
    const isFinal = ["resolved", "rejected"].includes(g.status);
    const expectedDate = new Date(g.expectedResolutionAt);
    
    if (isFinal) {
        return { text: "Complete", color: COLORS.success, bg: STATUS_STYLES.resolved.bg };
    }
    
    if (expectedDate < now) {
        return { text: "BREACHED", color: COLORS.danger, bg: STATUS_STYLES.rejected.bg };
    }
    
    // Check if close to breach (e.g., within 24 hours, optional visual cue)
    const timeToBreach = expectedDate.getTime() - now.getTime();
    if (timeToBreach < 24 * 60 * 60 * 1000) { 
        return { text: "Warning", color: COLORS.warning, bg: STATUS_STYLES.in_progress.bg };
    }
    
    return { text: "OK", color: COLORS.success, bg: STATUS_STYLES.resolved.bg };
  };


  return (
    <div style={{ padding: "30px", backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <h2 style={{ fontSize: "32px", color: COLORS.textPrimary, marginBottom: "25px", borderBottom: `2px solid ${COLORS.border}`, paddingBottom: '10px' }}>
        <span style={{ color: COLORS.primary, marginRight: '10px' }}>📊</span> Comprehensive Grievance List
      </h2>
      
      {/* --- Filter Bar --- */}
      <div 
        style={{ 
          display: "flex", 
          gap: "15px", 
          marginBottom: "25px", 
          backgroundColor: COLORS.card, 
          padding: '15px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          flexWrap: 'wrap'
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', color: COLORS.secondary, minWidth: '150px' }}>
            Status
            <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                style={{ padding: '8px 10px', borderRadius: '4px', border: `1px solid ${COLORS.border}`, marginTop: '5px' }}
            >
                <option value="">All statuses</option>
                {Object.keys(STATUS_STYLES).filter(k => k !== 'default').map(status => (
                    <option key={status} value={status}>
                        {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
                    </option>
                ))}
            </select>
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', color: COLORS.secondary, minWidth: '150px' }}>
            Category (Search)
             <input
                placeholder="Search Category..."
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                style={{ padding: '8px 10px', borderRadius: '4px', border: `1px solid ${COLORS.border}`, marginTop: '5px' }}
             />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', color: COLORS.secondary, minWidth: '150px' }}>
            SLA Filter
            <select
                value={filters.sla}
                onChange={(e) => setFilters((prev) => ({ ...prev, sla: e.target.value }))}
                style={{ padding: '8px 10px', borderRadius: '4px', border: `1px solid ${COLORS.border}`, marginTop: '5px' }}
            >
                <option value="">All SLA</option>
                <option value="ok">OK / Complete</option>
                <option value="breach">Breached</option>
            </select>
        </label>
        
        <button
            onClick={() => {
                setFilters({ status: "", category: "", sla: "" });
            }}
            style={{ 
                alignSelf: 'flex-end',
                padding: '8px 15px', 
                backgroundColor: COLORS.secondary, 
                color: COLORS.card, 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
            }}
        >
            Clear Filters ({filtered.length})
        </button>
      </div>

      {loading && <p style={{ color: COLORS.secondary }}>Loading all system grievances...</p>}
      
      {/* --- Table View --- */}
      {!loading && (
          <div style={{ overflowX: 'auto', backgroundColor: COLORS.card, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                  <thead style={{ backgroundColor: COLORS.background }}>
                      <tr>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>ID</th>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>Title</th>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>Category</th>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>Status</th>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>Officer</th>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>Submitted</th>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>SLA Deadline</th>
                          <th style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left', color: COLORS.secondary, fontSize: '14px' }}>SLA Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filtered.map((g, index) => {
                          const isBreached = g.expectedResolutionAt && 
                                             new Date(g.expectedResolutionAt) < now && 
                                             !["resolved", "rejected"].includes(g.status);
                          
                          const rowBackground = isBreached ? STATUS_STYLES.rejected.bg : (index % 2 === 0 ? COLORS.card : '#fcfcfc');
                          
                          const sla = getSLAStatus(g);

                          return (
                              <tr
                                  key={g._id}
                                  style={{
                                      background: rowBackground,
                                      borderBottom: `1px solid ${COLORS.border}`,
                                      transition: 'background-color 0.1s',
                                  }}
                                  onMouseOver={e => e.currentTarget.style.backgroundColor = isBreached ? STATUS_STYLES.rejected.bg : '#f0f0f0'}
                                  onMouseOut={e => e.currentTarget.style.backgroundColor = rowBackground}
                              >
                                  <td style={{ padding: '12px', color: COLORS.primary, fontWeight: 600, fontSize: '14px' }}>{g.grievanceId}</td>
                                  <td style={{ padding: '12px', color: COLORS.textPrimary, fontWeight: 500, fontSize: '14px' }}>{g.title}</td>
                                  <td style={{ padding: '12px', color: COLORS.secondary, fontSize: '14px' }}>{g.category}</td>
                                  <td style={{ padding: '12px' }}>
                                      <Chip text={g.status} styleMap={STATUS_STYLES} />
                                  </td>
                                  <td style={{ padding: '12px', color: COLORS.secondary, fontSize: '14px' }}>
                                      {g.assignedOfficer?.name ?? "Unassigned"}
                                  </td>
                                  <td style={{ padding: '12px', color: COLORS.secondary, fontSize: '14px' }}>
                                      {new Date(g.createdAt).toLocaleDateString()}
                                  </td>
                                  <td style={{ padding: '12px', color: isBreached ? COLORS.danger : COLORS.secondary, fontWeight: isBreached ? 600 : 400, fontSize: '14px' }}>
                                      {g.expectedResolutionAt ? new Date(g.expectedResolutionAt).toLocaleDateString() : "N/A"}
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                      <Chip 
                                          text={sla.text} 
                                          styleMap={{ 'ok': STATUS_STYLES.resolved, 'warning': STATUS_STYLES.in_progress, 'breached': STATUS_STYLES.rejected, 'complete': STATUS_STYLES.resolved, 'n/a': STATUS_STYLES.default }}
                                          fallback={sla.text.toLowerCase()}
                                      />
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: COLORS.secondary }}>No grievances match the current filter criteria.</div>
              )}
          </div>
      )}
    </div>
  );
}