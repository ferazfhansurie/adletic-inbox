import logoUrl from "@/assets/images/logo-adletic.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { getCountryCallingCode, parsePhoneNumber, AsYouType, CountryCode } from 'libphonenumber-js';

function Main() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerResult, setRegisterResult] = useState<string | null>(null);
  const [selectedCountry] = useState<CountryCode>('MY');
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatPhoneNumber = (number: string) => {
    try {
      const parsed = parsePhoneNumber(number, selectedCountry);
      return parsed ? parsed.format('E.164') : number;
    } catch (error) {
      const countryCode = getCountryCallingCode(selectedCountry);
      const cleaned = number.replace(/[^\d]/g, '');
      return `+${countryCode}${cleaned}`;
    }
  };

  const handleRegister = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setRegisterResult(null);

      const timestamp = Date.now().toString().slice(-6);
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newCompanyId = `${randomPart}${timestamp.slice(-3)}`;

      const userResponse = await axios.post(`https://bisnesgpt.jutateknologi.com/api/create-user/${encodeURIComponent(email)}/${encodeURIComponent(formatPhoneNumber(phoneNumber))}/${encodeURIComponent(password)}/1/${newCompanyId}`);

      if (userResponse.data) {
        const channelResponse = await axios.post(`https://bisnesgpt.jutateknologi.com/api/channel/create/${newCompanyId}`, {
          name,
          companyName,
          phoneNumber: formatPhoneNumber(phoneNumber),
          email,
          password,
          plan: 'free',
          country: selectedCountry,
        });

        if (channelResponse.data) {
          const response = await fetch('https://bisnesgpt.jutateknologi.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          if (response.ok) {
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userData', JSON.stringify(data.user));
            navigate('/loading');
            toast.success("Registration successful!");
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || error.message;
        setRegisterResult(msg);
        toast.error(`Registration failed: ${msg}`);
      } else if (error instanceof Error) {
        setRegisterResult(error.message);
        toast.error("Failed to register: " + error.message);
      } else {
        setRegisterResult("Unexpected error occurred");
        toast.error("Failed to register: Unexpected error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isLoading) handleRegister();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatter = new AsYouType(selectedCountry);
    setPhoneNumber(formatter.input(e.target.value));
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
          width: 40%;
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
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 900;
          color: #f26522;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
        }
        .auth-left-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .auth-steps {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .auth-step {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .auth-step-num {
          width: 28px;
          height: 28px;
          background: #f26522;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .auth-step-text {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
          line-height: 1.5;
        }
        .auth-step-text strong { color: #fff; display: block; margin-bottom: 2px; }

        .auth-left-footer {
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1.5rem;
          margin-top: 3rem;
        }
        .auth-left-footer p {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          background: #ffffff;
          overflow-y: auto;
        }
        .auth-form-wrap {
          width: 100%;
          max-width: 420px;
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
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        /* ── FIELDS ── */
        .auth-field { margin-bottom: 1.1rem; }
        .auth-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 1.1rem;
        }
        .auth-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 2px solid #e8e8e8;
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #4b4b4b;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .auth-input:hover { border-color: rgba(242,101,34,0.4); }
        .auth-input:focus {
          border-color: #f26522;
          box-shadow: 4px 4px 0 rgba(242,101,34,0.12);
        }
        .auth-input::placeholder { color: #c0c0c0; }
        .auth-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          color: #c0c0c0;
          transition: color 0.2s;
          pointer-events: none;
        }
        .auth-input-wrap:focus-within .auth-input-icon { color: #f26522; }
        .auth-eye-btn {
          position: absolute;
          right: 13px;
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

        /* ── ERROR ── */
        .auth-error {
          background: rgba(239,68,68,0.06);
          border: 2px solid rgba(239,68,68,0.3);
          padding: 10px 14px;
          margin-bottom: 1.1rem;
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
          margin-bottom: 1.25rem;
        }
        .auth-submit:hover:not(:disabled) {
          transform: translate(2px, -2px);
          box-shadow: 4px 4px 0 #4b4b4b;
        }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── DIVIDER ── */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.1rem;
        }
        .auth-divider-line { flex: 1; height: 1px; background: #e8e8e8; }
        .auth-divider-text {
          font-size: 0.72rem;
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
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
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
          .auth-left-headline { font-size: 1.6rem; }
          .auth-steps { display: none; }
          .auth-left-footer { display: none; }
          .auth-right { padding: 2rem 1.5rem; }
          .auth-form-wrap { max-width: 100%; }
          .auth-field-row { grid-template-columns: 1fr; }
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
              Start Closing<br />In Minutes.
            </h2>
            <p className="auth-left-sub">
              Set up your CRM in 3 steps. No IT team, no complicated onboarding — just connect and start managing your leads.
            </p>
            <div className="auth-steps">
              {[
                { num: "01", title: "Create your account", desc: "Fill in your details and get instant access." },
                { num: "02", title: "Connect WhatsApp", desc: "Link your business number in under 2 minutes." },
                { num: "03", title: "Manage & Close", desc: "Start tracking leads and automating follow-ups." },
              ].map((s) => (
                <div key={s.num} className="auth-step">
                  <div className="auth-step-num">{s.num}</div>
                  <div className="auth-step-text">
                    <strong>{s.title}</strong>
                    {s.desc}
                  </div>
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

            <div className="auth-form-title">Create Account</div>
            <p className="auth-form-subtitle">7 days free. No credit card required.</p>

            {/* Name + Company */}
            <div className="auth-field-row">
              <div>
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="auth-label">Company</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label className="auth-label">Phone Number</label>
              <div className="auth-input-wrap">
                <input
                  type="tel"
                  className="auth-input"
                  placeholder={`+${getCountryCallingCode(selectedCountry)} 123 456 789`}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onKeyDown={handleKeyDown}
                />
                <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ paddingRight: "40px" }}
                />
                <svg className="auth-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {registerResult && (
              <div className="auth-error">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {registerResult}
              </div>
            )}

            {/* Submit */}
            <button className="auth-submit" onClick={handleRegister} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="auth-spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  Get Started →
                </>
              )}
            </button>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">Already have an account?</span>
              <div className="auth-divider-line" />
            </div>

            <button className="auth-secondary" onClick={() => navigate("/login")}>
              Sign In
            </button>

          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default Main;
