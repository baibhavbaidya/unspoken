'use client';

import { Navbar } from '@/components/ui/navbar';
import { HeroSection } from '@/components/ui/hero-section';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect if user exists AND we haven't redirected yet
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/create');
    }
    
    // Reset flag when user logs out
    if (!user) {
      hasRedirected.current = false;
    }
  }, [user, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show hero for logged-out users (don't redirect)
  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <HeroSection />
      </div>
    );
  }

  // Show loading while redirecting logged-in users
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}