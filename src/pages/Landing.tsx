import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple"];

  const features = [
    {
      number: "1",
      title: "Upload Resume",
      description:
        "Upload your resume in PDF or DOCX format. Our AI instantly parses and analyzes your content.",
    },
    {
      number: "2",
      title: "Add Job Description",
      description:
        "Paste the job description. We analyze requirements, keywords, and match your experience.",
    },
    {
      number: "3",
      title: "Get Recommendations",
      description:
        "Receive specific, actionable recommendations. Download your optimized resume instantly.",
    },
  ];

  const faqs = [
    {
      q: "How does WeavThru Resume work?",
      a: "Upload your resume, add a job description, and our AI analyzes the gap. You get specific recommendations to improve your match score.",
    },
    {
      q: "What file formats are supported?",
      a: "We support PDF and DOCX formats. For automatic updates, DOCX is recommended.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. Your data is encrypted and never shared with third parties.",
    },
    {
      q: "How accurate is the AI?",
      a: "Our AI is powered by Claude, trained on millions of resumes and job descriptions.",
    },
  ];

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <a href="/" className="nav-logo">
            <div className="nav-icon">W</div>
            <span className="nav-brand">WeavThruResume</span>
          </a>

          <div className="nav-links">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#faq" className="nav-link">
              FAQ
            </a>
          </div>

          <div className="nav-buttons">
            <button
              onClick={() => navigate("/login")}
              className="btn btn-ghost"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>
            Land Your Dream Job with{" "}
            <span className="gradient-text">AI-Optimized Resumes</span>
          </h1>
          <p>
            Upload your resume, match it against job descriptions, and get
            intelligent recommendations. Increase your interview rate by up to
            3x.
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/register")}
              className="btn btn-primary btn-large"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-secondary btn-large"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="trusted">
        <div className="container">
          <div className="trusted-label">Trusted by job seekers at</div>
          <div className="trusted-grid">
            {companies.map((company) => (
              <div key={company} className="trusted-company">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>
              Three simple steps to transform your resume and land more
              interviews
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.number} className="feature-card">
                <div className="feature-icon">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="feature-header">
                  <span className="feature-number">{feature.number}</span>
                  <h3>{feature.title}</h3>
                </div>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${openFaq === i ? "open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-icon">▼</span>
                </div>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Land Your Dream Job?</h2>
          <p>Join thousands who've optimized their resumes with AI</p>
          <button
            onClick={() => navigate("/register")}
            className="btn btn-primary btn-large"
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="nav-icon">W</div>
                <span className="nav-brand">WeavThruResume</span>
              </div>
              <p>AI-powered resume optimization</p>
            </div>

            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a href="#">Privacy</a>
                </li>
                <li>
                  <a href="#">Terms</a>
                </li>
                <li>
                  <a href="#">Security</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            © 2024 WeavThru Resume. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
