// src/components/layout/Header.tsx
interface Props {
  onGetStarted: () => void;
}

export default function Header({ onGetStarted }: Props) {
  return (
    <header className="header">
      <div className="container header-content">
        <h1 className="logo">ResumeAI</h1>
        <nav className="nav-desktop">
          <a href="#features">Features</a>
          <a href="#companies">Used by</a>
          <a href="#tips">Tips</a>
          <a href="#faq">FAQ</a>
          <button onClick={onGetStarted} className="btn-primary">
            Get Started Free
          </button>
        </nav>
        <button onClick={onGetStarted} className="btn-primary mobile-only">
          Start Now
        </button>
      </div>
    </header>
  );
}
