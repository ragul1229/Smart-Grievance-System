import React, { useState, useEffect } from "react";
import api from "../services/api";
import { getCurrentUser } from "../services/auth";
import {
  suggestCategoryPriority,
  fetchServerSuggestion,
  CATEGORIES,
} from "../utils/classifier";

export default function Submit() {
  const user = getCurrentUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [suggested, setSuggested] = useState(null);
  const [message, setMessage] = useState(null);
  const [classification, setClassification] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("Please login as a citizen to submit a grievance");
      return;
    }
    try {
      const res = await api.post("/grievances", {
        title,
        description,
        category,
        images,
      });
      // Duplicate detection: server returns 200 with duplicate info
      if (res.data && res.data.duplicate) {
        setMessage(res.data.message || "Similar complaint detected");
        // Do not clear form so user can modify or cancel
        setClassification(null);
        // Save duplicate info to show to user
        setSuggested((prev) => ({
          ...(prev || {}),
          duplicateNotice: res.data.duplicate,
        }));
        return;
      }

      setMessage(res.data.message || "Grievance submitted successfully");
      setClassification(res.data.classification || null);
      setTitle("");
      setDescription("");
      setCategory("");
      setImages([]);
      if (res.data.grievanceId) {
        alert(`Grievance submitted. ID: ${res.data.grievanceId}`);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Submission failed");
    }
  };

  useEffect(() => {
    if (!title && !description) return setSuggested(null);
    const local = suggestCategoryPriority(title, description);
    setSuggested(local);
    if (!category) setCategory(local.category);

    // Debounced server suggestion (auto-suggest and duplicate check)
    let canceled = false;
    const id = setTimeout(async () => {
      const server = await fetchServerSuggestion(title, description);
      if (canceled || !server) return;
      // show server suggestion and information (merge with local)
      setSuggested((prev) => ({ ...(prev || {}), server }));
      if (!category && server?.classification?.category)
        setCategory(server.classification.category);
    }, 400);
    return () => {
      canceled = true;
      clearTimeout(id);
    };
  }, [title, description]);

  const onImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImages((prev) => [...prev, reader.result]);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-2">Submit a Grievance</h2>
        <p className="text-sm text-gray-500 mb-6">
          Raise an issue and track its resolution transparently
        </p>

        {!user && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-100 text-yellow-800 text-sm">
            You must be logged in as a citizen to submit a grievance.
          </div>
        )}

        {user && (
          <div className="mb-4 text-sm text-gray-600">
            Submitting as <b>{user.name}</b> ({user.role})
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {suggested && (
              <div className="mt-1 text-xs text-gray-500">
                <div>
                  Suggested priority: <b>{suggested.priority}</b>
                </div>
                {suggested.server?.duplicate && (
                  <div className="mt-1 text-sm text-red-600">
                    ⚠️ Similar complaint found:{" "}
                    <b>
                      {suggested.server.duplicate.grievanceId ||
                        suggested.server.duplicate.id}
                    </b>{" "}
                    (score:{" "}
                    {Math.round((suggested.server.duplicate.score || 0) * 100) /
                      100}
                    )
                  </div>
                )}
                {suggested.server?.suggestedOfficer && (
                  <div className="mt-1 text-sm text-gray-700">
                    Suggested officer:{" "}
                    <b>{suggested.server.suggestedOfficer.officerName}</b>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in detail"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Attach Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImage}
              className="mt-1"
            />
            <div className="flex gap-3 mt-3">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Grievance
          </button>
        </form>

        {message && (
          <div className="mt-4 text-sm text-center text-gray-700">
            {message}
          </div>
        )}

        {/* Duplicate notice if detected during submit */}
        {suggested?.duplicateNotice && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm border border-red-100">
            ⚠️ Similar complaint detected:{" "}
            <b>
              {suggested.duplicateNotice.grievanceId ||
                suggested.duplicateNotice.id}
            </b>
            <div className="text-xs mt-1">
              Similarity score:{" "}
              {Math.round((suggested.duplicateNotice.score || 0) * 100) / 100}
            </div>
            <div className="mt-1">
              You can modify your complaint to add new details or cancel
              submission.
            </div>
          </div>
        )}

        {classification && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">AI Classification</h4>
            <p className="text-sm">
              Category: <b>{classification.category}</b>
            </p>
            <p className="text-sm">
              Priority: <b>{classification.priority}</b>
            </p>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(classification.explanation, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
