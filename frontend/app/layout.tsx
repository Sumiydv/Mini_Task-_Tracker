import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Task Tracker',
  description: 'Mini Task Tracker'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="header">
            <div className="brand">
              <span className="brand-badge">TT</span>
              Task Tracker
            </div>
            <nav>
              <a href="/login">Login</a>
              <a href="/signup">Signup</a>
              <a href="/tasks">Dashboard</a>
            </nav>
          </header>
          <main className="container">{children}</main>
        </div>
      </body>
    </html>
  );
}
