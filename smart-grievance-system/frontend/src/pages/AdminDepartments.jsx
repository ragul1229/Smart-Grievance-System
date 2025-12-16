import React, { useEffect, useState } from "react";
import api from "../services/api";

// --- UI Constants & Helpers ---
const COLORS = {
  primary: "#4a90e2", // Blue
  danger: "#dc3545", // Red
  success: "#28a745", // Green for creation
  background: "#f7f9fc",
  card: "#ffffff",
  border: "#dee2e6",
  textPrimary: "#333333",
  textSecondary: "#6c757d",
};

// --- Department Card Component (For Displaying Data) ---
const DepartmentCard = ({ department, onRemove, onManage }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px",
      marginBottom: "10px",
      backgroundColor: COLORS.card,
      borderRadius: "6px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      borderLeft: `5px solid ${COLORS.primary}`,
    }}
  >
    <div style={{ flexGrow: 1 }}>
      <h4 style={{ margin: 0, fontSize: "16px", color: COLORS.textPrimary }}>
        <strong>{department.name}</strong>
      </h4>
      <p
        style={{
          margin: "4px 0 0 0",
          fontSize: "14px",
          color: COLORS.textSecondary,
        }}
      >
        {department.description}
      </p>
      {department.categoryAssignments &&
        department.categoryAssignments.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <strong style={{ fontSize: 13 }}>Category Assignments:</strong>
            <ul style={{ margin: "6px 0 0 18px" }}>
              {department.categoryAssignments.map((a) => (
                <li key={a.category} style={{ fontSize: 13 }}>
                  <b>{a.category}</b>:{" "}
                  {a.officers && a.officers.length
                    ? a.officers.map((o) => o.name).join(", ")
                    : "—"}
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => onManage(department)}
        style={{
          padding: "8px 12px",
          backgroundColor: COLORS.primary,
          color: COLORS.card,
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        ⚙️ Manage
      </button>
      <button
        onClick={() => onRemove(department._id)}
        style={{
          padding: "8px 12px",
          backgroundColor: COLORS.danger,
          color: COLORS.card,
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        🗑️ Delete
      </button>
    </div>
  </div>
);

// --- Main Component ---
export default function AdminDepartments() {
  const [deps, setDeps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [submissionError, setSubmissionError] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [managing, setManaging] = useState(null); // department being managed
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryOfficers, setNewCategoryOfficers] = useState([]);

  // NOTE: Logic unchanged - original fetch implementation
  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      setDeps(res.data.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // load officers for assignment UI
    (async () => {
      try {
        const res = await api.get("/users?role=officer");
        setOfficers(res.data.users || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // NOTE: Logic unchanged - original create implementation
  const create = async () => {
    setSubmissionError(null);
    if (!name.trim()) {
      setSubmissionError("Department name cannot be empty.");
      return;
    }
    try {
      await api.post("/departments", { name, description: desc });
      setName("");
      setDesc("");
      fetch();
    } catch (err) {
      setSubmissionError(err.response?.data?.message || err.message);
    }
  };

  // NOTE: Logic unchanged - original remove implementation
  const remove = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this department? This action is irreversible."
      )
    )
      return;
    try {
      await api.delete(`/departments/${id}`);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

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
          fontSize: "32px",
          color: COLORS.textPrimary,
          marginBottom: "25px",
          borderBottom: `2px solid ${COLORS.border}`,
          paddingBottom: "10px",
        }}
      >
        ⚙️ Department Management
      </h2>

      {/* --- Create Department Form --- */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: COLORS.card,
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <h3 style={{ marginTop: 0, fontSize: "20px", color: COLORS.primary }}>
          Create New Department
        </h3>

        {submissionError && (
          <div
            style={{
              color: COLORS.danger,
              padding: "10px",
              backgroundColor: "#ffecec",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          >
            <strong>Error:</strong> {submissionError}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            placeholder="Department Name (e.g., Public Works)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "10px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "4px",
              flex: "1 1 200px",
              minWidth: "150px",
            }}
          />
          <input
            placeholder="Description (e.g., Handles all infrastructure issues)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{
              padding: "10px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "4px",
              flex: "2 1 300px",
            }}
          />
          <button
            onClick={create}
            style={{
              padding: "10px 20px",
              backgroundColor: COLORS.success,
              color: COLORS.card,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1e7e34")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.success)
            }
          >
            ➕ Create Department
          </button>
        </div>
      </div>

      {/* --- Department List --- */}
      <h3
        style={{
          fontSize: "20px",
          color: COLORS.textPrimary,
          borderBottom: `1px solid ${COLORS.border}`,
          paddingBottom: "10px",
        }}
      >
        Existing Departments ({deps.length})
      </h3>

      {loading && (
        <p style={{ color: COLORS.textSecondary }}>Loading departments...</p>
      )}

      <div className="department-list" style={{ marginTop: "15px" }}>
        {!loading && deps.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: COLORS.textSecondary,
              border: `1px dashed ${COLORS.border}`,
              borderRadius: "6px",
              backgroundColor: COLORS.card,
            }}
          >
            No departments have been created yet.
          </div>
        ) : (
          deps.map((d) => (
            <div key={d._id}>
              <DepartmentCard
                department={d}
                onRemove={remove}
                onManage={(dep) => {
                  setManaging(dep);
                  setNewCategory("");
                  setNewCategoryOfficers([]);
                }}
              />
              {/* If this department is being managed, show quick editor */}
              {managing && managing._id === d._id && (
                <div
                  style={{
                    padding: "15px",
                    marginTop: 8,
                    marginBottom: 16,
                    backgroundColor: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    Manage Assignments for <strong>{d.name}</strong>
                  </h4>

                  <div
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <input
                      placeholder="Category (e.g., pothole)"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={{
                        padding: 8,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 4,
                      }}
                    />
                    <div style={{ minWidth: 260 }}>
                      <div style={{ marginBottom: 6, fontSize: 13 }}>
                        Select officers for this category:
                      </div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {officers.map((o) => (
                          <label
                            key={o._id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 8px",
                              border: `1px solid ${COLORS.border}`,
                              borderRadius: 4,
                              cursor: "pointer",
                              backgroundColor: newCategoryOfficers.includes(
                                o._id
                              )
                                ? "#e9f7ef"
                                : "transparent",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={newCategoryOfficers.includes(o._id)}
                              onChange={(e) => {
                                setNewCategoryOfficers((prev) =>
                                  e.target.checked
                                    ? [...prev, o._id]
                                    : prev.filter((id) => id !== o._id)
                                );
                              }}
                            />
                            <span style={{ fontSize: 13 }}>{o.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!newCategory.trim())
                          return alert("Enter a category name");
                        try {
                          await api.patch(`/departments/${d._id}/categories`, {
                            category: newCategory.trim(),
                            officerIds: newCategoryOfficers,
                          });
                          fetch();
                          setManaging(null);
                        } catch (err) {
                          alert(err.response?.data?.message || err.message);
                        }
                      }}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: COLORS.primary,
                        color: COLORS.card,
                        border: "none",
                        borderRadius: 4,
                      }}
                    >
                      Save Assignment
                    </button>
                    <button
                      onClick={() => setManaging(null)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                      }}
                    >
                      Close
                    </button>
                  </div>

                  {d.categoryAssignments &&
                    d.categoryAssignments.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <h5 style={{ margin: "6px 0" }}>
                          Existing assignments
                        </h5>
                        <ul>
                          {d.categoryAssignments.map((a) => (
                            <li key={a.category} style={{ marginBottom: 6 }}>
                              <b>{a.category}</b>:{" "}
                              {a.officers && a.officers.length
                                ? a.officers.map((o) => o.name).join(", ")
                                : "—"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
