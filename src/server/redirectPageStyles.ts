export const REDIRECT_PAGE_STYLES = `
  :root {
    --primary: #8b5cf6;
    --primary-hover: #7c3aed;
    --bg: #020617;
    --card-bg: #0f172a;
    --text: #f8fafc;
    --text-muted: #94a3b8;
  }

  * {
    box-sizing: border-box;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: 24px;
    overflow: hidden;
    gap: 20px;
  }

  .background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    z-index: -1;
  }

  .card {
    background: rgba(15, 23, 42, 0.8);
    padding: 3.5rem 2.5rem;
    border-radius: 2.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    max-width: 420px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(139, 92, 246, 0.1);
    color: var(--primary);
    margin-bottom: 2rem;
    border: 1px solid rgba(139, 92, 246, 0.2);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .icon-wrapper {
    position: relative;
    margin-bottom: 1.5rem;
  }

  .icon {
    width: 112px;
    height: 112px;
    border-radius: 24%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
    object-fit: cover;
    position: relative;
    z-index: 1;
  }

  .icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140%;
    height: 140%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
    z-index: 0;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    color: #fff;
    letter-spacing: -0.02em;
  }

  p {
    color: var(--text-muted);
    margin: 0 0 2.5rem 0;
    font-size: 1rem;
    line-height: 1.5;
  }

  a {
    color: inherit;
  }

  .btn-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--primary);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    gap: 0.75rem;
    border: none;
    font-size: 1rem;
  }

  .btn:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;
