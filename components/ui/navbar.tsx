'use client';

import Link from "next/link";
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logOut();
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10"
        aria-label="Main navigation"
      >
        <Link
          href={user ? "/create" : "/"}
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="14"
              cy="14"
              r="13"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M9 17C9 17 10.5 12 14 12C17.5 12 19 17 19 17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle cx="14" cy="9" r="1.5" fill="currentColor" opacity="0.5" />
          </svg>
          <span className="font-serif text-lg font-medium tracking-tight">
            Unspoken
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link
                href="/auth/signup"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Explore Bottles
              </Link>
              <Link
                href="/auth/login"
                className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/bottles" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Bottles
              </Link>
              <Link
                href="/create"
                className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Create Message
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Out
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {user.email?.[0].toUpperCase()}
              </div>
            </>
          )}
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
          {!user && (
            <Link
              href="/auth/login"
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 p-1 text-foreground"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 px-6 py-4 flex flex-col gap-4">
          {!user ? (
            <Link
              href="/auth/signup"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Explore Bottles
            </Link>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/bottles" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Bottles
              </Link>
              <Link
                href="/create"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Create Message
              </Link>
              <button
                onClick={handleSignOut}
                className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}