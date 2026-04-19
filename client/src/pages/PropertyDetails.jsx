import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

  const [selectedMedia, setSelectedMedia] = useState(null);

  if (loading) return <div className="loading-state">Loading property details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!property) return <div className="error-state">Property not found</div>;

  const allMedia = property.mediaFiles || [];

  return (
    <div className="property-details-container fade-in">
      <header className="details-header">
        <div className="header-info">
          <h1>{property.title}</h1>
          <p className="location-price">
            <span className="location">📍 {property.location || "Location not specified"}</span>
            <span className="price">🏷️ ₹{property.price.toLocaleString()}</span>
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
        <h3>Property Media</h3>
        {allMedia.length === 0 ? (
          <p className="no-media">No media available for this property.</p>
        ) : (
          <div className="small-gallery-grid">
            {allMedia.map((media) => (
              <div 
                key={media.fileId} 
                className="small-gallery-item"
                onClick={() => setSelectedMedia(media)}
              >
                {media.mimeType.startsWith("image/") ? (
                  <img src={media.thumbnailLink || `/api/properties/media/${media.fileId}`} alt={media.name} loading="lazy" />
                ) : (
                  <div className="video-thumb-overlay">
                    {media.thumbnailLink ? (
                      <img src={media.thumbnailLink} alt={media.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <video src={`/api/properties/media/${media.fileId}#t=0.1`} preload="metadata" />
                    )}
                    <div className="play-icon">▶</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedMedia && createPortal(
        <div className="lightbox-overlay fade-in" onClick={(e) => {
          if(e.target.className.includes('lightbox-overlay')) setSelectedMedia(null);
        }}>
          <div className="lightbox-content slide-down">
            <button className="close-lightbox" onClick={() => setSelectedMedia(null)}>×</button>
            
            <div className="lightbox-thumbnails">
              {allMedia.map((media) => (
                <div 
                  key={media.fileId} 
                  className={`lightbox-thumb ${selectedMedia.fileId === media.fileId ? "active" : ""}`}
                  onClick={() => setSelectedMedia(media)}
                >
                  {media.mimeType.startsWith("image/") ? (
                    <img src={`/api/properties/media/${media.fileId}`} alt="thumb" />
                  ) : (
                    <div className="video-thumb-small">
                      {media.thumbnailLink ? (
                        <img src={media.thumbnailLink} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <video src={`/api/properties/media/${media.fileId}#t=0.1`} preload="metadata" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="lightbox-main-media">
              {selectedMedia.mimeType.startsWith("image/") ? (
                <img src={`/api/properties/media/${selectedMedia.fileId}`} alt={selectedMedia.name} />
              ) : (
                <iframe 
                  src={selectedMedia.webViewLink ? selectedMedia.webViewLink.replace('/view', '/preview') : `https://drive.google.com/file/d/${selectedMedia.fileId}/preview`}
                  allow="autoplay" 
                  allowFullScreen
                  title={selectedMedia.name}
                  className="video-iframe"
                ></iframe>
              )}
              <p className="media-caption">{selectedMedia.name}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
