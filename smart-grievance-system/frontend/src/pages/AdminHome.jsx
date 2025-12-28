import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/analytics");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ padding: 12, border: "1px solid #ddd" }}>
          Total complaints:{" "}
          <b>{data.counts.reduce((acc, c) => acc + (c.count || 0), 0)}</b>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd" }}>
          SLA violations: <b>{data.slaViolations}</b>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd" }}>
          Average resolution hours:{" "}
          <b>{data.avgResolutionHours?.toFixed(2) ?? "N/A"}</b>
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Complaints by category</h3>
      <div>
        {data.byCategory.map((c) => (
          <div key={c._id} style={{ marginBottom: 6 }}>
            <b>{c._id || "uncategorized"}</b>: {c.count}
            <div style={{ height: 12, background: "#eee", marginTop: 4 }}>
              <div
                style={{
                  height: "100%",
                  background: "#0b5",
                  width: `${Math.min(
                    100,
                    (c.count /
                      Math.max(
                        1,
                        data.counts.reduce((a, b) => a + (b.count || 0), 0)
                      )) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <a href="/admin/all">View all grievances</a> |{" "}
        <a href="/admin/manage">Manage officers</a> |{" "}
        <a href="/admin/departments">Manage departments</a>
      </div>
      <h3 style={{ marginTop: 16 }}>Top officers</h3>
      <div>
        {data.byOfficer.map((o) => (
          <div key={o.officerId} style={{ marginBottom: 6 }}>
            <b>{o.officerName || "Unknown"}</b>: total {o.total}, resolved{" "}
            {o.resolved}
          </div>
        ))}
        <h3 style={{ marginTop: 16 }}>High priority issues</h3>
        <div>
          <b
            style={{
              color: (data.highPriority || 0) > 0 ? "crimson" : "inherit",
            }}
          >
            {data.highPriority ?? 0}
          </b>{" "}
          complaints marked as high priority
        </div>

        <h3 style={{ marginTop: 16 }}>Repeated issues</h3>
        <div>
          {data.repeated && data.repeated.length ? (
            data.repeated.map((r) => (
              <div key={r._id} style={{ marginBottom: 6 }}>
                <b>{r._id}</b>: {r.count} reports
              </div>
            ))
          ) : (
            <div>No repeated issues detected</div>
          )}
        </div>

        <h3 style={{ marginTop: 16 }}>Top categories (30d)</h3>
        <div>
          {data.recentByCategory && data.recentByCategory.length ? (
            data.recentByCategory.map((r) => (
              <div key={r._id} style={{ marginBottom: 6 }}>
                <b>{r._id}</b>: {r.count} reports
              </div>
            ))
          ) : (
            <div>No trends detected</div>
          )}
        </div>

        <h3 style={{ marginTop: 16 }}>Duplicate complaints</h3>
        <div>
          <b>{data.duplicateCount ?? 0}</b> complaints detected as duplicates
        </div>
      </div>
    </div>
  );
}
