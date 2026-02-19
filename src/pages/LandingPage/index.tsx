import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/images/logo-adletic.png";
import heroVideo from "@/assets/video/hero.mp4";

function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: "💬",
      title: "WhatsApp Inbox",
      desc: "Centralise all WhatsApp conversations in one place. Never miss a lead again.",
    },
    {
      icon: "📊",
      title: "Lead Pipeline",
      desc: "Track every lead from first contact to closed deal with a visual pipeline.",
    },
    {
      icon: "⚡",
      title: "Auto Follow-Ups",
      desc: "Set automated follow-up sequences so no lead goes cold. Works while you sleep.",
    },
    {
      icon: "🤖",
      title: "AI Responses",
      desc: "Let AI handle common queries instantly. Save hours of manual typing every day.",
    },
    {
      icon: "📅",
      title: "Appointment Booking",
      desc: "Let customers book slots directly. Sync everything to your calendar automatically.",
    },
    {
      icon: "📈",
      title: "Analytics & Reports",
      desc: "Know your numbers — response rate, conversion, revenue — at a glance.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Connect Your WhatsApp",
      desc: "Link your WhatsApp Business account in minutes. No tech skills needed.",
    },
    {
      num: "02",
      title: "Import Your Leads",
      desc: "Bring in your existing contacts or start fresh. We organise everything for you.",
    },
    {
      num: "03",
      title: "Close More Deals",
      desc: "Use automations, AI replies, and a clear pipeline to convert faster.",
    },
  ];

  const plans = [
    {
      name: "STARTER",
      price: "RM 199",
      period: "/mo",
      desc: "For solopreneurs getting started.",
      features: [
        "1 WhatsApp number",
        "Up to 500 contacts",
        "Basic pipeline",
        "Auto follow-ups",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "GROWTH",
      price: "RM 499",
      period: "/mo",
      desc: "Most popular for growing SMEs.",
      features: [
        "3 WhatsApp numbers",
        "Up to 5,000 contacts",
        "Full pipeline + analytics",
        "AI responses",
        "Appointment booking",
        "Priority support",
        "Blast messaging",
      ],
      cta: "Get Started",
      highlighted: true,
    },
    {
      name: "SCALE",
      price: "RM 999",
      period: "/mo",
      desc: "For teams serious about scaling.",
      features: [
        "Unlimited WhatsApp numbers",
        "Unlimited contacts",
        "Advanced AI + automations",
        "Split testing",
        "Dedicated account manager",
        "Custom integrations",
        "SLA support",
      ],
      cta: "Book a Demo",
      highlighted: false,
    },
  ];

  const stats = [
    { num: "2,400+", label: "Leads Managed" },
    { num: "68%", label: "Faster Response Time" },
    { num: "3.2x", label: "Average Conversion Lift" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .lp-root {
          font-family: 'Inter', sans-serif;
          color: #4b4b4b;
          background: #ffffff;
          overflow-x: hidden;
        }

        /* ── NAV ── */
        .lp-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(242,101,34,0.12);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .lp-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .lp-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .lp-logo img { height: 36px; width: auto; }
        .lp-logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #4b4b4b;
          letter-spacing: -0.02em;
        }
        .lp-logo-text span { color: #f26522; }
        .lp-nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .lp-nav-link {
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #4b4b4b;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
          position: relative;
        }
        .lp-nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #f26522;
          transition: width 0.3s ease;
        }
        .lp-nav-link:hover { color: #f26522; }
        .lp-nav-link:hover::after { width: 100%; }
        .lp-nav-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        /* ── BUTTONS ── */
        .lp-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          border: 2px solid;
          padding: 10px 28px;
          border-radius: 0;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .lp-btn-primary {
          background: #f26522;
          color: #fff;
          border-color: #f26522;
        }
        .lp-btn-primary:hover {
          transform: translate(2px, -2px);
          box-shadow: 4px 4px 0 #4b4b4b;
        }
        .lp-btn-secondary {
          background: transparent;
          color: #4b4b4b;
          border-color: #4b4b4b;
        }
        .lp-btn-secondary:hover {
          transform: translate(-2px, -2px);
          box-shadow: -4px 4px 0 #4b4b4b;
        }
        .lp-btn-outline {
          background: transparent;
          color: #f26522;
          border-color: #f26522;
        }
        .lp-btn-outline:hover {
          background: #f26522;
          color: #fff;
          transform: translate(2px, -2px);
          box-shadow: 4px 4px 0 #4b4b4b;
        }
        .lp-btn-lg {
          padding: 16px 44px;
          font-size: 1rem;
        }

        /* ── HERO ── */
        .lp-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #ffffff 0%, rgba(242,101,34,0.05) 50%, rgba(138,43,226,0.03) 100%);
          position: relative;
          overflow: hidden;
          border-bottom: 3px solid #4b4b4b;
        }
        .lp-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(242,101,34,0.1) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 0;
          animation: lp-drift 15s ease-in-out infinite;
          filter: blur(60px);
        }
        .lp-hero::after {
          content: '';
          position: absolute;
          bottom: -20%;
          left: 5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(138,43,226,0.08) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 0;
          animation: lp-drift 20s ease-in-out infinite reverse;
          filter: blur(60px);
        }
        @keyframes lp-drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(30px,30px); }
        }
        .lp-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        .lp-hero-content {
          text-align: left;
        }
        .lp-hero-content .lp-hero-cta {
          justify-content: flex-start;
        }
        .lp-hero-content .lp-stats {
          margin: 0;
        }
        /* ── HERO VISUAL ── */
        .lp-hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-hero-visual-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(ellipse at 60% 50%, rgba(242,101,34,0.22) 0%, rgba(138,43,226,0.1) 50%, transparent 75%);
          filter: blur(40px);
          border-radius: 50%;
          z-index: 0;
          animation: lp-glow-pulse 4s ease-in-out infinite;
        }
        @keyframes lp-glow-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .lp-browser {
          position: relative;
          z-index: 2;
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid rgba(75,75,75,0.25);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.6),
            0 30px 80px rgba(0,0,0,0.18),
            0 10px 30px rgba(242,101,34,0.12);
          transform: perspective(1100px) rotateY(-6deg) rotateX(3deg);
          transition: transform 0.5s ease;
          background: #1a1a1a;
        }
        .lp-browser:hover {
          transform: perspective(1100px) rotateY(-2deg) rotateX(1deg);
        }
        .lp-browser-bar {
          background: #2a2a2a;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .lp-browser-dots {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .lp-browser-dots span {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          display: block;
        }
        .lp-browser-dots span:nth-child(1) { background: #ff5f57; }
        .lp-browser-dots span:nth-child(2) { background: #febc2e; }
        .lp-browser-dots span:nth-child(3) { background: #28c840; }
        .lp-browser-url {
          flex: 1;
          background: rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.45);
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          white-space: nowrap;
        }
        .lp-browser-url-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #28c840;
          flex-shrink: 0;
        }
        .lp-browser-video {
          display: block;
          width: 100%;
          aspect-ratio: 16/10;
          object-fit: cover;
        }

        /* ── FLOATING BADGES ── */
        .lp-float-badge {
          position: absolute;
          z-index: 10;
          background: #fff;
          border: 2px solid #4b4b4b;
          border-radius: 12px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          color: #4b4b4b;
          white-space: nowrap;
          box-shadow: 3px 3px 0 #f26522;
          animation: lp-float 3s ease-in-out infinite;
        }
        .lp-float-badge:nth-child(2) { animation-delay: 0.8s; animation-duration: 3.5s; }
        .lp-float-badge:nth-child(3) { animation-delay: 1.6s; animation-duration: 2.8s; }
        .lp-float-badge:nth-child(4) { animation-delay: 0.4s; animation-duration: 4s; }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .lp-float-badge-icon { font-size: 1rem; }
        .lp-float-badge-label { line-height: 1.2; }
        .lp-float-badge-label small {
          display: block;
          font-size: 0.65rem;
          font-weight: 500;
          color: #6b6b6b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .lp-badge-tl { top: -18px; left: -18px; }
        .lp-badge-tr { top: -18px; right: -14px; }
        .lp-badge-bl { bottom: 12px; left: -22px; }
        .lp-badge-br { bottom: -18px; right: -14px; }
        .lp-badge {
          display: inline-block;
          padding: 6px 18px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          background: rgba(242,101,34,0.1);
          color: #f26522;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.5rem;
        }
        .lp-h1 {
          font-size: clamp(3rem, 9vw, 5.5rem);
          font-weight: 900;
          color: #f26522;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        .lp-h1 span { color: #4b4b4b; }
        .lp-hero-sub {
          font-size: 1.2rem;
          color: #4b4b4b;
          max-width: 680px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }
        .lp-hero-cta {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 4rem;
        }
        .lp-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 2rem;
          max-width: 600px;
          margin: 0 auto;
          padding-top: 2.5rem;
          border-top: 2px solid #4b4b4b;
        }
        .lp-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .lp-stat-num {
          font-size: 2.5rem;
          font-weight: 800;
          color: #f26522;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .lp-stat-label {
          font-size: 0.85rem;
          color: #4b4b4b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── SECTION COMMONS ── */
        .lp-section {
          padding: 90px 20px;
        }
        .lp-section-alt {
          background: #F5F5F5;
        }
        .lp-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .lp-section-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .lp-h2 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900;
          color: #f26522;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.75rem;
          line-height: 1.1;
        }
        .lp-section-sub {
          font-size: 1.1rem;
          color: #4b4b4b;
          max-width: 560px;
          margin: 0 auto;
          font-weight: 500;
          line-height: 1.7;
        }

        /* ── PROBLEM ── */
        .lp-problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .lp-problem-card {
          background: #fff;
          border: 2px solid rgba(242,101,34,0.25);
          border-radius: 12px;
          padding: 1.75rem;
          transition: all 0.3s ease;
        }
        .lp-problem-card:hover {
          border-color: #f26522;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .lp-problem-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
          display: block;
        }
        .lp-problem-title {
          font-size: 1rem;
          font-weight: 800;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .lp-problem-desc {
          font-size: 0.9rem;
          color: #6b6b6b;
          line-height: 1.6;
          margin: 0;
        }

        /* ── FEATURES ── */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.75rem;
        }
        .lp-feature-card {
          background: #fff;
          border: 2px solid rgba(242,101,34,0.2);
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
        }
        .lp-feature-card:hover {
          border-color: #f26522;
          box-shadow: 4px 4px 0 #f26522;
          transform: translate(-2px, -2px);
        }
        .lp-feature-icon {
          font-size: 2.8rem;
          margin-bottom: 1rem;
          display: inline-block;
          animation: lp-bounce 2.5s ease-in-out infinite;
        }
        .lp-feature-card:nth-child(2) .lp-feature-icon { animation-delay: 0.2s; }
        .lp-feature-card:nth-child(3) .lp-feature-icon { animation-delay: 0.4s; }
        .lp-feature-card:nth-child(4) .lp-feature-icon { animation-delay: 0.6s; }
        .lp-feature-card:nth-child(5) .lp-feature-icon { animation-delay: 0.8s; }
        .lp-feature-card:nth-child(6) .lp-feature-icon { animation-delay: 1s; }
        @keyframes lp-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .lp-feature-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f26522;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.6rem;
        }
        .lp-feature-desc {
          font-size: 0.9rem;
          color: #4b4b4b;
          line-height: 1.65;
          margin: 0;
        }

        /* ── HOW IT WORKS ── */
        .lp-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          position: relative;
        }
        .lp-step {
          text-align: center;
          padding: 2.5rem 2rem;
          background: #fff;
          border: 2px solid #4b4b4b;
          position: relative;
          transition: all 0.3s ease;
        }
        .lp-step:hover {
          transform: translate(-3px,-3px);
          box-shadow: 6px 6px 0 #4b4b4b;
        }
        .lp-step-num {
          font-size: 3.5rem;
          font-weight: 900;
          color: rgba(242,101,34,0.15);
          line-height: 1;
          margin-bottom: 1rem;
          letter-spacing: -0.04em;
        }
        .lp-step-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.75rem;
        }
        .lp-step-desc {
          font-size: 0.9rem;
          color: #6b6b6b;
          line-height: 1.65;
          margin: 0;
        }

        /* ── PRICING ── */
        .lp-pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        .lp-pricing-card {
          background: #fff;
          border: 2px solid #4b4b4b;
          padding: 2.5rem 2rem;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        .lp-pricing-card:hover {
          transform: translate(-3px,-3px);
          box-shadow: 6px 6px 0 #4b4b4b;
        }
        .lp-pricing-card.lp-highlighted {
          background: #4b4b4b;
          color: #fff;
        }
        .lp-pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #f26522;
          color: #fff;
          padding: 5px 16px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .lp-plan-name {
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.5rem;
          color: inherit;
        }
        .lp-plan-price {
          font-size: 2.8rem;
          font-weight: 900;
          color: #f26522;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .lp-highlighted .lp-plan-price { color: #f26522; }
        .lp-plan-period {
          font-size: 0.9rem;
          font-weight: 500;
          color: inherit;
          opacity: 0.7;
          margin-bottom: 0.5rem;
        }
        .lp-plan-desc {
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
          color: inherit;
          opacity: 0.8;
        }
        .lp-plan-btn {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 24px;
          border: 2px solid;
          cursor: pointer;
          border-radius: 0;
          margin-bottom: 1.75rem;
          width: 100%;
          transition: all 0.3s ease;
        }
        .lp-plan-btn-dark {
          background: #4b4b4b;
          color: #fff;
          border-color: #4b4b4b;
        }
        .lp-plan-btn-dark:hover {
          background: transparent;
          color: #4b4b4b;
        }
        .lp-plan-btn-light {
          background: #fff;
          color: #4b4b4b;
          border-color: #fff;
        }
        .lp-plan-btn-light:hover {
          background: transparent;
          color: #fff;
          border-color: #fff;
        }
        .lp-plan-features {
          text-align: left;
          flex-grow: 1;
          border-top: 2px solid currentColor;
          padding-top: 1.25rem;
          opacity: 0.9;
        }
        .lp-plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .lp-plan-features li {
          font-size: 0.875rem;
          padding: 0.6rem 0;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: inherit;
        }
        .lp-check {
          color: #f26522;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .lp-highlighted .lp-check { color: #f26522; }
        .lp-pricing-footer {
          text-align: center;
          padding: 1.5rem 2rem;
          border: 2px solid #4b4b4b;
          background: #fff;
        }
        .lp-pricing-footer p {
          margin: 0;
          font-size: 0.9rem;
          color: #4b4b4b;
          font-weight: 500;
        }

        /* ── CTA ── */
        .lp-cta {
          background: #4b4b4b;
          border-top: 3px solid #f26522;
          border-bottom: 3px solid #f26522;
          padding: 90px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .lp-cta::before {
          content: '';
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(242,101,34,0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .lp-cta-inner { position: relative; z-index: 2; }
        .lp-cta h2 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900;
          color: #f26522;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 1rem;
        }
        .lp-cta p {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.8);
          max-width: 500px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }
        .lp-cta-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ── FOOTER ── */
        .lp-footer {
          background: #fff;
          border-top: 3px solid #4b4b4b;
          padding: 60px 20px 30px;
        }
        .lp-footer-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        .lp-footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1rem;
        }
        .lp-footer-logo img { height: 32px; width: auto; }
        .lp-footer-logo-text {
          font-size: 1rem;
          font-weight: 800;
          color: #4b4b4b;
        }
        .lp-footer-logo-text span { color: #f26522; }
        .lp-footer-tagline {
          font-size: 0.85rem;
          color: #8b8b8b;
          line-height: 1.6;
          margin-bottom: 0;
        }
        .lp-footer-col h4 {
          font-size: 0.8rem;
          font-weight: 800;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
        }
        .lp-footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .lp-footer-col ul li {
          margin-bottom: 0.6rem;
        }
        .lp-footer-col ul li a {
          font-size: 0.875rem;
          color: #6b6b6b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-footer-col ul li a:hover { color: #f26522; }
        .lp-footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 1.5rem;
          border-top: 1px solid #e8e8e8;
          text-align: center;
        }
        .lp-footer-bottom p {
          font-size: 0.8rem;
          color: #8b8b8b;
          margin: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .lp-nav-links { display: none; }
          .lp-hero { padding: 80px 16px 60px; min-height: auto; }
          .lp-hero-inner { grid-template-columns: 1fr; gap: 3rem; }
          .lp-hero-content { text-align: center; }
          .lp-hero-content .lp-hero-cta { justify-content: center; }
          .lp-hero-content .lp-stats { margin: 0 auto; }
          .lp-browser { transform: none; }
          .lp-browser:hover { transform: none; }
          .lp-float-badge { display: none; }
          .lp-section { padding: 60px 16px; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .lp-h1 { font-size: clamp(2.2rem, 7vw, 3.5rem); }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-pricing-grid { grid-template-columns: 1fr; }
          .lp-steps { grid-template-columns: 1fr; }
          .lp-problem-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .lp-footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .lp-hero-cta { flex-direction: column; align-items: center; }
          .lp-btn-lg { width: 100%; justify-content: center; }
          .lp-cta-actions { flex-direction: column; align-items: center; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── NAVIGATION ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <div className="lp-logo">
              <img src={logoUrl} alt="Adletic CRM" />
              <span className="lp-logo-text">Adletic <span>CRM</span></span>
            </div>
            <div className="lp-nav-links">
              <button className="lp-nav-link" onClick={() => scrollTo("features")}>Features</button>
              <button className="lp-nav-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
              <button className="lp-nav-link" onClick={() => scrollTo("pricing")}>Pricing</button>
            </div>
            <div className="lp-nav-actions">
              <button className="lp-btn lp-btn-secondary" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="lp-btn lp-btn-primary" onClick={() => navigate("/register")}>
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero" id="home">
          <div className="lp-hero-inner">
            <div className="lp-hero-content">
              <span className="lp-badge">🚀 CRM for Malaysian Businesses</span>
              <h1 className="lp-h1">
                Close More Deals<br />
                <span>With Less Effort</span>
              </h1>
              <p className="lp-hero-sub">
                Adletic CRM brings all your WhatsApp leads, follow-ups, and pipelines into one clean dashboard.
                Stop losing deals to messy spreadsheets and missed messages.
              </p>
              <div className="lp-hero-cta">
                <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate("/register")}>
                  Start Free Trial →
                </button>
                <button className="lp-btn lp-btn-secondary lp-btn-lg" onClick={() => scrollTo("pricing")}>
                  View Pricing ↓
                </button>
              </div>
              <div className="lp-stats">
                {stats.map((s) => (
                  <div key={s.label} className="lp-stat">
                    <span className="lp-stat-num">{s.num}</span>
                    <span className="lp-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-hero-visual">
              <div className="lp-hero-visual-glow" />

              {/* floating badges */}
              <div className="lp-float-badge lp-badge-tl">
                <span className="lp-float-badge-icon">⚡</span>
                <span className="lp-float-badge-label">
                  Auto Follow-Up
                  <small>Sequences active</small>
                </span>
              </div>
              <div className="lp-float-badge lp-badge-tr">
                <span className="lp-float-badge-icon">💬</span>
                <span className="lp-float-badge-label">
                  WhatsApp Inbox
                  <small>12 new leads</small>
                </span>
              </div>
              <div className="lp-float-badge lp-badge-bl">
                <span className="lp-float-badge-icon">🤖</span>
                <span className="lp-float-badge-label">
                  AI Reply Sent
                  <small>2 sec response</small>
                </span>
              </div>
              <div className="lp-float-badge lp-badge-br">
                <span className="lp-float-badge-icon">📈</span>
                <span className="lp-float-badge-label">
                  3.2× Conversion
                  <small>This month</small>
                </span>
              </div>

              {/* browser mockup */}
              <div className="lp-browser">
                <div className="lp-browser-bar">
                  <div className="lp-browser-dots">
                    <span /><span /><span />
                  </div>
                  <div className="lp-browser-url">
                    <span className="lp-browser-url-dot" />
                    app.adleticcrm.com/dashboard
                  </div>
                </div>
                <video className="lp-browser-video" autoPlay muted loop playsInline>
                  <source src={heroVideo} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM ── */}
        <section className="lp-section lp-section-alt" id="problem">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-h2">Sound Familiar?</h2>
              <p className="lp-section-sub">
                If you're managing leads through WhatsApp saved contacts and Excel sheets, you're leaving money on the table.
              </p>
            </div>
            <div className="lp-problem-grid">
              {[
                { icon: "😫", title: "Leads Slip Through", desc: "Chats get buried. You forget to follow up. The deal goes to your competitor." },
                { icon: "🗂️", title: "No Pipeline Visibility", desc: "You don't know how many active deals you have, or which ones need attention today." },
                { icon: "⏰", title: "Manually Following Up", desc: "You're spending hours every day copy-pasting the same messages to different leads." },
                { icon: "📉", title: "No Data, No Decisions", desc: "You're guessing what's working. No reports, no metrics, no clarity." },
              ].map((p) => (
                <div key={p.title} className="lp-problem-card">
                  <span className="lp-problem-icon">{p.icon}</span>
                  <div className="lp-problem-title">{p.title}</div>
                  <p className="lp-problem-desc">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="lp-section" id="features">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-h2">Everything You Need to Close</h2>
              <p className="lp-section-sub">
                Built for Malaysian SMEs who want real tools, not bloated software.
              </p>
            </div>
            <div className="lp-features-grid">
              {features.map((f) => (
                <div key={f.title} className="lp-feature-card">
                  <div className="lp-feature-icon">{f.icon}</div>
                  <div className="lp-feature-title">{f.title}</div>
                  <p className="lp-feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section lp-section-alt" id="how-it-works">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-h2">Up & Running in Minutes</h2>
              <p className="lp-section-sub">No long onboarding. No IT team needed. Just connect and go.</p>
            </div>
            <div className="lp-steps">
              {steps.map((s) => (
                <div key={s.num} className="lp-step">
                  <div className="lp-step-num">{s.num}</div>
                  <div className="lp-step-title">{s.title}</div>
                  <p className="lp-step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section" id="pricing">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-h2">Simple Pricing</h2>
              <p className="lp-section-sub">
                No hidden fees. Cancel anytime. First 7 days free on all plans.
              </p>
            </div>
            <div className="lp-pricing-grid">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`lp-pricing-card${plan.highlighted ? " lp-highlighted" : ""}`}
                >
                  {plan.highlighted && <div className="lp-pricing-badge">Most Popular</div>}
                  <div className="lp-plan-name">{plan.name}</div>
                  <div className="lp-plan-price">
                    {plan.price}
                    <span style={{ fontSize: "1rem", fontWeight: 500 }}>{plan.period}</span>
                  </div>
                  <div className="lp-plan-desc">{plan.desc}</div>
                  <button
                    className={`lp-plan-btn ${plan.highlighted ? "lp-plan-btn-light" : "lp-plan-btn-dark"}`}
                    onClick={() => navigate("/register")}
                  >
                    {plan.cta}
                  </button>
                  <div className="lp-plan-features">
                    <ul>
                      {plan.features.map((feat) => (
                        <li key={feat}>
                          <span className="lp-check">✓</span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-pricing-footer">
              <p>
                <strong>First 7 days free</strong> on all plans. No credit card required to start.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="lp-cta">
          <div className="lp-cta-inner">
            <h2>Ready to Close More?</h2>
            <p>
              Join hundreds of Malaysian businesses using Adletic CRM to manage leads, automate follow-ups, and grow faster.
            </p>
            <div className="lp-cta-actions">
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate("/register")}>
                Start Free Trial →
              </button>
              <button
                className="lp-btn lp-btn-lg"
                style={{ background: "transparent", color: "#fff", borderColor: "#fff" }}
                onClick={() => navigate("/login")}
              >
                Login to Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-logo">
                <img src={logoUrl} alt="Adletic CRM" />
                <span className="lp-footer-logo-text">Adletic <span>CRM</span></span>
              </div>
              <p className="lp-footer-tagline">
                The CRM built for Malaysian businesses.<br />
                WhatsApp-first. Simple. Effective.
              </p>
            </div>
            <div className="lp-footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="https://adleticagency.com" target="_blank" rel="noopener noreferrer">Adletic Agency</a></li>
                <li><a href="mailto:hello@adleticagency.com">Contact Us</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4>Account</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Login</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>Register</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Adletic CRM. All rights reserved. | Powered by Adletic Agency</p>
          </div>
        </footer>

      </div>
    </>
  );
}

export default LandingPage;
