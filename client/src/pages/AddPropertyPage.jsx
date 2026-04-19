import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialForm = {
  title: "",
  description: "",
  location: "",
  price: "",
  driveFolderUrl: "",
};

function AddPropertyPage({ onCreate, loading }) {
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const created = await onCreate({
      ...form,
      price: Number(form.price || 0),
    });
    if (created?._id) {
      navigate("/");
    }
  }

  return (
    <section className="card">
      <h2>Add New Property</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
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
          rows="4"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Property"}
        </button>
        <button type="button" className="secondary-btn" onClick={() => navigate("/")}>
          Cancel
        </button>
      </form>
    </section>
  );
}

export default AddPropertyPage;
