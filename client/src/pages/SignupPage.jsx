import { useState } from "react";
import { Link } from "react-router-dom";

function SignupPage({ onSignup, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    await onSignup({ name, email, password });
  }

  return (
    <section className="card auth-card auth-layout">
      <div className="auth-visual">
        <img src="/signinandsignup.png" alt="Sign up visual" />
      </div>
      <div className="auth-form-pane">
        <h2>Create an account</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            required
            placeholder="Password (minimum 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Create Account"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default SignupPage;
