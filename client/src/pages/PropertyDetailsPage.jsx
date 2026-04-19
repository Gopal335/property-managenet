import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function getDriveImagePreviewUrl(file) {
  return `/api/properties/media/${file.fileId}`;
}

function getDriveVideoPreviewUrl(file) {
  return `https://drive.google.com/file/d/${file.fileId}/preview`;
}

function getDisplayName(name) {
  const index = name.lastIndexOf(".");
  if (index <= 0) return name;
  return name.slice(0, index);
}

function PropertyDetailsPage({ properties, loading, onLoadReadme }) {
  const { propertyId } = useParams();
  const [readmeContent, setReadmeContent] = useState("");
  const [activeMediaIndex, setActiveMediaIndex] = useState(-1);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);

  const property = useMemo(
    () => properties.find((item) => item._id === propertyId) || null,
    [properties, propertyId]
  );

  const mediaFiles = property?.mediaFiles ?? [];
  const activeMedia = activeMediaIndex >= 0 ? mediaFiles[activeMediaIndex] : null;

  useEffect(() => {
    function onKeyDown(event) {
      if (activeMediaIndex < 0 || !mediaFiles.length) return;
      if (event.key === "Escape") setActiveMediaIndex(-1);
      if (event.key === "ArrowRight") {
        setActiveMediaIndex((current) => (current + 1) % mediaFiles.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveMediaIndex((current) => (current - 1 + mediaFiles.length) % mediaFiles.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeMediaIndex, mediaFiles.length]);

  if (!property) {
    return (
      <section className="card">
        <p>Property not found.</p>
        <Link to="/">Back to Home</Link>
      </section>
    );
  }

  async function handleLoadReadme() {
    const markdown = await onLoadReadme(property._id);
    setReadmeContent(markdown || "");
    setIsReadmeOpen(true);
  }

  function downloadReadme() {
    if (!readmeContent) return;
    const blob = new Blob([readmeContent], { type: "text/markdown;charset=utf-8;" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${property.title.replace(/\s+/g, "_")}_README.md`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <>
      <section className="card">
        <div className="section-header">
          <h2>{property.title}</h2>
          <Link to="/">Back</Link>
        </div>
        <div className="details-row">
          <div className="property-details">
            <p>{property.description || "No description available."}</p>
            <p>
              <strong>Location:</strong> {property.location || "Unknown"}
            </p>
            <p>
              <strong>Files:</strong> {property.mediaFiles?.length || 0}
            </p>
          </div>
          <div className="actions">
            <button onClick={handleLoadReadme} disabled={loading}>
              View README
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Property Media</h2>
        <div className="media-grid">
          {property.mediaFiles?.length ? (
            property.mediaFiles.map((file) => (
              <div key={file.fileId} className="media-card">
                <p className="media-name">{getDisplayName(file.name)}</p>
                <button
                  className="media-open-btn"
                  onClick={() => {
                    const index = property.mediaFiles.findIndex((media) => media.fileId === file.fileId);
                    setActiveMediaIndex(index);
                  }}
                >
                  <div className="media-preview-frame">
                    {file.mimeType.startsWith("image/") ? (
                      <img
                        src={getDriveImagePreviewUrl(file)}
                        alt={file.name}
                        loading="lazy"
                        onError={(event) => {
                          if (event.currentTarget.dataset.fallbackApplied === "true") return;
                          event.currentTarget.dataset.fallbackApplied = "true";
                          event.currentTarget.src = file.thumbnailLink || file.directUrl;
                        }}
                      />
                    ) : (
                      <div className="video-preview-placeholder">
                        <iframe
                          src={getDriveVideoPreviewUrl(file)}
                          title={`${file.name}-preview`}
                          loading="lazy"
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                        <div className="video-overlay">
                          <span>Play</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))
          ) : (
            <p>No media imported yet.</p>
          )}
        </div>
      </section>

      {activeMedia && (
        <div className="lightbox-backdrop" onClick={() => setActiveMediaIndex(-1)}>
          <div className="lightbox-modal" onClick={(event) => event.stopPropagation()}>
            <div className="lightbox-thumbnails">
              {property.mediaFiles.map((file, index) => (
                <button
                  key={file.fileId}
                  className={`thumb-btn ${index === activeMediaIndex ? "active" : ""}`}
                  onClick={() => setActiveMediaIndex(index)}
                  title={getDisplayName(file.name)}
                >
                  {file.mimeType.startsWith("image/") ? (
                    <img src={getDriveImagePreviewUrl(file)} alt={getDisplayName(file.name)} />
                  ) : (
                    <span className="video-thumb-label">Video</span>
                  )}
                </button>
              ))}
            </div>

            <div className="lightbox-content">
              <button
                className="nav-btn"
                onClick={() =>
                  setActiveMediaIndex((current) => (current - 1 + property.mediaFiles.length) % property.mediaFiles.length)
                }
              >
                Prev
              </button>

              <div className="lightbox-media-wrap">
                <p className="lightbox-title">{getDisplayName(activeMedia.name)}</p>
                {activeMedia.mimeType.startsWith("image/") ? (
                  <img
                    className="lightbox-media"
                    src={getDriveImagePreviewUrl(activeMedia)}
                    alt={activeMedia.name}
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallbackApplied === "true") return;
                      event.currentTarget.dataset.fallbackApplied = "true";
                      event.currentTarget.src = activeMedia.thumbnailLink || activeMedia.directUrl;
                    }}
                  />
                ) : (
                  <iframe
                    className="lightbox-media"
                    title={activeMedia.name}
                    src={getDriveVideoPreviewUrl(activeMedia)}
                    allow="autoplay; fullscreen"
                  />
                )}
                <a href={activeMedia.webViewLink || activeMedia.directUrl} target="_blank" rel="noreferrer">
                  Open in Google Drive
                </a>
              </div>

              <button
                className="nav-btn"
                onClick={() => setActiveMediaIndex((current) => (current + 1) % mediaFiles.length)}
              >
                Next
              </button>
            </div>

            <button className="close-btn" onClick={() => setActiveMediaIndex(-1)}>
              Close
            </button>
          </div>
        </div>
      )}

      {isReadmeOpen && (
        <div className="lightbox-backdrop" onClick={() => setIsReadmeOpen(false)}>
          <div className="readme-modal" onClick={(event) => event.stopPropagation()}>
            <div className="section-header">
              <h2>README.md</h2>
              <div className="actions">
                <button onClick={downloadReadme} disabled={!readmeContent}>
                  Download README
                </button>
                <button className="close-btn" onClick={() => setIsReadmeOpen(false)}>
                  Close
                </button>
              </div>
            </div>
            <pre>{readmeContent || "README is not available for this property yet."}</pre>
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyDetailsPage;
