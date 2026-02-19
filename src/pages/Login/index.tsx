import logoUrl from "@/assets/images/logo-adletic.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { firebaseApp } from "@/firebaseconfig";

function Main() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignIn = async () => {
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch('https://bisnesgpt.jutateknologi.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/chat');
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isLoading) {
      handleSignIn();
    }
  };

  const handleForgotPassword = async () => {
    const auth = getAuth(firebaseApp);
    setError("");
    setResetMessage("");
    if (!resetEmail) {
      setResetMessage("Please enter your email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setResetEmail("");
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage("");
      }, 3000);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case "auth/invalid-email":
          setResetMessage("Please enter a valid email address.");
          break;
        case "auth/user-not-found":
          setResetMessage("No account found with this email.");
          break;
        default:
          setResetMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #ffffff;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          width: 45%;
          background: #4b4b4b;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
          overflow: hidden;
          border-right: 3px solid #f26522;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -20%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(242,101,34,0.18) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: auth-drift 12s ease-in-out infinite;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          bottom: -20%;
          left: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(242,101,34,0.12) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          animation: auth-drift 18s ease-in-out infinite reverse;
        }
        @keyframes auth-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
        }

        .auth-left-content { position: relative; z-index: 2; }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 3rem;
        }
        .auth-brand img { height: 40px; width: auto; }
        .auth-brand-name {
          font-size: 1.2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .auth-brand-name span { color: #f26522; }

        .auth-left-headline {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 900;
          color: #f26522;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
        }
        .auth-left-sub {
          font-size: 1rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .auth-feature {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auth-feature-dot {
          width: 8px;
          height: 8px;
          background: #f26522;
          border-radius: 0;
          flex-shrink: 0;
        }
        .auth-feature-text {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .auth-left-footer {
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1.5rem;
        }
        .auth-left-footer p {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #ffffff;
          position: relative;
        }
        .auth-form-wrap {
          width: 100%;
          max-width: 400px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-form-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .auth-form-title {
          font-size: 1.8rem;
          font-weight: 900;
          color: #4b4b4b;
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
        }
        .auth-form-subtitle {
          font-size: 0.9rem;
          color: #8b8b8b;
          margin-bottom: 2.5rem;
          line-height: 1.5;
        }

        /* ── FIELDS ── */
        .auth-field {
          margin-bottom: 1.25rem;
        }
        .auth-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .auth-input-wrap {
          position: relative;
        }
        .auth-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 2px solid #e8e8e8;
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: #4b4b4b;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .auth-input:hover {
          border-color: rgba(242,101,34,0.4);
        }
        .auth-input:focus {
          border-color: #f26522;
          box-shadow: 4px 4px 0 rgba(242,101,34,0.15);
        }
        .auth-input::placeholder { color: #c0c0c0; }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #c0c0c0;
          transition: color 0.2s;
          pointer-events: none;
        }
        .auth-input:focus ~ .auth-input-icon,
        .auth-input-wrap:focus-within .auth-input-icon {
          color: #f26522;
        }
        .auth-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #c0c0c0;
          transition: color 0.2s;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .auth-eye-btn:hover { color: #f26522; }

        /* ── FORGOT ── */
        .auth-forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: -0.5rem;
          margin-bottom: 1.5rem;
        }
        .auth-forgot-btn {
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #f26522;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }
        .auth-forgot-btn:hover { opacity: 0.75; }

        /* ── ERROR ── */
        .auth-error {
          background: rgba(239,68,68,0.06);
          border: 2px solid rgba(239,68,68,0.3);
          padding: 10px 14px;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: #ef4444;
          font-weight: 500;
        }

        /* ── SUBMIT ── */
        .auth-submit {
          width: 100%;
          padding: 14px 24px;
          background: #f26522;
          color: #ffffff;
          border: 2px solid #f26522;
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1.5rem;
        }
        .auth-submit:hover:not(:disabled) {
          transform: translate(2px, -2px);
          box-shadow: 4px 4px 0 #4b4b4b;
        }
        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── DIVIDER ── */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.25rem;
        }
        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: #e8e8e8;
        }
        .auth-divider-text {
          font-size: 0.75rem;
          color: #b0b0b0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        /* ── SECONDARY BTN ── */
        .auth-secondary {
          width: 100%;
          padding: 13px 24px;
          background: transparent;
          color: #4b4b4b;
          border: 2px solid #4b4b4b;
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .auth-secondary:hover {
          transform: translate(-2px, -2px);
          box-shadow: -4px 4px 0 #4b4b4b;
        }

        /* ── SPINNER ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* ── MODAL ── */
        .auth-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .auth-modal {
          background: #ffffff;
          border: 2px solid #4b4b4b;
          width: 100%;
          max-width: 380px;
          padding: 2rem;
          position: relative;
        }
        .auth-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: #f26522;
        }
        .auth-modal-title {
          font-size: 1.1rem;
          font-weight: 900;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.4rem;
        }
        .auth-modal-sub {
          font-size: 0.83rem;
          color: #8b8b8b;
          margin-bottom: 1.5rem;
        }
        .auth-modal-msg {
          padding: 10px 14px;
          border: 2px solid;
          font-size: 0.82rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .auth-modal-msg.success { border-color: rgba(16,185,129,0.4); color: #059669; background: rgba(16,185,129,0.05); }
        .auth-modal-msg.error { border-color: rgba(239,68,68,0.3); color: #ef4444; background: rgba(239,68,68,0.05); }
        .auth-modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 1rem;
        }
        .auth-modal-cancel {
          flex: 1;
          padding: 11px;
          background: transparent;
          border: 2px solid #e8e8e8;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          border-radius: 0;
          transition: all 0.2s;
        }
        .auth-modal-cancel:hover { border-color: #4b4b4b; }
        .auth-modal-send {
          flex: 1;
          padding: 11px;
          background: #f26522;
          border: 2px solid #f26522;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          border-radius: 0;
          transition: all 0.2s;
        }
        .auth-modal-send:hover {
          transform: translate(2px, -2px);
          box-shadow: 3px 3px 0 #4b4b4b;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .auth-root { flex-direction: column; }
          .auth-left {
            width: 100%;
            padding: 2rem 1.5rem;
            border-right: none;
            border-bottom: 3px solid #f26522;
          }
          .auth-left-headline { font-size: 1.8rem; }
          .auth-features { display: none; }
          .auth-left-footer { display: none; }
          .auth-right { padding: 2rem 1.5rem; }
          .auth-form-wrap { max-width: 100%; }
        }
      `}</style>

      <div className="auth-root">

        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-brand">
              <img src={logoUrl} alt="Adletic CRM" />
              <span className="auth-brand-name">Adletic <span>CRM</span></span>
            </div>
            <h2 className="auth-left-headline">
              Close More.<br />Stress Less.
            </h2>
            <p className="auth-left-sub">
              The CRM built for Malaysian businesses. Manage every lead, automate follow-ups, and grow your revenue — all from one dashboard.
            </p>
            <div className="auth-features">
              {[
                "WhatsApp inbox, centralised",
                "Auto follow-up sequences",
                "AI-powered responses",
                "Real-time pipeline tracking",
                "Daily performance reports",
              ].map((f) => (
                <div key={f} className="auth-feature">
                  <div className="auth-feature-dot" />
                  <span className="auth-feature-text">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-left-footer">
            <p>&copy; {new Date().getFullYear()} Adletic CRM. All rights reserved.</p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className={`auth-form-wrap ${isVisible ? "visible" : ""}`}>

            <div className="auth-form-title">Welcome Back</div>
            <p className="auth-form-subtitle">Sign in to continue to your CRM dashboard.</p>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ paddingRight: "42px" }}
                />
                <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="auth-forgot">
              <button className="auth-forgot-btn" onClick={() => setShowResetModal(true)}>
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button className="auth-submit" onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">New to Adletic CRM?</span>
              <div className="auth-divider-line" />
            </div>

            <button className="auth-secondary" onClick={() => navigate("/register")}>
              Create Account
            </button>

          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showResetModal && (
        <div className="auth-modal-overlay" onClick={() => { setShowResetModal(false); setResetMessage(""); setResetEmail(""); }}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-title">Reset Password</div>
            <p className="auth-modal-sub">Enter your email and we'll send you a reset link.</p>

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {resetMessage && (
              <div className={`auth-modal-msg ${resetMessage.includes("sent") ? "success" : "error"}`}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {resetMessage.includes("sent")
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  }
                </svg>
                {resetMessage}
              </div>
            )}

            <div className="auth-modal-actions">
              <button className="auth-modal-cancel" onClick={() => { setShowResetModal(false); setResetMessage(""); setResetEmail(""); }}>
                Cancel
              </button>
              <button className="auth-modal-send" onClick={handleForgotPassword}>
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Main;
