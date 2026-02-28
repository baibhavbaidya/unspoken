'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ArrowLeft, RefreshCw, Eye, Check, X } from 'lucide-react';

interface MessageVersion {
  tone: string;
  title: string;
  content: string;
}

function GenerateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [versions, setVersions] = useState<MessageVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState<number | null>(null);
  const [messageType, setMessageType] = useState('');
  const [messageId, setMessageId] = useState('');

  useEffect(() => {
    if (!conversationId) {
      router.push('/create');
      return;
    }
    generateMessages();
  }, [conversationId]);

  const generateMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const conversationRef = doc(db, 'conversations', conversationId!);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = conversationSnap.data();
      const qaHistory = conversation.qaHistory || [];
      const msgType = conversation.messageType || 'other';
      
      setMessageType(msgType);

      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: msgType,
          qaHistory: qaHistory,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setVersions(data.versions);

      const messagesRef = collection(db, 'messages');
      const existingQuery = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('userId', '==', user?.uid)
      );
      const existingSnap = await getDocs(existingQuery);

      let finalMessageId;

      if (!existingSnap.empty) {
        finalMessageId = existingSnap.docs[0].id;
        await updateDoc(doc(db, 'messages', finalMessageId), {
          versions: data.versions,
          updatedAt: new Date(),
        });
      } else {
        finalMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'messages', finalMessageId), {
          id: finalMessageId,
          userId: user?.uid,
          conversationId: conversationId,
          messageType: msgType,
          versions: data.versions,
          selectedVersion: null,
          finalContent: '',
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      setMessageId(finalMessageId);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (index: number) => {
    setSelectedVersion(index);
    router.push(`/create/edit?messageId=${messageId}&version=${index}`);
  };

  const getToneEmoji = (tone: string) => {
    const toneMap: { [key: string]: string } = {
      vulnerable: '💔',
      direct: '💬',
      gentle: '🌸',
      empathetic: '💙',
      professional: '💼',
      casual: '😊',
      assertive: '💪',
      compassionate: '🤗'
    };
    return toneMap[tone.toLowerCase()] || '✨';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 animate-pulse text-6xl">✨</div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Crafting your message...
            </h2>
            <p className="mb-6 text-muted-foreground">
              AI is creating 3 versions in different tones
            </p>
            <div className="flex justify-center gap-2">
              <div className="h-3 w-3 animate-bounce rounded-full bg-accent" style={{ animationDelay: '0ms' }}></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-accent" style={{ animationDelay: '150ms' }}></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-accent" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-xl border border-border">
            <div className="mb-4 text-5xl">😞</div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Oops! Something went wrong
            </h2>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <button
              onClick={() => router.push('/create')}
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Over
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/create/interview?type=' + messageType)}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Interview
            </button>
            <h1 className="mb-3 text-4xl font-bold text-foreground">
              Choose the version that feels right
            </h1>
            <p className="text-lg text-muted-foreground">
              AI created your message in 3 different tones. Pick the one that resonates with you.
            </p>
          </div>

          {/* Version Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {versions.map((version, index) => (
              <div
                key={index}
                className={`group rounded-2xl border bg-card p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
                  selectedVersion === index ? 'border-accent ring-2 ring-accent' : 'border-border'
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">
                      {version.tone}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {version.title}
                    </h3>
                  </div>
                  <div className="text-3xl">
                    {getToneEmoji(version.tone)}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="line-clamp-6 text-sm text-muted-foreground">
                    {version.content}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(index)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-input bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent/5"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleSelect(index)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="text-center">
            <button
              onClick={generateMessages}
              className="inline-flex items-center gap-2 font-medium text-accent transition-colors hover:text-accent/80"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              None feel right? Generate again
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl border border-border">
            <div className="border-b border-border bg-muted/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {versions[showPreview].tone}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {versions[showPreview].title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPreview(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {versions[showPreview].content}
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border bg-muted/50 px-6 py-4">
              <button
                onClick={() => setShowPreview(null)}
                className="flex-1 rounded-xl border-2 border-input bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent/5"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(null);
                  handleSelect(showPreview);
                }}
                className="flex-1 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Select This Version
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <GenerateForm />
    </Suspense>
  );
}