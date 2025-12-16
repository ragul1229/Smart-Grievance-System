import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [aRes, gRes, oRes, dRes] = await Promise.all([
        api.get("/analytics"),
        api.get("/grievances"),
        api.get("/users?role=officer"),
        api.get("/departments"),
      ]);
      setAnalytics(aRes.data);
      setGrievances(gRes.data.grievances || []);
      setOfficers(oRes.data.users || []);
      setDepartments(dRes.data.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const assign = async (id, officerId) => {
    try {
      await api.patch(`/grievances/${id}/assign`, { officerId });
      fetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {loading && <p>Loading...</p>}
      {analytics && (
        <div>
          <h4>Analytics</h4>
          <div>
            Average resolution time (hrs):{" "}
            {analytics.avgResolutionHours?.toFixed(2) ?? "N/A"}
          </div>
          <div>
            Status counts:{" "}
            <pre>{JSON.stringify(analytics.counts, null, 2)}</pre>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 12 }}>All Grievances</h3>
      <ul>
        {grievances.map((g) => (
          <li key={g._id} style={{ marginBottom: 12 }}>
            <div>
              <b>{g.grievanceId}</b> {g.title} | Status: {g.status} | Assigned:{" "}
              {g.assignedOfficer?.name ?? "None"}
            </div>
            <div>
              <label>Assign to officer:</label>
              <select
                onChange={(e) => assign(g._id, e.target.value)}
                defaultValue=""
              >
                <option value="">--select--</option>
                {officers.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 6 }}>
              <label>Or assign to department:</label>
              <select
                onChange={(e) => {
                  const depId = e.target.value;
                  if (depId)
                    api
                      .patch(`/grievances/${g._id}/assign`, {
                        departmentId: depId,
                      })
                      .then(fetch)
                      .catch(console.error);
                }}
                defaultValue=""
              >
                <option value="">--select--</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
