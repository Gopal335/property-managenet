import { useState } from "react";
import { Link } from "react-router-dom";

function LoginPage({ onLogin, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    await onLogin({ email, password });
  }

  return (
    <section className="card auth-card auth-layout">
      <div className="auth-visual">
        <img src="/signinandsignup.png" alt="Sign in visual" />
      </div>
      <div className="auth-form-pane">
        <h2>Welcome back!</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
        <p>
          New user? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
