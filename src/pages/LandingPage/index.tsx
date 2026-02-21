import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/images/logo-adletic.png";
import heroVideo from "@/assets/video/hero.mp4";

function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: "💬",
      title: "WhatsApp Inbox",
      desc: "Every lead in one place, assigned to the right person, replied to on time. No more checking three phones.",
    },
    {
      icon: "📊",
      title: "Live Pipeline",
      desc: "See every deal — active, stalled, or at risk — in one view. Know what needs attention before it's too late.",
    },
    {
      icon: "⚡",
      title: "Auto Follow-Ups",
      desc: "New lead? Followed up. No reply in 2 days? Followed up. Gone cold? Re-engaged. All automatically.",
    },
    {
      icon: "🤖",
      title: "AI Responses",
      desc: "Common questions answered in seconds. Your team only handles the conversations that actually close.",
    },
    {
      icon: "📅",
      title: "Appointment Booking",
      desc: "From 'let's set a time' to confirmed slot in one message. No back-and-forth. Deals keep moving.",
    },
    {
      icon: "📈",
      title: "Sales Analytics",
      desc: "Response time, conversion rate, deals lost to slow replies. Stop guessing. Start fixing.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Connect Your WhatsApp",
      desc: "Scan a QR code. Your entire WhatsApp is inside a proper sales system in under 5 minutes.",
    },
    {
      num: "02",
      title: "See Your Full Pipeline",
      desc: "Every lead, every status — visible in one dashboard immediately. See what you've been missing.",
    },
    {
      num: "03",
      title: "Let the System Close",
      desc: "Auto follow-ups run on their own. AI handles FAQs. You focus only on deals ready to close.",
    },
  ];

  const plans = [
    {
      name: "STARTER",
      price: "RM 199",
      period: "/mo",
      desc: "For solo operators who need a real system, not a spreadsheet.",
      features: [
        "1 WhatsApp number",
        "Up to 500 contacts",
        "Live pipeline",
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
      desc: "For teams tired of losing deals to whoever replies fastest.",
      features: [
        "3 WhatsApp numbers",
        "Up to 5,000 contacts",
        "Full pipeline + analytics",
        "AI responses",
        "Appointment booking",
        "Priority support",
        "Blast messaging",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "SCALE",
      price: "RM 999",
      period: "/mo",
      desc: "For sales operations that can't afford to leave anything to chance.",
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
    { num: "300+", label: "Businesses" },
    { num: "68%", label: "Faster Replies" },
    { num: "3.2x", label: "Conversions" },
  ];

  const testimonials = [
    {
      quote: "Before Adletic, our sales process was our team's memory. Deals fell through because someone forgot. First month on Adletic Inbox, we closed 40% more deals.",
      name: "Hafiz",
      role: "Digital Agency CEO, Penang",
    },
    {
      quote: "We were quoting good prices and still losing. Turned out we were just replying too slow. Adletic cut our response time from 45 minutes to under 3. Difference was immediate.",
      name: "Azri",
      role: "Property Agency Owner, KL",
    },
    {
      quote: "I had no idea I had 60+ leads sitting unread across my team's phones. Adletic Inbox put everything in one place and our pipeline finally makes sense.",
      name: "Siti",
      role: "E-commerce Founder, Selangor",
    },
  ];

  const faqs = [
    {
      q: "Do I need WhatsApp Business?",
      a: "No. Adletic Inbox works with both regular WhatsApp and WhatsApp Business. Connect with a QR scan — no tech setup required.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes. Every plan comes with a 7-day free trial. No credit card required. Cancel anytime.",
    },
    {
      q: "How long does setup take?",
      a: "Most teams are up and running in under 5 minutes. Scan QR, import contacts, pipeline is live.",
    },
    {
      q: "What if my team uses multiple WhatsApp numbers?",
      a: "Growth and Scale plans support multiple numbers and agents — all from one shared inbox.",
    },
    {
      q: "Will this work for my type of business?",
      a: "If you're selling anything over WhatsApp — property, services, F&B, e-commerce — Adletic Inbox is built for that.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

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
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(242,101,34,0.15);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .lp-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .lp-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .lp-logo img { height: 32px; width: auto; }
        .lp-logo-text {
          font-size: 1rem;
          font-weight: 800;
          color: #4b4b4b;
          letter-spacing: -0.02em;
        }
        .lp-logo-text span { color: #f26522; }
        .lp-nav-links {
          display: flex;
          gap: 1.75rem;
          align-items: center;
        }
        .lp-nav-link {
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
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
        .lp-nav-actions { display: flex; gap: 8px; align-items: center; }

        /* hamburger */
        .lp-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px;
        }
        .lp-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #4b4b4b;
          border-radius: 2px;
          transition: all 0.25s ease;
        }
        .lp-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .lp-hamburger.open span:nth-child(2) { opacity: 0; }
        .lp-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* mobile menu */
        .lp-mobile-menu {
          display: none;
          position: fixed;
          top: 57px;
          left: 0;
          right: 0;
          background: #fff;
          border-bottom: 2px solid #4b4b4b;
          z-index: 999;
          padding: 1rem 1.25rem 1.5rem;
          flex-direction: column;
          gap: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .lp-mobile-menu.open { display: flex; }
        .lp-mobile-menu-link {
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #4b4b4b;
          cursor: pointer;
          padding: 0.85rem 0;
          text-align: left;
          border-bottom: 1px solid rgba(75,75,75,0.1);
        }
        .lp-mobile-menu-link:last-of-type { border-bottom: none; }
        .lp-mobile-menu-link:hover { color: #f26522; }
        .lp-mobile-menu-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 1rem;
        }

        /* ── BUTTONS ── */
        .lp-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          border: 2px solid;
          padding: 9px 22px;
          border-radius: 0;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
          white-space: nowrap;
        }
        .lp-btn-primary { background: #f26522; color: #fff; border-color: #f26522; }
        .lp-btn-primary:hover { transform: translate(2px,-2px); box-shadow: 4px 4px 0 #4b4b4b; }
        .lp-btn-secondary { background: transparent; color: #4b4b4b; border-color: #4b4b4b; }
        .lp-btn-secondary:hover { transform: translate(-2px,-2px); box-shadow: -4px 4px 0 #4b4b4b; }
        .lp-btn-lg { padding: 14px 36px; font-size: 0.9rem; }
        .lp-btn-full { width: 100%; }

        /* ── HERO ── */
        .lp-hero {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 20px 56px;
          background: linear-gradient(135deg, #ffffff 0%, rgba(242,101,34,0.04) 60%, rgba(138,43,226,0.02) 100%);
          position: relative;
          overflow: hidden;
          border-bottom: 2px solid #4b4b4b;
        }
        .lp-hero::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -8%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(242,101,34,0.08) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 0;
          animation: lp-drift 15s ease-in-out infinite;
          filter: blur(50px);
          pointer-events: none;
        }
        @keyframes lp-drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(20px,20px); }
        }
        .lp-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: center;
        }
        .lp-hero-content { text-align: left; }
        .lp-hero-content .lp-hero-cta { justify-content: flex-start; }

        /* ── HERO VISUAL ── */
        .lp-hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-hero-visual-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(ellipse at 60% 50%, rgba(242,101,34,0.18) 0%, rgba(138,43,226,0.08) 55%, transparent 75%);
          filter: blur(35px);
          border-radius: 50%;
          z-index: 0;
          animation: lp-glow-pulse 4s ease-in-out infinite;
        }
        @keyframes lp-glow-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        .lp-browser {
          position: relative;
          z-index: 2;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgba(75,75,75,0.2);
          box-shadow: 0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(242,101,34,0.1);
          transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
          transition: transform 0.5s ease;
          background: #1a1a1a;
        }
        .lp-browser:hover { transform: perspective(1000px) rotateY(-2deg) rotateX(1deg); }
        .lp-browser-bar {
          background: #2a2a2a;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-browser-dots { display: flex; gap: 5px; flex-shrink: 0; }
        .lp-browser-dots span { width: 10px; height: 10px; border-radius: 50%; display: block; }
        .lp-browser-dots span:nth-child(1) { background: #ff5f57; }
        .lp-browser-dots span:nth-child(2) { background: #febc2e; }
        .lp-browser-dots span:nth-child(3) { background: #28c840; }
        .lp-browser-url {
          flex: 1;
          background: rgba(255,255,255,0.07);
          border-radius: 5px;
          padding: 4px 10px;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.4);
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
          white-space: nowrap;
        }
        .lp-browser-url-dot { width: 6px; height: 6px; border-radius: 50%; background: #28c840; flex-shrink: 0; }
        .lp-browser-video { display: block; width: 100%; aspect-ratio: 16/10; object-fit: cover; }

        /* ── FLOATING BADGES ── */
        .lp-float-badge {
          position: absolute;
          z-index: 10;
          background: #fff;
          border: 2px solid #4b4b4b;
          border-radius: 10px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
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
          50% { transform: translateY(-7px); }
        }
        .lp-float-badge-icon { font-size: 0.9rem; }
        .lp-float-badge-label { line-height: 1.2; }
        .lp-float-badge-label small {
          display: block;
          font-size: 0.6rem;
          font-weight: 500;
          color: #6b6b6b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .lp-badge-tl { top: -16px; left: -16px; }
        .lp-badge-tr { top: -16px; right: -12px; }
        .lp-badge-bl { bottom: 10px; left: -18px; }
        .lp-badge-br { bottom: -16px; right: -12px; }

        /* ── HERO TEXT ── */
        .lp-badge {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(242,101,34,0.1);
          color: #f26522;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 1.1rem;
        }
        .lp-h1 {
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          font-weight: 900;
          color: #4b4b4b;
          line-height: 1.06;
          letter-spacing: -0.03em;
          margin-bottom: 1.1rem;
        }
        .lp-h1 span { color: #f26522; }
        .lp-hero-sub {
          font-size: 1.05rem;
          color: #5a5a5a;
          max-width: 500px;
          margin: 0 0 1.75rem;
          line-height: 1.7;
        }
        .lp-hero-cta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .lp-trust-signals {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .lp-trust-item {
          font-size: 0.78rem;
          font-weight: 600;
          color: #6b6b6b;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .lp-hero-testimonial {
          padding: 0.9rem 1rem;
          border-left: 3px solid #f26522;
          background: rgba(242,101,34,0.04);
          margin-bottom: 1.75rem;
        }
        .lp-hero-testimonial p {
          font-size: 0.85rem;
          font-style: italic;
          color: #4b4b4b;
          margin: 0 0 0.3rem;
          line-height: 1.6;
        }
        .lp-hero-testimonial cite {
          font-size: 0.72rem;
          font-style: normal;
          font-weight: 700;
          color: #f26522;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .lp-stats {
          display: flex;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid rgba(75,75,75,0.15);
        }
        .lp-stat { display: flex; flex-direction: column; }
        .lp-stat-num {
          font-size: 1.9rem;
          font-weight: 900;
          color: #f26522;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 3px;
        }
        .lp-stat-label {
          font-size: 0.72rem;
          color: #6b6b6b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── SECTION COMMONS ── */
        .lp-section { padding: 64px 20px; }
        .lp-section-alt { background: #f7f7f7; }
        .lp-container { max-width: 1200px; margin: 0 auto; }
        .lp-section-header { text-align: center; margin-bottom: 2.5rem; }
        .lp-h2 {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 900;
          color: #4b4b4b;
          letter-spacing: -0.02em;
          margin-bottom: 0.6rem;
          line-height: 1.15;
        }
        .lp-h2 span { color: #f26522; }
        .lp-section-sub {
          font-size: 1rem;
          color: #6b6b6b;
          max-width: 520px;
          margin: 0 auto;
          font-weight: 500;
          line-height: 1.7;
        }

        /* ── PROBLEM ── */
        .lp-problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .lp-problem-card {
          background: #fff;
          border: 2px solid rgba(242,101,34,0.18);
          padding: 1.25rem;
          transition: all 0.25s ease;
        }
        .lp-problem-card:hover {
          border-color: #f26522;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.06);
        }
        .lp-problem-icon { font-size: 1.6rem; margin-bottom: 0.6rem; display: block; }
        .lp-problem-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.4rem;
        }
        .lp-problem-desc { font-size: 0.85rem; color: #6b6b6b; line-height: 1.6; margin: 0; }

        /* ── FEATURES ── */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .lp-feature-card {
          background: #fff;
          border: 2px solid rgba(242,101,34,0.12);
          border-radius: 10px;
          padding: 1.25rem 1.25rem 1.5rem;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .lp-feature-card:hover {
          border-color: #f26522;
          box-shadow: 4px 4px 0 #f26522;
          transform: translate(-2px,-2px);
        }
        .lp-feature-icon { font-size: 2rem; }
        .lp-feature-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: #f26522;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .lp-feature-desc { font-size: 0.875rem; color: #5a5a5a; line-height: 1.65; margin: 0; }

        /* ── HOW IT WORKS ── */
        .lp-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .lp-step {
          padding: 1.75rem 1.5rem;
          background: #fff;
          border: 2px solid #4b4b4b;
          transition: all 0.25s ease;
        }
        .lp-step:hover { transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #4b4b4b; }
        .lp-step-num {
          font-size: 2.8rem;
          font-weight: 900;
          color: rgba(242,101,34,0.12);
          line-height: 1;
          margin-bottom: 0.75rem;
          letter-spacing: -0.04em;
        }
        .lp-step-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.5rem;
        }
        .lp-step-desc { font-size: 0.875rem; color: #6b6b6b; line-height: 1.6; margin: 0; }

        /* ── TESTIMONIALS ── */
        .lp-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .lp-testimonial-card {
          background: #fff;
          border: 2px solid #4b4b4b;
          padding: 1.5rem;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .lp-testimonial-card:hover { transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #f26522; }
        .lp-testimonial-quote {
          font-size: 0.9rem;
          color: #4b4b4b;
          line-height: 1.7;
          margin: 0 0 1rem;
          font-style: italic;
          flex-grow: 1;
        }
        .lp-testimonial-author { border-top: 1px solid rgba(75,75,75,0.12); padding-top: 0.7rem; }
        .lp-testimonial-name {
          font-size: 0.8rem;
          font-weight: 800;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .lp-testimonial-role { font-size: 0.75rem; color: #f26522; font-weight: 600; margin-top: 2px; }

        /* ── PRICING ── */
        .lp-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .lp-pricing-card {
          background: #fff;
          border: 2px solid #4b4b4b;
          padding: 2rem 1.5rem;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
        }
        .lp-pricing-card:hover { transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #4b4b4b; }
        .lp-pricing-card.lp-highlighted { background: #4b4b4b; color: #fff; }
        .lp-pricing-badge {
          position: absolute;
          top: -11px;
          left: 50%;
          transform: translateX(-50%);
          background: #f26522;
          color: #fff;
          padding: 4px 14px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .lp-plan-name {
          font-size: 0.9rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.4rem;
          color: inherit;
        }
        .lp-plan-price {
          font-size: 2.4rem;
          font-weight: 900;
          color: #f26522;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 3px;
        }
        .lp-plan-period { font-size: 0.85rem; font-weight: 500; color: inherit; opacity: 0.65; margin-bottom: 0.4rem; }
        .lp-plan-desc { font-size: 0.8rem; margin-bottom: 1.1rem; line-height: 1.45; color: inherit; opacity: 0.75; }
        .lp-plan-btn {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 20px;
          border: 2px solid;
          cursor: pointer;
          border-radius: 0;
          margin-bottom: 1.25rem;
          width: 100%;
          transition: all 0.25s ease;
        }
        .lp-plan-btn-dark { background: #4b4b4b; color: #fff; border-color: #4b4b4b; }
        .lp-plan-btn-dark:hover { background: transparent; color: #4b4b4b; }
        .lp-plan-btn-light { background: #fff; color: #4b4b4b; border-color: #fff; }
        .lp-plan-btn-light:hover { background: transparent; color: #fff; border-color: #fff; }
        .lp-plan-features {
          text-align: left;
          flex-grow: 1;
          border-top: 1px solid currentColor;
          padding-top: 1rem;
          opacity: 0.9;
        }
        .lp-plan-features ul { list-style: none; padding: 0; margin: 0; }
        .lp-plan-features li {
          font-size: 0.82rem;
          padding: 0.45rem 0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: inherit;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-check { color: #f26522; font-weight: 700; flex-shrink: 0; }
        .lp-pricing-footer {
          text-align: center;
          padding: 1rem 1.5rem;
          border: 2px solid rgba(75,75,75,0.3);
          background: #fff;
        }
        .lp-pricing-footer p { margin: 0; font-size: 0.875rem; color: #4b4b4b; font-weight: 500; }

        /* ── FAQ ── */
        .lp-faq-list {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .lp-faq-item {
          border: 2px solid rgba(75,75,75,0.2);
          background: #fff;
          padding: 1.1rem 1.25rem;
          transition: all 0.25s ease;
        }
        .lp-faq-item:hover {
          border-color: #f26522;
          transform: translate(-2px,-2px);
          box-shadow: 3px 3px 0 rgba(242,101,34,0.2);
        }
        .lp-faq-q { font-size: 0.9rem; font-weight: 800; color: #4b4b4b; margin-bottom: 0.4rem; }
        .lp-faq-a { font-size: 0.875rem; color: #6b6b6b; line-height: 1.65; margin: 0; }

        /* ── MID CTA ── */
        .lp-mid-cta {
          background: #4b4b4b;
          border-top: 3px solid #f26522;
          border-bottom: 3px solid #f26522;
          padding: 56px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .lp-mid-cta::before {
          content: '';
          position: absolute;
          top: -60%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(242,101,34,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .lp-mid-cta-inner { position: relative; z-index: 2; max-width: 640px; margin: 0 auto; }
        .lp-mid-cta h2 {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }
        .lp-mid-cta h2 span { color: #f26522; }
        .lp-mid-cta p {
          font-size: 1rem;
          color: rgba(255,255,255,0.65);
          margin: 0 auto 2rem;
          line-height: 1.7;
        }
        .lp-mid-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── FOOTER ── */
        .lp-footer { background: #fff; border-top: 2px solid #4b4b4b; padding: 40px 20px 24px; }
        .lp-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .lp-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2.5rem;
          margin-bottom: 2rem;
        }
        .lp-footer-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
        .lp-footer-logo img { height: 28px; width: auto; }
        .lp-footer-logo-text { font-size: 0.95rem; font-weight: 800; color: #4b4b4b; }
        .lp-footer-logo-text span { color: #f26522; }
        .lp-footer-tagline { font-size: 0.8rem; color: #8b8b8b; line-height: 1.6; margin: 0; }
        .lp-footer-col h4 {
          font-size: 0.72rem;
          font-weight: 800;
          color: #4b4b4b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }
        .lp-footer-col ul { list-style: none; padding: 0; margin: 0; }
        .lp-footer-col ul li { margin-bottom: 0.45rem; }
        .lp-footer-col ul li a { font-size: 0.82rem; color: #6b6b6b; text-decoration: none; transition: color 0.2s; }
        .lp-footer-col ul li a:hover { color: #f26522; }
        .lp-footer-bottom {
          padding-top: 1.25rem;
          border-top: 1px solid #ebebeb;
          text-align: center;
        }
        .lp-footer-bottom p { font-size: 0.75rem; color: #8b8b8b; margin: 0; }

        /* ── TABLET (769–1024px) ── */
        @media (max-width: 1024px) and (min-width: 769px) {
          .lp-hero-inner { gap: 2rem; }
          .lp-steps { grid-template-columns: repeat(3, 1fr); }
          .lp-testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-pricing-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-pricing-grid > *:last-child { grid-column: span 2; max-width: 400px; margin: 0 auto; width: 100%; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        }

        /* ── MOBILE (≤768px) ── */
        @media (max-width: 768px) {
          .lp-nav-links { display: none; }
          .lp-nav-actions { display: none; }
          .lp-hamburger { display: flex; }

          .lp-hero { padding: 44px 16px 40px; }
          .lp-hero-inner { grid-template-columns: 1fr; gap: 2rem; }
          .lp-hero-content { text-align: center; }
          .lp-hero-content .lp-hero-cta { justify-content: center; }
          .lp-hero-sub { max-width: 100%; margin-left: auto; margin-right: auto; }
          .lp-trust-signals { justify-content: center; }
          .lp-stats { justify-content: center; }
          .lp-hero-testimonial { text-align: left; }

          .lp-browser { transform: none !important; border-radius: 10px; }
          .lp-float-badge { display: none; }

          .lp-section { padding: 44px 16px; }
          .lp-section-header { margin-bottom: 1.75rem; }

          .lp-problem-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .lp-steps { grid-template-columns: 1fr; gap: 0.75rem; }
          .lp-testimonials-grid { grid-template-columns: 1fr; gap: 0.75rem; }
          .lp-pricing-grid { grid-template-columns: 1fr; gap: 1rem; }

          .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .lp-footer-grid > *:first-child { grid-column: span 2; }

          .lp-mid-cta { padding: 40px 16px; }
          .lp-mid-cta-actions { flex-direction: column; align-items: center; }
          .lp-btn-lg { padding: 13px 28px; }
        }

        /* ── SMALL MOBILE (≤480px) ── */
        @media (max-width: 480px) {
          .lp-problem-grid { grid-template-columns: 1fr; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-footer-grid { grid-template-columns: 1fr; }
          .lp-footer-grid > *:first-child { grid-column: span 1; }
          .lp-hero-cta { flex-direction: column; }
          .lp-btn-lg { width: 100%; }
          .lp-stats { gap: 1.25rem; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── NAVIGATION ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <div className="lp-logo">
              <img src={logoUrl} alt="Adletic Inbox" />
              <span className="lp-logo-text">Adletic <span>Inbox</span></span>
            </div>
            <div className="lp-nav-links">
              <button className="lp-nav-link" onClick={() => scrollTo("features")}>Features</button>
              <button className="lp-nav-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
              <button className="lp-nav-link" onClick={() => scrollTo("pricing")}>Pricing</button>
            </div>
            <div className="lp-nav-actions">
              <button className="lp-btn lp-btn-secondary" onClick={() => navigate("/login")}>Login</button>
              <button className="lp-btn lp-btn-primary" onClick={() => navigate("/register")}>Start Free Trial</button>
            </div>
            <button
              className={`lp-hamburger${mobileMenuOpen ? " open" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* ── MOBILE MENU ── */}
        <div className={`lp-mobile-menu${mobileMenuOpen ? " open" : ""}`}>
          <button className="lp-mobile-menu-link" onClick={() => scrollTo("features")}>Features</button>
          <button className="lp-mobile-menu-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button className="lp-mobile-menu-link" onClick={() => scrollTo("pricing")}>Pricing</button>
          <button className="lp-mobile-menu-link" onClick={() => scrollTo("faq")}>FAQ</button>
          <div className="lp-mobile-menu-actions">
            <button className="lp-btn lp-btn-secondary lp-btn-full" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>Login</button>
            <button className="lp-btn lp-btn-primary lp-btn-full" onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}>Start Free Trial</button>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="lp-hero" id="home">
          <div className="lp-hero-inner">
            <div className="lp-hero-content">
              <span className="lp-badge">Malaysian sales teams average 47-min WhatsApp response times</span>
              <h1 className="lp-h1">
                Your competitor<br />
                just closed the deal<br />
                <span>you quoted yesterday.</span>
              </h1>
              <p className="lp-hero-sub">
                They didn't have a better product. They had a better system —
                one that replied faster, followed up automatically, and never let a lead go cold.
                That system is Adletic Inbox.
              </p>
              <div className="lp-hero-cta">
                <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate("/register")}>
                  BUILD MY SALES SYSTEM →
                </button>
                <button className="lp-btn lp-btn-secondary lp-btn-lg" onClick={() => scrollTo("how-it-works")}>
                  SEE IT IN ACTION ↓
                </button>
              </div>
              <div className="lp-trust-signals">
                <span className="lp-trust-item">⚡ Live in 5 minutes</span>
                <span className="lp-trust-item">🔒 7-day free trial</span>
                <span className="lp-trust-item">📊 No card needed</span>
              </div>
              <div className="lp-hero-testimonial">
                <p>"We were quoting good prices and still losing. Turned out we were just replying too slow. Adletic cut our response time from 45 min to under 3. The difference was immediate."</p>
                <cite>— Azri, Property Agency Owner, KL</cite>
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
              <div className="lp-float-badge lp-badge-tl">
                <span className="lp-float-badge-icon">⚡</span>
                <span className="lp-float-badge-label">
                  Follow-Up Sent
                  <small>Auto — 2 days no reply</small>
                </span>
              </div>
              <div className="lp-float-badge lp-badge-tr">
                <span className="lp-float-badge-icon">💬</span>
                <span className="lp-float-badge-label">
                  12 Leads Waiting
                  <small>Unassigned inbox</small>
                </span>
              </div>
              <div className="lp-float-badge lp-badge-bl">
                <span className="lp-float-badge-icon">🤖</span>
                <span className="lp-float-badge-label">
                  AI Replied
                  <small>In 8 seconds</small>
                </span>
              </div>
              <div className="lp-float-badge lp-badge-br">
                <span className="lp-float-badge-icon">📈</span>
                <span className="lp-float-badge-label">
                  Deal Closed
                  <small>RM 4,800 won</small>
                </span>
              </div>
              <div className="lp-browser">
                <div className="lp-browser-bar">
                  <div className="lp-browser-dots"><span /><span /><span /></div>
                  <div className="lp-browser-url">
                    <span className="lp-browser-url-dot" />
                    app.adleticinbox.com/pipeline
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
              <h2 className="lp-h2">A WhatsApp chat is not a <span>sales system.</span></h2>
              <p className="lp-section-sub">
                Running your entire pipeline through saved contacts and chat history works — until it doesn't.
                By the time you realise something slipped, the deal is already gone.
              </p>
            </div>
            <div className="lp-problem-grid">
              {[
                { icon: "👻", title: "The Deal That Ghosted You", desc: "They messaged. You saw it. You meant to reply. By the time you did, they'd moved on to someone who answered in 3 minutes." },
                { icon: "🗂️", title: "No Visibility, No Control", desc: "You can't manage a pipeline you can't see. Right now you don't know how many deals are active, which are at risk, or which you've already lost." },
                { icon: "🔁", title: "Follow-Up Roulette", desc: "Your follow-up strategy is 'try to remember.' Some leads get 5 messages. Others get none. You're losing to more consistent competitors, not better ones." },
                { icon: "📉", title: "Running Sales Blind", desc: "No reply rates, no conversion data, no idea what's working. You repeat the same mistakes every month because nothing is tracking them." },
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
              <h2 className="lp-h2">One system. <span>Every lead accounted for.</span></h2>
              <p className="lp-section-sub">
                Adletic Inbox replaces WhatsApp chaos with a sales system your whole team can run on.
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
              <h2 className="lp-h2">From WhatsApp chaos to a working system — <span>in one afternoon.</span></h2>
              <p className="lp-section-sub">No IT team. No onboarding marathon. Just connect, see your pipeline, and start closing.</p>
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

        {/* ── TESTIMONIALS ── */}
        <section className="lp-section" id="testimonials">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-h2">They stopped running sales on <span>memory.</span></h2>
              <p className="lp-section-sub">
                300+ Malaysian businesses that got serious about their pipeline — and the results that followed.
              </p>
            </div>
            <div className="lp-testimonials-grid">
              {testimonials.map((t) => (
                <div key={t.name} className="lp-testimonial-card">
                  <p className="lp-testimonial-quote">"{t.quote}"</p>
                  <div className="lp-testimonial-author">
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* ── FAQ ── */}
        <section className="lp-section" id="faq">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-h2">Questions before you start</h2>
              <p className="lp-section-sub">Honest answers. No sales spin.</p>
            </div>
            <div className="lp-faq-list">
              {faqs.map((faq) => (
                <div key={faq.q} className="lp-faq-item">
                  <div className="lp-faq-q">{faq.q}</div>
                  <p className="lp-faq-a">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MID CTA ── */}
        <section className="lp-mid-cta">
          <div className="lp-mid-cta-inner">
            <h2>Every day without a system is<br /><span>another day of losing on purpose.</span></h2>
            <p>
              Your leads are real. Your pipeline is real. The only thing missing is a system that makes sure nothing slips. Start today — it takes 5 minutes.
            </p>
            <div className="lp-mid-cta-actions">
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate("/register")}>
                BUILD MY SALES SYSTEM →
              </button>
              <button
                className="lp-btn lp-btn-lg"
                style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.35)" }}
                onClick={() => navigate("/login")}
              >
                Login to Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-grid">
              <div>
                <div className="lp-footer-logo">
                  <img src={logoUrl} alt="Adletic Inbox" />
                  <span className="lp-footer-logo-text">Adletic <span>Inbox</span></span>
                </div>
                <p className="lp-footer-tagline">
                  WhatsApp-native sales management for Malaysian businesses<br />
                  that are done losing to whoever replies fastest.
                </p>
              </div>
              <div className="lp-footer-col">
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#how-it-works">How It Works</a></li>
                  <li><a href="#faq">FAQ</a></li>
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
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>Start Free Trial</a></li>
                </ul>
              </div>
            </div>
            <div className="lp-footer-bottom">
              <p>&copy; {new Date().getFullYear()} Adletic Inbox by Adletic Agency. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

export default LandingPage;
