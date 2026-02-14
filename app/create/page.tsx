'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/ui/navbar';
import { MessageSquare, Heart, Sparkles, Shield, HandHeart, Plus } from 'lucide-react';

const messageTypes = [
  {
    id: 'apology',
    title: 'Apologize',
    description: 'Express regret and take responsibility',
    icon: MessageSquare,
    color: 'from-rose-50 to-rose-100/50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'love',
    title: 'Express Love',
    description: 'Share your feelings and affection',
    icon: Heart,
    color: 'from-pink-50 to-pink-100/50',
    iconColor: 'text-pink-600',
  },
  {
    id: 'gratitude',
    title: 'Share Gratitude',
    description: 'Show appreciation and thanks',
    icon: Sparkles,
    color: 'from-amber-50 to-amber-100/50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'boundary',
    title: 'Set a Boundary',
    description: 'Communicate your limits with care',
    icon: Shield,
    color: 'from-blue-50 to-blue-100/50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'confession',
    title: 'Make a Confession',
    description: 'Share something important',
    icon: HandHeart,
    color: 'from-purple-50 to-purple-100/50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'other',
    title: 'Something Else',
    description: 'Express any difficult emotion',
    icon: Plus,
    color: 'from-slate-50 to-slate-100/50',
    iconColor: 'text-slate-600',
  },
];

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleTypeSelect = (type: string) => {
    router.push(`/create/interview?type=${type}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
              What do you need to say?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Choose the type of message you want to create
            </p>
          </div>

          {/* Message Type Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {messageTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                      <Icon className={`h-6 w-6 ${type.iconColor}`} />
                    </div>
                    
                    <h3 className="mb-2 font-serif text-xl font-medium text-foreground">
                      {type.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Helper Text */}
          <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Not sure which to choose?</span>
              <br />
              Don't worry — the AI will guide you through the process with thoughtful questions.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}