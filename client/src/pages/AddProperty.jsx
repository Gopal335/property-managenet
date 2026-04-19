import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty, importPropertyMedia } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AddProperty() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    driveFolderUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in (basic protection, App.jsx could handle this too)
  if (!user && !loading) {
    navigate("/admin/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create Property
      const newProperty = await createProperty({
        ...form,
        price: Number(form.price || 0),
      });

      // 2. Import Media automatically right after creation
      await importPropertyMedia(newProperty._id);

      // 3. Redirect to Home or the new property details
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-container fade-in">
      <div className="form-card glass-panel">
        <h2>Add New Property</h2>
        <p className="subtitle">Enter the property details and Google Drive link.</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="add-property-form">
          <div className="form-group">
            <label htmlFor="title">Property Name</label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Sunny Villa"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. New York, NY"
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 500000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="driveFolderUrl">Google Drive Folder URL</label>
            <input
              type="url"
              id="driveFolderUrl"
              name="driveFolderUrl"
              value={form.driveFolderUrl}
              onChange={handleChange}
              required
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <small className="form-hint">Make sure the folder is accessible (Anyone with the link can view).</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Short Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the property..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate("/")} className="outline-btn" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-btn submit-btn" disabled={loading}>
              {loading ? "Creating & Importing..." : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
