import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteProperty, fetchAdminContact, fetchPropertyById, fetchPropertyReadme, submitPropertyInterest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [readmeContent, setReadmeContent] = useState("");
  const [showReadme, setShowReadme] = useState(false);
  
  const [adminContact, setAdminContact] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ loading: false, message: "", error: "" });

  useEffect(() => {
    async function loadData() {
      try {
        const propData = await fetchPropertyById(id);
        setProperty(propData);
        
        if (propData.mediaFiles?.length > 0) {
          const readme = await fetchPropertyReadme(id).catch(() => "");
          setReadmeContent(readme);
        }
      } catch (err) {
        setError(err.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleRemoveProperty = async () => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteProperty(id);
        navigate("/");
      } catch (err) {
        alert(err.message || "Failed to delete property");
      }
    }
  };

  const handleContactAdminClick = async () => {
    if (!adminContact) {
      try {
        const contact = await fetchAdminContact();
        setAdminContact(contact);
      } catch (err) {
        console.error("Failed to load admin contact", err);
      }
    }
    setShowContactForm(!showContactForm);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, message: "", error: "" });
    try {
      await submitPropertyInterest(id, contactForm);
      setContactStatus({ loading: false, message: "Your interest has been sent to the admin!", error: "" });
      setContactForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setContactStatus({ loading: false, message: "", error: err.message || "Failed to submit interest." });
    }
  };

  if (loading) return <div className="loading-state">Loading property details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!property) return <div className="error-state">Property not found</div>;

  const images = property.mediaFiles?.filter(f => f.mimeType.startsWith("image/")) || [];
  const videos = property.mediaFiles?.filter(f => f.mimeType.startsWith("video/")) || [];

  return (
    <div className="property-details-container fade-in">
      <header className="details-header">
        <div className="header-info">
          <h1>{property.title}</h1>
          <p className="location-price">
            <span className="location">📍 {property.location || "Location not specified"}</span>
            <span className="price">🏷️ ${property.price.toLocaleString()}</span>
          </p>
        </div>
        <div className="header-actions">
          {readmeContent && (
            <button className="outline-btn" onClick={() => setShowReadme(!showReadme)}>
              {showReadme ? "Hide Readme" : "View Readme"}
            </button>
          )}
          {user ? (
            <button className="danger-btn" onClick={handleRemoveProperty}>
              Remove Property
            </button>
          ) : (
            <button className="primary-btn" onClick={handleContactAdminClick}>
              Contact Admin
            </button>
          )}
        </div>
      </header>

      {showReadme && (
        <section className="readme-section glass-panel slide-down">
          <h2>Property Documentation</h2>
          <pre className="readme-content">{readmeContent}</pre>
        </section>
      )}

      {showContactForm && !user && (
        <section className="contact-section glass-panel slide-down">
          <div className="admin-info">
            <h3>Admin Contact Info</h3>
            {adminContact ? (
              <p>
                <strong>Name:</strong> {adminContact.name} <br />
                <strong>Email:</strong> <a href={`mailto:${adminContact.email}`}>{adminContact.email}</a> <br />
                {adminContact.phone && <span><strong>Phone:</strong> {adminContact.phone}</span>}
              </p>
            ) : (
              <p>Loading contact details...</p>
            )}
          </div>
          
          <div className="contact-form-container">
            <h3>Send Interest</h3>
            {contactStatus.message && <div className="success-alert">{contactStatus.message}</div>}
            {contactStatus.error && <div className="error-alert">{contactStatus.error}</div>}
            
            <form onSubmit={handleContactSubmit} className="contact-form">
              <input type="text" placeholder="Your Name" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
              <input type="email" placeholder="Your Email" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
              <input type="tel" placeholder="Your Phone (Optional)" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
              <textarea placeholder="Message / Questions" rows="3" required value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})}></textarea>
              <button type="submit" className="primary-btn" disabled={contactStatus.loading}>
                {contactStatus.loading ? "Sending..." : "Submit Interest"}
              </button>
            </form>
          </div>
        </section>
      )}

      <div className="property-description">
        <h3>Description</h3>
        <p>{property.description || "No description provided."}</p>
      </div>

      <section className="gallery-section">
        <h3>Photo Gallery</h3>
        {images.length === 0 ? (
          <p className="no-media">No images available for this property.</p>
        ) : (
          <div className="gallery-grid">
            {images.map(img => (
              <div key={img.fileId} className="gallery-item">
                <img src={`/api/properties/media/${img.fileId}`} alt={img.name} loading="lazy" />
              </div>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <>
            <h3 className="video-title">Property Videos</h3>
            <div className="video-grid">
              {videos.map(vid => (
                <div key={vid.fileId} className="video-item">
                  <video controls src={`/api/properties/media/${vid.fileId}`} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
