import { Link } from "react-router-dom";

function HomePage({ properties, loading, onRefresh }) {
  return (
    <>
      <section className="card home-hero">
        <img src="/home image.png" alt="Home visual" />
        <div className="hero-copy">
          <h2>
            Extract. Organize.
            <br />
            <span>Document.</span>
          </h2>
          <p>Upload a google drive link and we will extract images, videos and details readme.md file for you.</p>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Properties</h2>
          <button onClick={onRefresh} disabled={loading}>
            Refresh
          </button>
        </div>

        {properties.length === 0 ? (
          <p>No properties available.</p>
        ) : (
          <div className="property-list">
            {properties.map((property) => (
              <article key={property._id} className="property-item">
                <div className="property-content">
                  <h3>{property.title}</h3>
                  <p>{property.description || "No description available."}</p>
                  <p>
                    <strong>Location:</strong> {property.location || "Unknown"}
                  </p>
                  <p>
                    <strong>Files:</strong> {property.mediaFiles?.length || 0}
                  </p>
                </div>
                <Link className="details-link" to={`/properties/${property._id}`}>
                  View Property
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default HomePage;
