import { useEffect, useState } from "react";
import { fetchInterests } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate("/admin/login");
      return;
    }

    async function load() {
      try {
        const data = await fetchInterests();
        setInterests(data);
        localStorage.setItem("lastViewedInterests", new Date().toISOString());
      } catch (err) {
        setError(err.message || "Failed to load interests");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, navigate, loading]);

  if (loading) return <div className="loading-state">Loading interests...</div>;

  return (
    <div className="interests-container fade-in container">
      <h2>User Interests</h2>
      <p className="subtitle">List of users who contacted you regarding properties.</p>

      {error && <div className="error-alert">{error}</div>}

      {interests.length === 0 ? (
        <p className="no-data-text">No interests submitted yet.</p>
      ) : (
        <div className="interests-grid">
          {interests.map((interest) => (
            <div key={interest._id} className="interest-card glass-panel">
              <h3 className="interest-name">{interest.name}</h3>
              <p className="interest-property">
                <strong>Property:</strong> {interest.property?.title || "Unknown Property"}
              </p>
              <p className="interest-contact">
                <strong>Email:</strong> <a href={`mailto:${interest.email}`}>{interest.email}</a><br />
                <strong>Phone:</strong> {interest.phone || "Not provided"}
              </p>
              <div className="interest-message">
                <strong>Message:</strong>
                <p>{interest.message}</p>
              </div>
              <small className="interest-date">
                Submitted: {new Date(interest.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
