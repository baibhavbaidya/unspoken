'use client';

import Link from "next/link";
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logOut();
    router.push('/');
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
        
        <div className="flex items-center gap-6">
          {!user ? (
            <>
              <Link
                href="/auth/signup" 
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
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
              <Link
                href="/dashboard"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Dashboard
              </Link>
              <Link
                href="/bottles"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
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
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Sign Out
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {user.email?.[0].toUpperCase()}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}