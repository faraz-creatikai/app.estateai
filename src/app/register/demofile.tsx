"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Company",
    href: "#",
    children: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Why Choose Us", href: "/why-choose-us" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    label: "Industries",
    href: "#",
    children: [
      { label: "Education", href: "/education" },
      { label: "Medical", href: "/medical" },
      { label: "Finance", href: "/finance" },
      { label: "Real Estate", href: "/real-estate" },
    ],
  },
  { label: "Services", href: "/our-services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blogs-2" },
];

const services = [
  {
    num: "01",
    title: "Tailored Lead Strategies",
    desc: "Custom acquisition plans engineered around your ICP, vertical, and sales cycle — not templates.",
    tag: "STRATEGY",
  },
  {
    num: "02",
    title: "AI Prospect Detection",
    desc: "Machine-learning models that score, rank, and surface high-intent buyers before your competitors find them.",
    tag: "AI / ML",
  },
  {
    num: "03",
    title: "Multi-Channel Outreach",
    desc: "Orchestrated touchpoints across LinkedIn, email, and search that keep your brand top-of-mind at every stage.",
    tag: "OUTREACH",
  },
  {
    num: "04",
    title: "CRM & Funnel Integration",
    desc: "Seamless pipelines into Salesforce, HubSpot, Zoho and more — zero friction from lead to closed deal.",
    tag: "AUTOMATION",
  },
  {
    num: "05",
    title: "Industry-Specific Verticals",
    desc: "Deep domain expertise across Finance, Medical, Real Estate, Education and Consultancy sectors.",
    tag: "INDUSTRIES",
  },
  {
    num: "06",
    title: "Data Security & Compliance",
    desc: "Bank-grade encryption, GDPR-compliant workflows, and full audit trails for every lead record.",
    tag: "SECURITY",
  },
];

const stats = [
  { value: "1790+", label: "Happy Clients", sub: "Across 12 industries" },
  { value: "491+", label: "Projects Delivered", sub: "On-time, every time" },
  { value: "99%", label: "Satisfaction Rate", sub: "Based on surveys" },
  { value: "11 Yrs", label: "In Market", sub: "Since 2013" },
];

const caseStudies = [
  {
    cat: "Real Estate",
    title: "JaipurRental Portal",
    result: "3.2× lead volume in 90 days",
    color: "#086ad8",
    icon: "🏠",
  },
  {
    cat: "Finance",
    title: "Financial Lead Advisor",
    result: "₹4.8Cr pipeline generated",
    color: "#002fa6",
    icon: "📈",
  },
  {
    cat: "Cyber Security",
    title: "Freeserve Rebrand",
    result: "220% organic traffic lift",
    color: "#d2a98e",
    icon: "🔐",
  },
  {
    cat: "Education",
    title: "Student Lead Engine",
    result: "18K enrollments in one cycle",
    color: "#086ad8",
    icon: "🎓",
  },
];

const testimonials = [
  {
    name: "Rajesh Singh",
    role: "Business Owner",
    quote: "MakeMyLeads expanded our client base faster than any agency we'd tried before. Genuinely invaluable.",
    initials: "RS",
    color: "#086ad8",
  },
  {
    name: "Priya Sharma",
    role: "Marketing Head",
    quote: "Their strategy moved the needle on revenue in ways we didn't expect. The ROI speaks for itself.",
    initials: "PS",
    color: "#d2a98e",
  },
  {
    name: "Rahul Gupta",
    role: "CEO",
    quote: "Consistent, high-quality leads every single month. They don't just promise — they deliver.",
    initials: "RG",
    color: "#002fa6",
  },
  {
    name: "Ananya Mishra",
    role: "Sales Manager",
    quote: "Working with the team has been a genuine game-changer for our pipeline and growth trajectory.",
    initials: "AM",
    color: "#086ad8",
  },
];

const marqueeItems = [
  "AI Lead Generation",
  "CRM Integration",
  "Prospect Intelligence",
  "Funnel Automation",
  "Multi-Channel Outreach",
  "Sales Enablement",
  "Data Security",
  "Industry Verticals",
];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const numMatch = value.match(/[\d.]+/);
    if (!numMatch) { setDisplay(value); return; }
    const target = parseFloat(numMatch[0]);
    const suffix = value.replace(numMatch[0], "");

    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 50;
        const id = setInterval(() => {
          start += step;
          if (start >= target) { setDisplay(value); clearInterval(id); }
          else setDisplay(Math.floor(start) + suffix);
        }, 40);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openService, setOpenService] = useState<number | null>(0);
  const [formData, setFormData] = useState({ name: "", email: "", service: "" });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Outfit', sans-serif;
          background: #f5f4f0;
          color: #1a1a2e;
          -webkit-font-smoothing: antialiased;
        }

        :root {
          --blue: #086ad8;
          --navy: #002fa6;
          --warm: #d2a98e;
          --ink: #0d0f1a;
          --paper: #f5f4f0;
          --mid: #696969;
          --border: rgba(0,0,0,0.09);
        }

        .serif { font-family: 'Instrument Serif', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .anim-up { animation: fadeUp 0.7s ease forwards; }
        .anim-up-d1 { animation: fadeUp 0.7s 0.1s ease both; }
        .anim-up-d2 { animation: fadeUp 0.7s 0.2s ease both; }
        .anim-up-d3 { animation: fadeUp 0.7s 0.3s ease both; }

        .marquee-track {
          display: flex;
          gap: 0;
          animation: marqueeScroll 20s linear infinite;
          width: max-content;
        }
        .marquee-wrap { overflow: hidden; }

        .service-row {
          border-top: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s;
        }
        .service-row:last-child { border-bottom: 1px solid var(--border); }
        .service-row:hover { background: rgba(8,106,216,0.03); }

        .cs-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .cs-card:hover { transform: translateY(-6px); }

        .pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 14px; border-radius: 100px;
          font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
        }

        input, select, textarea {
          font-family: 'Outfit', sans-serif;
        }

        input:focus, select:focus { outline: 2px solid var(--blue); outline-offset: 0; }

        .spin-badge {
          animation: spin-slow 12s linear infinite;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .stats-list { grid-template-columns: 1fr 1fr !important; }
          .case-grid { grid-template-columns: 1fr !important; }
          .footer-cols { grid-template-columns: 1fr 1fr !important; }
          .split-cta { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
          .testi-mini { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ───────────────────────────── NAVBAR ─────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transition: "all 0.3s",
        }}
      >
        {/* Topbar */}
        <div style={{ background: "#0d0f1a", padding: "6px 0" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 24, fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
              <span>📞 +91 9950602330</span>
              <span>✉ info@makemyleads.com</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              {["TW", "FB", "IG", "LI"].map(s => (
                <a key={s} href="#" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s", textDecoration: "none" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#086ad8")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}>{s}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav style={{
          background: scrolled ? "rgba(245,244,240,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.35s",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", height: 64 }}>
            {/* Logo */}
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 48, textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36, background: "linear-gradient(135deg,#086ad8,#002fa6)",
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: scrolled ? "#0d0f1a" : "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  MakeMyLeads
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "2.5px", color: scrolled ? "#086ad8" : "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                  AI Lead Generation
                </div>
              </div>
            </a>

            {/* Links */}
            <div className="nav-links" style={{ display: "flex", flex: 1, gap: 2 }}>
              {navItems.map(item => (
                <div key={item.label} style={{ position: "relative" }}
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}>
                  <a href={item.href} style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "0 14px", height: 64,
                    fontSize: 14, fontWeight: 500,
                    color: scrolled ? "rgba(26,26,46,0.75)" : "rgba(255,255,255,0.8)",
                    textDecoration: "none", transition: "color 0.2s", whiteSpace: "nowrap"
                  }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = scrolled ? "#086ad8" : "#fff")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = scrolled ? "rgba(26,26,46,0.75)" : "rgba(255,255,255,0.8)")}>
                    {item.label}
                    {item.children && <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>}
                  </a>
                  {item.children && activeDropdown === item.label && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, minWidth: 200,
                      background: "#fff", borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(0,0,0,0.07)", padding: "8px 0",
                      animation: "fadeIn 0.18s ease"
                    }}>
                      {item.children.map(c => (
                        <a key={c.label} href={c.href} style={{
                          display: "block", padding: "8px 18px", fontSize: 13,
                          color: "#444", textDecoration: "none", transition: "all 0.15s"
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#086ad8"; (e.currentTarget as HTMLElement).style.paddingLeft = "24px"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; (e.currentTarget as HTMLElement).style.paddingLeft = "18px"; }}>
                          {c.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <a href="tel:+919950602330" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0 20px", height: 40,
              background: scrolled ? "#086ad8" : "rgba(255,255,255,0.15)",
              border: scrolled ? "none" : "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: "#fff", textDecoration: "none", transition: "all 0.2s"
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = scrolled ? "#054fa0" : "rgba(255,255,255,0.25)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = scrolled ? "#086ad8" : "rgba(255,255,255,0.15)")}>
              Get Started →
            </a>
          </div>
        </nav>
      </header>

      {/* ───────────────────────────── HERO ───────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(150deg, #0d0f1a 0%, #072a83 55%, #086ad8 100%)",
        paddingTop: 130,
        paddingBottom: 80,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Giant background number */}
        <div style={{
          position: "absolute", top: "50%", right: "-60px",
          transform: "translateY(-55%)",
          fontSize: "clamp(280px, 30vw, 420px)",
          fontWeight: 900,
          color: "rgba(255,255,255,0.03)",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}>01</div>

        {/* Mesh orbs */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(210,169,142,0.12) 0%, transparent 70%)", top: "-100px", left: "-100px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(8,106,216,0.25) 0%, transparent 70%)", bottom: "0", right: "200px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2 }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: 64, alignItems: "center" }}>

            {/* LEFT */}
            <div>
              <div className="anim-up" style={{ marginBottom: 32 }}>
                <span className="pill" style={{ background: "rgba(210,169,142,0.15)", border: "1px solid rgba(210,169,142,0.3)", color: "#d2a98e" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d2a98e" }} />
                  Since 2013 · Jaipur, India
                </span>
              </div>

              <h1 className="anim-up-d1 serif" style={{
                fontSize: "clamp(3rem, 6.5vw, 5.5rem)",
                fontWeight: 400,
                color: "#fff",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                marginBottom: 28,
              }}>
                Turn <span style={{ color: "#d2a98e", fontStyle: "italic" }}>intent</span> into<br />
                <span style={{
                  background: "linear-gradient(90deg, #fff 40%, rgba(255,255,255,0.5))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>qualified leads.</span>
              </h1>

              <p className="anim-up-d2" style={{
                fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.8,
                maxWidth: 520, marginBottom: 40
              }}>
                AI-powered lead generation built for Finance, Medical, Real Estate, and Education — precision-engineered to fill your pipeline with buyers who are ready to act.
              </p>

              <div className="anim-up-d3" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 60 }}>
                <a href="https://wa.me/919950602330" target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "14px 28px",
                  background: "#086ad8", color: "#fff", borderRadius: 10,
                  fontWeight: 700, fontSize: 15, textDecoration: "none",
                  boxShadow: "0 8px 30px rgba(8,106,216,0.4)", transition: "all 0.25s"
                }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(-2px)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}>
                  Start for Free →
                </a>
                <a href="/case-studies" style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "14px 28px",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 15,
                  textDecoration: "none", transition: "all 0.25s"
                }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}>
                  View Case Studies
                </a>
              </div>

              {/* Trust row */}
              <div style={{ display: "flex", gap: 40, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32 }}>
                {[{ n: "1790+", l: "Clients" }, { n: "491+", l: "Projects" }, { n: "11 Yrs", l: "Experience" }].map(b => (
                  <div key={b.l}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{b.n}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" }}>{b.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Appointment Card */}
            <div className="anim-up-d2" style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "36px 32px",
            }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", color: "#d2a98e", textTransform: "uppercase", marginBottom: 8 }}>
                  Free Consultation
                </div>
                <h3 className="serif" style={{ fontSize: 28, color: "#fff", fontWeight: 400, lineHeight: 1.2 }}>
                  Book a strategy<br />session today
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "name", type: "text", placeholder: "Your full name" },
                  { key: "email", type: "email", placeholder: "Work email address" },
                ].map(f => (
                  <input key={f.key} type={f.type} placeholder={f.placeholder}
                    value={formData[f.key as keyof typeof formData]}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                    style={{
                      width: "100%", height: 50, padding: "0 16px",
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10, color: "#fff", fontSize: 14,
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => ((e.target as HTMLInputElement).style.borderColor = "#086ad8")}
                    onBlur={e => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)")} />
                ))}

                <select value={formData.service}
                  onChange={e => setFormData({ ...formData, service: e.target.value })}
                  style={{
                    width: "100%", height: 50, padding: "0 16px",
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, color: formData.service ? "#fff" : "rgba(255,255,255,0.45)",
                    fontSize: 14, cursor: "pointer",
                  }}>
                  <option value="">Select service area</option>
                  <option>Lead Generation</option>
                  <option>CRM Integration</option>
                  <option>AI Automation</option>
                  <option>Industry Consulting</option>
                </select>

                <button onClick={() => alert("Booking confirmed! We'll reach out shortly.")} style={{
                  width: "100%", height: 52, background: "#d2a98e", border: "none",
                  borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 15,
                  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  transition: "all 0.25s", marginTop: 4,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#c4967a"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#d2a98e"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                  Book Free Session
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Your data is encrypted & never sold. Avg response: &lt; 2 hrs.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom diagonal */}
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ display: "block" }}>
            <path d="M0 80 L1440 0 L1440 80 Z" fill="#f5f4f0" />
          </svg>
        </div>
      </section>

      {/* ───────────────────────────── MARQUEE ────────────────────────────── */}
      <div style={{ background: "#086ad8", padding: "14px 0", overflow: "hidden" }}>
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 16,
                padding: "0 28px",
                fontSize: 12, fontWeight: 700, letterSpacing: "2px",
                textTransform: "uppercase", color: "rgba(255,255,255,0.85)",
                whiteSpace: "nowrap"
              }}>
                {item}
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────────────────── SERVICES ───────────────────────────── */}
      <section style={{ padding: "100px 0", background: "#f5f4f0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: "#086ad8", textTransform: "uppercase", marginBottom: 12 }}>
                What We Do
              </div>
              <h2 className="serif" style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", color: "#0d0f1a", lineHeight: 1.1, fontWeight: 400 }}>
                Six pillars of<br />
                <span style={{ fontStyle: "italic", color: "#086ad8" }}>lead excellence</span>
              </h2>
            </div>
            <a href="/our-services" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 24px",
              border: "1.5px solid #0d0f1a", borderRadius: 8, fontWeight: 700,
              fontSize: 14, color: "#0d0f1a", textDecoration: "none", transition: "all 0.2s"
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0d0f1a"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#0d0f1a"; }}>
              All Services →
            </a>
          </div>

          {/* Accordion list */}
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "#fff" }}>
            {services.map((svc, i) => (
              <div key={i} className="service-row"
                onClick={() => setOpenService(openService === i ? null : i)}
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  {/* Number */}
                  <div style={{
                    width: 80, padding: "24px 0", textAlign: "center",
                    fontSize: 13, fontWeight: 800, color: "#d2a98e",
                    letterSpacing: "1px", flexShrink: 0,
                    borderRight: "1px solid rgba(0,0,0,0.07)"
                  }}>
                    {svc.num}
                  </div>

                  {/* Tag */}
                  <div style={{ width: 130, padding: "24px 20px", flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
                      color: "#086ad8", background: "rgba(8,106,216,0.08)",
                      padding: "4px 10px", borderRadius: 4, textTransform: "uppercase"
                    }}>
                      {svc.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{ flex: 1, padding: "24px 20px" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0d0f1a" }}>{svc.title}</div>
                    {openService === i && (
                      <div style={{
                        fontSize: 14, color: "#696969", lineHeight: 1.75,
                        marginTop: 10, maxWidth: 600,
                        animation: "fadeUp 0.25s ease"
                      }}>
                        {svc.desc}
                      </div>
                    )}
                  </div>

                  {/* Toggle */}
                  <div style={{
                    width: 64, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color: openService === i ? "#086ad8" : "#ccc",
                    transition: "color 0.2s", flexShrink: 0,
                  }}>
                    {openService === i ? "−" : "+"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── BENTO ABOUT ────────────────────────── */}
      <section style={{ padding: "100px 0", background: "#0d0f1a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: "#d2a98e", textTransform: "uppercase", marginBottom: 12 }}>
            Discover Our Company
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fff", fontWeight: 400, marginBottom: 48, lineHeight: 1.1 }}>
            Thriving for <span style={{ color: "#d2a98e", fontStyle: "italic" }}>11 years</span> —<br />
            and just getting started.
          </h2>

          {/* Bento grid */}
          <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

            {/* Big mission cell */}
            <div style={{
              gridColumn: "1 / 3",
              background: "linear-gradient(135deg, #086ad8 0%, #002fa6 100%)",
              borderRadius: 20, padding: "48px 48px",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", right: -40, top: -40, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ position: "absolute", right: 20, bottom: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 16 }}>
                  Our Mission
                </div>
                <p style={{ fontSize: 20, fontWeight: 300, color: "#fff", lineHeight: 1.7, maxWidth: 480 }}>
                  We believe progress is possible even when it's gradual. Our AI applications are dedicated to <strong style={{ fontWeight: 700 }}>elevating businesses</strong> through intelligent automation and data-driven outreach.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
                  {["Lead Automation", "AI Prospect Detection", "Smart CRM Integration", "Contact & Follow-Up Systems"].map(p => (
                    <span key={p} style={{
                      background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff", padding: "6px 14px", borderRadius: 6,
                      fontSize: 12, fontWeight: 600
                    }}>✓ {p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Awards cell */}
            <div style={{ background: "#1a1f36", borderRadius: 20, padding: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: "#d2a98e", textTransform: "uppercase", marginBottom: 20 }}>
                Recognition
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Top Training Companies 2016",
                  "CIO Big Data 100",
                  "Top 20 Sales Training 2015",
                  "Pharma Tech Outlook",
                ].map(award => (
                  <div key={award} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>🏆</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{award}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partners cell */}
            <div style={{ background: "#1a1f36", borderRadius: 20, padding: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: "#d2a98e", textTransform: "uppercase", marginBottom: 20 }}>
                Tech Partners
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Salesforce", "HubSpot", "Google", "Zoho", "AWS", "Microsoft"].map(p => (
                  <div key={p} style={{
                    background: "rgba(255,255,255,0.05)", borderRadius: 8,
                    padding: "10px 14px", fontSize: 12, fontWeight: 700,
                    color: "rgba(255,255,255,0.7)", textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}>{p}</div>
                ))}
              </div>
            </div>

            {/* CTA cell */}
            <div style={{
              background: "#d2a98e", borderRadius: 20, padding: 32,
              display: "flex", flexDirection: "column", justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>
                  Ready to scale your pipeline?
                </h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                  Let's build a strategy that works for your industry and budget.
                </p>
              </div>
              <a href="/contact-us" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 44, background: "#fff", borderRadius: 8, marginTop: 20,
                fontWeight: 800, fontSize: 14, color: "#d2a98e", textDecoration: "none",
                transition: "opacity 0.2s"
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.9")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                Let's Talk →
              </a>
            </div>

            {/* Spin badge cell */}
            <div style={{
              background: "rgba(8,106,216,0.08)", border: "1px dashed rgba(8,106,216,0.25)",
              borderRadius: 20, padding: 32,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <div style={{ position: "relative", width: 140, height: 140 }}>
                <svg className="spin-badge" viewBox="0 0 140 140" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <defs>
                    <path id="circle-text" d="M 70,70 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
                  </defs>
                  <text fill="#086ad8" fontSize="11" fontWeight="700" letterSpacing="3" fontFamily="Outfit,sans-serif">
                    <textPath href="#circle-text">AI-POWERED · LEAD GENERATION · JAIPUR INDIA ·</textPath>
                  </text>
                </svg>
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                  width: 64, height: 64, background: "linear-gradient(135deg,#086ad8,#002fa6)",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26
                }}>🎯</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────────────────── STATS ─────────────────────────────── */}
      <section style={{ padding: "100px 0", background: "#f5f4f0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: "#086ad8", textTransform: "uppercase", marginBottom: 12 }}>
              By the Numbers
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#0d0f1a", fontWeight: 400 }}>
              Results that <span style={{ fontStyle: "italic", color: "#086ad8" }}>speak louder</span> than claims
            </h2>
          </div>

          <div className="stats-list" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(0,0,0,0.08)", borderRadius: 20, overflow: "hidden" }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: i % 2 === 0 ? "#0d0f1a" : "#1a1f36",
                padding: "48px 40px",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", top: 16, right: 20,
                  fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
                  color: "rgba(255,255,255,0.2)", textTransform: "uppercase"
                }}>0{i + 1}</div>
                <div style={{
                  fontSize: "clamp(2.5rem,4vw,3.5rem)",
                  fontWeight: 900, color: "#fff",
                  letterSpacing: "-0.04em", lineHeight: 1,
                  marginBottom: 8
                }}>
                  <Counter value={s.value} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#d2a98e", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── CASE STUDIES ───────────────────────── */}
      <section style={{ padding: "100px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: "#086ad8", textTransform: "uppercase", marginBottom: 12 }}>
                Case Studies
              </div>
              <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#0d0f1a", fontWeight: 400, lineHeight: 1.1 }}>
                Work that <span style={{ fontStyle: "italic", color: "#d2a98e" }}>defines</span> us
              </h2>
            </div>
            <a href="/case-studies" style={{ fontSize: 14, fontWeight: 700, color: "#086ad8", textDecoration: "none", borderBottom: "2px solid #086ad8", paddingBottom: 2 }}>
              All Case Studies →
            </a>
          </div>

          <div className="case-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {caseStudies.map((cs, i) => (
              <div key={i} className="cs-card" style={{ height: 320, background: `linear-gradient(135deg, ${cs.color}18, ${cs.color}30)`, border: `1px solid ${cs.color}25` }}>
                {/* Background pattern */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 70% 30%, ${cs.color}20 0%, transparent 60%)` }} />

                {/* Content */}
                <div style={{ position: "absolute", inset: 0, zIndex: 1, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="pill" style={{ background: cs.color, color: "#fff" }}>
                      {cs.cat}
                    </span>
                    <span style={{ fontSize: 40 }}>{cs.icon}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 22, fontWeight: 800, color: "#0d0f1a", marginBottom: 8 }}>{cs.title}</h4>
                    <div style={{ fontSize: 14, color: cs.color, fontWeight: 700, marginBottom: 16 }}>📊 {cs.result}</div>
                    <a href="/case-studies" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontSize: 13, fontWeight: 700, color: "#0d0f1a",
                      textDecoration: "none", borderBottom: `2px solid ${cs.color}`, paddingBottom: 2
                    }}>View Full Study →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── TESTIMONIALS ───────────────────────── */}
      <section style={{ padding: "100px 0", background: "#f5f4f0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: "#086ad8", textTransform: "uppercase", marginBottom: 12 }}>
              Client Voices
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#0d0f1a", fontWeight: 400 }}>
              What our clients <span style={{ fontStyle: "italic", color: "#086ad8" }}>actually say</span>
            </h2>
          </div>

          {/* Featured testimonial */}
          <div style={{
            background: "#0d0f1a", borderRadius: 24, padding: "56px 64px",
            marginBottom: 20, position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: 32, right: 64, fontSize: "120px", color: "rgba(210,169,142,0.08)", fontFamily: "Georgia,serif", lineHeight: 1 }}>
              &#8220;
            </div>
            <div style={{ maxWidth: 680, position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} width="16" height="16" fill="#d2a98e" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <blockquote className="serif" style={{ fontSize: "clamp(1.25rem,2.5vw,1.75rem)", color: "#fff", fontWeight: 400, lineHeight: 1.55, marginBottom: 32, fontStyle: "italic" }}>
                &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${testimonials[activeTestimonial].color}, ${testimonials[activeTestimonial].color}aa)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 15
                }}>
                  {testimonials[activeTestimonial].initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{testimonials[activeTestimonial].name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mini cards */}
          <div className="testi-mini" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {testimonials.map((t, i) => (
              <div key={i} onClick={() => setActiveTestimonial(i)} style={{
                background: i === activeTestimonial ? "#0d0f1a" : "#fff",
                border: `1.5px solid ${i === activeTestimonial ? "#086ad8" : "rgba(0,0,0,0.08)"}`,
                borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all 0.25s"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.color}, ${t.color}aa)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 12
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: i === activeTestimonial ? "#fff" : "#0d0f1a" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(105,105,105,0.8)" }}>{t.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: i === activeTestimonial ? "rgba(255,255,255,0.6)" : "#696969", lineHeight: 1.6 }}>
                  {t.quote.slice(0, 60)}…
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── SPLIT CTA ─────────────────────────── */}
      <section style={{ background: "#086ad8" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="split-cta" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {/* Left */}
            <div style={{ padding: "80px 64px", borderRight: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 16 }}>
                Talk To Us
              </div>
              <h2 className="serif" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "#fff", fontWeight: 400, lineHeight: 1.15, marginBottom: 24 }}>
                Ready to transform<br />
                your <span style={{ color: "#d2a98e", fontStyle: "italic" }}>lead pipeline?</span>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: 36 }}>
                Get a personalized strategy session — no obligation. We'll audit your current approach and show you exactly where the opportunities lie.
              </p>
              <a href="/contact-us" style={{
                display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 32px",
                background: "#fff", color: "#086ad8", borderRadius: 10,
                fontWeight: 800, fontSize: 15, textDecoration: "none",
                boxShadow: "0 8px 30px rgba(0,0,0,0.15)", transition: "opacity 0.2s"
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.9")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                Book a Free Audit →
              </a>
            </div>
            {/* Right */}
            <div style={{ padding: "80px 64px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "📞", label: "Call Us Now", value: "+91 9950602330", href: "tel:+919950602330" },
                  { icon: "✉", label: "Email Us", value: "info@makemyleads.com", href: "mailto:info@makemyleads.com" },
                  { icon: "💬", label: "WhatsApp", value: "Message us instantly", href: "https://wa.me/919950602330" },
                ].map(c => (
                  <a key={c.label} href={c.href} style={{
                    display: "flex", alignItems: "center", gap: 16, textDecoration: "none",
                    padding: "20px 24px", background: "rgba(255,255,255,0.08)",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", transition: "background 0.2s"
                  }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.16)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}>
                    <span style={{ fontSize: 24, width: 40, textAlign: "center" }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{c.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────── FOOTER ────────────────────────────── */}
      <footer style={{ background: "#0a0b14", paddingTop: 72 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          {/* Top row */}
          <div className="footer-cols" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#086ad8,#002fa6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>MakeMyLeads</span>
              </div>
              <address style={{ fontStyle: "normal", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.9 }}>
                30 A, Sultan Nagar #2<br />
                Gurjar Ki Thadi, Jaipur<br />
                Rajasthan, India – 302019
              </address>
              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                {["TW", "FB", "IG", "LI"].map(s => (
                  <a key={s} href="#" style={{
                    width: 34, height: 34, borderRadius: 7,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)",
                    textDecoration: "none", transition: "all 0.2s"
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#086ad8"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}>
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {[
              { heading: "Services", links: ["Lead Generation", "AI Automation", "CRM Setup", "Data Security", "Consulting"] },
              { heading: "Company", links: ["About Us", "Case Studies", "Blog", "Why Choose Us", "FAQs"] },
              { heading: "Industries", links: ["Finance", "Medical", "Real Estate", "Education", "Rentals"] },
            ].map(col => (
              <div key={col.heading}>
                <h6 style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 20, letterSpacing: "0.5px" }}>{col.heading}</h6>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map(link => (
                    <li key={link} style={{ marginBottom: 10 }}>
                      <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#d2a98e")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              © 2024 MakeMyLeads.com · All Rights Reserved · Jaipur, India
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms of Service", "Sitemap"].map(l => (
                <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#086ad8")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      {scrolled && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{
          position: "fixed", bottom: 28, right: 28, width: 44, height: 44,
          borderRadius: "50%", background: "#0d0f1a", border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 9998, transition: "background 0.2s",
          animation: "fadeUp 0.3s ease"
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#086ad8")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#0d0f1a")}
          aria-label="Back to top">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  );
}