"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { FlowingWaves } from "@/components/ui/flowing-waves"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* Ocean-inspired gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(170deg, hsl(199, 40%, 92%) 0%, hsl(199, 30%, 95%) 30%, hsl(210, 15%, 97%) 60%, #fafafa 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 60%, hsla(199, 89%, 48%, 0.10) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Flowing waves illustration */}
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <FlowingWaves />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        {/* Small label */}
        <div
          className={`mb-8 transition-all duration-1000 ease-out ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            Emotional Wellness, Guided by AI
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`font-serif text-4xl font-medium leading-tight tracking-tight text-foreground transition-all delay-150 duration-1000 ease-out sm:text-5xl md:text-6xl lg:text-7xl ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <span className="text-balance">
            Say what needs{" "}
            <span className="relative">
              to be said
              <svg
                className="absolute -bottom-1 left-0 w-full md:-bottom-2"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 5.5C40 2 80 1.5 100 3C120 4.5 160 6 199 2.5"
                  stroke="#fb7185"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground transition-all delay-300 duration-1000 ease-out sm:text-lg md:mt-8 md:text-xl ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          {"AI helps you find the words for life's hardest conversations"}
        </p>

        {/* CTAs */}
        <div
          className={`mt-10 flex flex-col items-center gap-4 transition-all delay-500 duration-1000 ease-out sm:flex-row sm:gap-5 md:mt-12 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => router.push('/auth/signup')}
            className="group flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start Your Message
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => router.push('/auth/signup')}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-7 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Explore Bottles
          </button>
        </div>

        {/* Trust indicators */}
        <div
          className={`mt-14 flex flex-col items-center gap-3 transition-all delay-700 duration-1000 ease-out md:mt-16 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 1L3.5 3.5V6.5C3.5 9.25 5 11.5 7 13C9 11.5 10.5 9.25 10.5 6.5V3.5L7 1Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Private & Encrypted
            </span>
            <span
              className="h-3 w-px bg-border"
              aria-hidden="true"
            />
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M5 7L6.5 8.5L9 5.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              No Judgment
            </span>
            <span
              className="h-3 w-px bg-border"
              aria-hidden="true"
            />
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 2C4.5 2 2.5 4 2.5 6.5C2.5 9 4.5 11 7 12C9.5 11 11.5 9 11.5 6.5C11.5 4 9.5 2 7 2Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Built with Empathy
            </span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{
          background:
            "linear-gradient(to top, #fafafa, transparent)",
        }}
        aria-hidden="true"
      />
    </section>
  )
}