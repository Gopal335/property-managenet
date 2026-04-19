import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties } from "../api";

function getPreviewMedia(property) {
  if (!property.mediaFiles?.length) {
    return null;
  }

  return (
    property.mediaFiles.find((file) => file.mimeType?.startsWith("image/")) ||
    property.mediaFiles.find((file) => file.mimeType?.startsWith("video/")) ||
    property.mediaFiles[0]
  );
}

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProperties();
        setProperties(data);
      } catch (error) {
        console.error("Failed to load properties", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="home-container fade-in">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title slide-up">Explore your fav property</h1>
          <p className="hero-subtitle slide-up delay-1">
            The place where you can find our property details in an organized manner
          </p>
        </div>
        <div className="hero-image-container slide-up delay-2">
          <img src="/home image.png" alt="Home" className="hero-image" />
        </div>
      </section>

      <section className="properties-section slide-up delay-3">
        <h2 className="section-title">Available Properties</h2>
        
        {loading ? (
          <p className="loading-text">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="no-data-text">No properties available yet.</p>
        ) : (
          <div className="property-grid">
            {properties.map((property) => {
              const previewMedia = getPreviewMedia(property);
              const previewSrc = previewMedia
                ? previewMedia.thumbnailLink || `/api/properties/media/${previewMedia.fileId}`
                : null;

              return (
                <article key={property._id} className="property-card glass-panel">
                  <div className="property-preview">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={`${property.title} preview`}
                        className="property-preview-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="property-preview-fallback">
                        <span>No preview</span>
                      </div>
                    )}
                  </div>

                  <div className="property-info">
                    <div className="property-meta">
                      <p className="property-location">{property.location || "Location unavailable"}</p>
                      <span className="property-files">{property.mediaFiles?.length || 0} files</span>
                    </div>
                    <h3 className="property-name">{property.title}</h3>
                    <p className="property-description">{property.description || "No description available yet."}</p>
                  </div>

                  <div className="property-actions">
                    <Link to={`/property/${property._id}`} className="view-btn">
                      View Property
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
