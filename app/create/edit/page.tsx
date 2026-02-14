'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, ChevronRight, Lightbulb, X } from 'lucide-react';

const suggestions = [
  {
    id: 1,
    text: "Consider adding a specific example of what you'd do differently. Concrete commitments feel more sincere than general promises.",
  },
  {
    id: 2,
    text: "The closing is strong. You might also acknowledge their strength in setting boundaries -- it shows you respect their perspective.",
  },
  {
    id: 3,
    text: "If this is the first time reaching out in a while, adding a line about respecting their space can ease the weight of the message.",
  },
];

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageId, setMessageId] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    loadMessage();
  }, []);

  const loadMessage = async () => {
    const msgId = searchParams.get('messageId');
    const versionIdx = searchParams.get('version');
    
    if (!msgId) {
      alert('Message ID not found');
      router.push('/dashboard');
      return;
    }

    setMessageId(msgId);
    
    try {
      const messageRef = doc(db, 'messages', msgId);
      const messageSnap = await getDoc(messageRef);

      if (messageSnap.exists()) {
        const messageData = messageSnap.data();
        
        // If version index is provided, use that version
        if (versionIdx !== null && messageData.versions) {
          const idx = parseInt(versionIdx);
          if (messageData.versions[idx]) {
            setContent(messageData.versions[idx].content);
            setWordCount(messageData.versions[idx].content.split(/\s+/).filter((w: string) => w.length > 0).length);
          }
        } 
        // Otherwise use finalContent if it exists
        else if (messageData.finalContent) {
          setContent(messageData.finalContent);
          setWordCount(messageData.finalContent.split(/\s+/).filter((w: string) => w.length > 0).length);
        }
        // Or use first version as fallback
        else if (messageData.versions && messageData.versions[0]) {
          setContent(messageData.versions[0].content);
          setWordCount(messageData.versions[0].content.split(/\s+/).filter((w: string) => w.length > 0).length);
        }
      } else {
        alert('Message not found');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading message:', error);
      alert('Failed to load message');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setWordCount(newContent.split(/\s+/).filter(word => word.length > 0).length);
  };

  const handleSave = async () => {
    if (!messageId) {
      alert('Message not found. Please try again.');
      return;
    }

    setSaving(true);
    try {
      const messageRef = doc(db, 'messages', messageId);
      const versionIdx = searchParams.get('version');
      
      await updateDoc(messageRef, {
        selectedVersion: versionIdx ? parseInt(versionIdx) : 0,
        finalContent: content,
        updatedAt: new Date(),
      });

      console.log('Message saved!');
      
      // Go to delivery page
      router.push(`/create/deliver?messageId=${messageId}`);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <h1 className="text-sm font-medium text-foreground">
              Edit Your Message
            </h1>
            <span className="text-xs text-muted-foreground">
              {wordCount} words
            </span>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1">
          {/* Editor area */}
          <div className={`flex-1 transition-all ${showSidebar ? 'lg:pr-0' : ''}`}>
            <div className="mx-auto max-w-3xl px-6 py-10">
              <div className="rounded-xl border border-border bg-card p-8 shadow-sm md:p-10">
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full resize-none border-0 bg-transparent text-lg leading-[1.8] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Your message..."
                  rows={15}
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <aside className="hidden w-80 shrink-0 border-l border-border bg-card/50 lg:block">
              <div className="sticky top-14 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lightbulb className="h-4 w-4 text-accent" aria-hidden="true" />
                    AI Suggestions
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSidebar(false)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close suggestions"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {s.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-2">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Lightbulb className="h-4 w-4" aria-hidden="true" />
                  Show Suggestions
                </button>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Next: Deliver'}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}