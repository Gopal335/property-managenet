import { useCallback, useEffect, useMemo, useState } from "react";

const initialForm = {
  title: "",
  description: "",
  location: "",
  price: "",
  driveFolderUrl: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [readmeContent, setReadmeContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedProperty = useMemo(
    () => properties.find((property) => property._id === selectedPropertyId) || null,
    [properties, selectedPropertyId]
  );

  async function request(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Request failed.");
    }
    return response;
  }

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await request("/api/properties");
      const data = await response.json();
      setProperties(data);
      setSelectedPropertyId((current) => current || data[0]?._id || "");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      await loadProperties();
    }
    bootstrap();
  }, [loadProperties]);

  async function handleCreateProperty(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await request("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price || 0),
        }),
      });

      const created = await response.json();
      setProperties((current) => [created, ...current]);
      setSelectedPropertyId(created._id);
      setForm(initialForm);
      setReadmeContent("");
      setMessage("Property created successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function importFromDrive(propertyId) {
    setLoading(true);
    setMessage("");

    try {
      const response = await request(`/api/properties/${propertyId}/import-drive`, { method: "POST" });
      const updated = await response.json();
      setProperties((current) => current.map((property) => (property._id === propertyId ? updated : property)));
      setSelectedPropertyId(updated._id);
      setReadmeContent(updated.generatedReadme || "");
      setMessage(`Imported ${updated.mediaFiles.length} media file(s) from Google Drive.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadReadme(propertyId) {
    setLoading(true);
    setMessage("");
    try {
      const response = await request(`/api/properties/${propertyId}/readme`);
      const markdown = await response.text();
      setReadmeContent(markdown);
    } catch (error) {
      setMessage(error.message);
      setReadmeContent("");
    } finally {
      setLoading(false);
    }
  }

  function downloadReadme() {
    if (!selectedProperty || !readmeContent) return;
    const blob = new Blob([readmeContent], { type: "text/markdown;charset=utf-8;" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${selectedProperty.title.replace(/\s+/g, "_")}_README.md`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <main className="container">
      <h1>Property Listing Manager</h1>
      <p className="subtitle">
        Create properties, import photos/videos from Google Drive, and generate README reports automatically.
      </p>

      <section className="card">
        <h2>Create Property</h2>
        <form className="form-grid" onSubmit={handleCreateProperty}>
          <input
            required
            placeholder="Property title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          />
          <input
            type="number"
            min="0"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
          <input
            required
            placeholder="Google Drive folder URL"
            value={form.driveFolderUrl}
            onChange={(event) => setForm((current) => ({ ...current, driveFolderUrl: event.target.value }))}
          />
          <textarea
            rows="3"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Create Property"}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Properties</h2>
          <button onClick={loadProperties} disabled={loading}>
            Refresh
          </button>
        </div>

        {properties.length === 0 ? (
          <p>No properties yet.</p>
        ) : (
          <div className="property-list">
            {properties.map((property) => (
              <article key={property._id} className={`property-item ${selectedPropertyId === property._id ? "active" : ""}`}>
                <button className="property-select" onClick={() => setSelectedPropertyId(property._id)}>
                  <strong>{property.title}</strong>
                  <span>{property.location || "Unknown location"}</span>
                  <span>{property.mediaFiles.length} media file(s)</span>
                </button>
                <div className="actions">
                  <button onClick={() => importFromDrive(property._id)} disabled={loading}>
                    Import Drive Media
                  </button>
                  <button onClick={() => loadReadme(property._id)} disabled={loading}>
                    View README
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedProperty && (
        <section className="card">
          <h2>Media Preview: {selectedProperty.title}</h2>
          <div className="media-grid">
            {selectedProperty.mediaFiles?.length ? (
              selectedProperty.mediaFiles.map((file) => (
                <div key={file.fileId} className="media-card">
                  <p>{file.name}</p>
                  {file.mimeType.startsWith("image/") ? (
                    <img src={file.directUrl} alt={file.name} loading="lazy" />
                  ) : (
                    <video controls src={file.directUrl} />
                  )}
                </div>
              ))
            ) : (
              <p>No imported media yet. Click "Import Drive Media".</p>
            )}
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-header">
          <h2>Generated README.md</h2>
          <button onClick={downloadReadme} disabled={!readmeContent}>
            Download README
          </button>
        </div>
        <pre>{readmeContent || "README content will appear here after import."}</pre>
      </section>

      {message && <p className="message">{message}</p>}
    </main>
  );
}

export default App;
