import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../services/auth";
import api from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(getCurrentUser());
  const [dept, setDept] = useState(null);

  useEffect(() => {
    async function fetchDept() {
      if (user?.department) {
        try {
          const res = await api.get(`/departments`);
          const found = res.data.departments.find(
            (d) => d._id === user.department
          );
          setDept(found);
        } catch (err) {
          console.error(err);
        }
      }
    }
    fetchDept();
  }, [user]);

  return (
    <div>
      <h2>Profile</h2>
      <div>
        Name: <b>{user?.name}</b>
      </div>
      <div>
        Email: <b>{user?.email}</b>
      </div>
      <div>
        Role: <b>{user?.role}</b>
      </div>
      {user?.role === "officer" && (
        <div>
          Department: <b>{dept?.name ?? "Unassigned"}</b>
        </div>
      )}
      {user?.role === "admin" && (
        <div style={{ marginTop: 12 }}>
          <a href="/admin/manage">Manage officers</a> |{" "}
          <a href="/admin/departments">Manage departments</a>
        </div>
      )}
    </div>
  );
}
