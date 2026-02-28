'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { ArrowLeft, Lock, Heart, HandHeart, Shield, Sparkles, Bird, Send } from 'lucide-react';

type BottleCategory = 'unsent_apologies' | 'hidden_love' | 'unspoken_gratitude' | 'setting_boundaries' | 'grief_loss' | 'breaking_free';

const categories = [
  { id: 'unsent_apologies', label: 'Unsent Apologies', icon: Heart, description: 'Things you wish you had said', color: 'bg-red-100 text-red-600 hover:bg-red-50' },
  { id: 'hidden_love', label: 'Hidden Love', icon: Heart, description: 'Love that was never expressed', color: 'bg-pink-100 text-pink-600 hover:bg-pink-50' },
  { id: 'unspoken_gratitude', label: 'Unspoken Gratitude', icon: HandHeart, description: 'Thanks you never gave', color: 'bg-amber-100 text-amber-600 hover:bg-amber-50' },
  { id: 'setting_boundaries', label: 'Setting Boundaries', icon: Shield, description: 'Limits you needed to set', color: 'bg-blue-100 text-blue-600 hover:bg-blue-50' },
  { id: 'grief_loss', label: 'Grief & Loss', icon: Bird, description: 'Words to those no longer here', color: 'bg-slate-100 text-slate-600 hover:bg-slate-50' },
  { id: 'breaking_free', label: 'Breaking Free', icon: Sparkles, description: 'Liberation and new beginnings', color: 'bg-purple-100 text-purple-600 hover:bg-purple-50' },
];

function CreateBottleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageId = searchParams.get('messageId');
  
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<BottleCategory>('unsent_apologies');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (messageId) {
      loadMessage();
    } else {
      setLoadingMessage(false);
    }
  }, [messageId]);

  const loadMessage = async () => {
    if (!messageId) return;

    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);

      if (messageSnap.exists()) {
        const messageData = messageSnap.data();
        setContent(messageData.finalContent || '');
      }
    } catch (error) {
      console.error('Error loading message:', error);
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'bottles'), {
        userId: user?.uid,
        category: category,
        content: content.trim(),
        reactions: {
          heart: 0,
          hug: 0,
          peace: 0,
          strength: 0,
        },
        commentCount: 0,
        viewCount: 0,
        isPublic: true,
        isFeatured: false,
        createdAt: new Date(),
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        router.push('/bottles');
      }, 2000);
    } catch (error) {
      console.error('Error creating bottle:', error);
      alert('Failed to release bottle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMessage) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-accent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <h1 className="mb-3 text-4xl font-bold text-foreground">
              Release a Message in a Bottle
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your story anonymously to help others feel less alone
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <label className="mb-4 block text-lg font-semibold text-foreground">
                Choose a Category
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as BottleCategory)}
                      className={`group rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                        category === cat.id
                          ? 'border-accent bg-accent/5 shadow-md'
                          : 'border-border hover:border-accent/40'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                          category === cat.id ? 'bg-accent/15 text-accent' : cat.color
                        }`}>
                          <IconComponent className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <h3 className="font-semibold text-foreground">{cat.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Content */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <label className="mb-4 block text-lg font-semibold text-foreground">
                Your Message
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write what you need to say... This will be shared anonymously."
                className="w-full min-h-[300px] resize-none rounded-xl border border-input bg-background p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
              <div className="mt-2 text-sm text-muted-foreground">
                {content.length} characters
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Lock className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-foreground">Anonymous & Safe</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Your message will be shared anonymously. No one will know it's from you. 
                    Your identity is completely protected.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-xl border-2 border-input bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Releasing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Release Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="p-8 text-center">
              <div className="mb-4 text-6xl animate-bounce">🌊</div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Message Released!
              </h3>
              <p className="text-muted-foreground">
                Your words are now floating in the ocean for others to find and relate to.
              </p>
            </div>
            <div className="border-t border-border bg-muted/50 px-8 py-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default function CreateBottlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CreateBottleForm />
    </Suspense>
  );
}