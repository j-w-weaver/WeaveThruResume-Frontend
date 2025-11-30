// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p className="text-text-muted">© 2025 ResumeAI. All rights reserved.</p>
        <div className="footer-links">
          <a href="#" className="hover:text-primary transition">
            Privacy
          </a>
          <a href="#" className="hover:text-primary transition">
            Terms
          </a>
          <a href="#" className="hover:text-primary transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
