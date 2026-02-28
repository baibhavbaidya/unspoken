'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Copy, Save, Mic, MessageCircle, Check, Share2, X } from 'lucide-react';

function DeliverForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageId = searchParams.get('messageId');
  
  const { user } = useAuth();
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    loadMessage();
  }, [messageId]);

  const loadMessage = async () => {
    if (!messageId) {
      router.push('/create');
      return;
    }

    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);

      if (messageSnap.exists()) {
        setMessage({ id: messageSnap.id, ...messageSnap.data() });
      } else {
        alert('Message not found');
        router.push('/create');
      }
    } catch (error) {
      console.error('Error loading message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    setSelected('copy');
    navigator.clipboard.writeText(message.finalContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = async () => {
    setSelected('save');
    try {
      const messageRef = doc(db, 'messages', messageId!);
      await updateDoc(messageRef, {
        status: 'draft',
        updatedAt: new Date(),
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  const handlePractice = () => {
    setSelected('practice');
    setShowPracticeModal(true);
  };

  const handleShareAnonymously = () => {
    setSelected('share');
    router.push(`/bottles/create?messageId=${messageId}`);
  };

  const handleShareDirect = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(message.finalContent);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent('A message for you');
    const body = encodeURIComponent(message.finalContent);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareToSMS = () => {
    const text = encodeURIComponent(message.finalContent);
    window.location.href = `sms:?body=${text}`;
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
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Edit
            </button>
            <h1 className="mb-3 text-4xl font-bold text-foreground">
              What would you like to do?
            </h1>
            <p className="text-lg text-muted-foreground">
              Your message is ready. Choose how you want to share it.
            </p>
          </div>

          {/* Delivery Options */}
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            {/* Copy to Clipboard */}
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className={`group flex flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected === 'copy' || copied
                  ? 'border-accent border-2 shadow-md'
                  : 'border-border hover:border-accent/40'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                selected === 'copy' || copied
                  ? 'bg-accent/15 text-accent'
                  : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
              }`}>
                {copied ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Copy className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium text-foreground">
                  {copied ? 'Copied!' : 'Copy to Send'}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Copy the message to your clipboard and send it through your preferred channel.
                </p>
              </div>
            </button>

            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className={`group flex flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected === 'save'
                  ? 'border-accent border-2 shadow-md'
                  : 'border-border hover:border-accent/40'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                selected === 'save'
                  ? 'bg-accent/15 text-accent'
                  : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
              }`}>
                <Save className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium text-foreground">Save Draft</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Keep it safe until you are ready. You can come back to it anytime.
                </p>
              </div>
            </button>

            {/* Practice First */}
            <button
              type="button"
              onClick={handlePractice}
              className={`group flex flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected === 'practice'
                  ? 'border-accent border-2 shadow-md'
                  : 'border-border hover:border-accent/40'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                selected === 'practice'
                  ? 'bg-accent/15 text-accent'
                  : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
              }`}>
                <Mic className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium text-foreground">Practice First</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Rehearse saying it aloud with guided prompts before sending.
                </p>
              </div>
            </button>

            {/* Share Direct */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShareDirect}
                className={`group flex w-full flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  showShareMenu
                    ? 'border-accent border-2 shadow-md'
                    : 'border-border hover:border-accent/40'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  showShareMenu
                    ? 'bg-accent/15 text-accent'
                    : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
                }`}>
                  <Share2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-medium text-foreground">Share Direct</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Send directly via WhatsApp, email, or text message.
                  </p>
                </div>
              </button>

              {showShareMenu && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border border-border bg-card p-2 shadow-lg">
                  <button onClick={shareToWhatsApp} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">WhatsApp</div>
                      <div className="text-xs text-muted-foreground">Share via WhatsApp</div>
                    </div>
                  </button>

                  <button onClick={shareToEmail} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Email</div>
                      <div className="text-xs text-muted-foreground">Send via email</div>
                    </div>
                  </button>

                  <button onClick={shareToSMS} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Text Message</div>
                      <div className="text-xs text-muted-foreground">Send via SMS</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Share Anonymously */}
            <button
              type="button"
              onClick={handleShareAnonymously}
              className={`group flex flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected === 'share'
                  ? 'border-accent border-2 shadow-md'
                  : 'border-border hover:border-accent/40'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                selected === 'share'
                  ? 'bg-accent/15 text-accent'
                  : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
              }`}>
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium text-foreground">Share Anonymously</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Release your words into the Bottle Board for others to find and relate to.
                </p>
              </div>
            </button>
          </div>

          {/* Message Preview */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-foreground">Your Message:</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                {message?.finalContent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="border-b border-border bg-muted/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Mic className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Practice Mode</h3>
                </div>
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Practice mode will be available soon! This feature will help you rehearse your message with guided prompts before sending it.
              </p>
              <div className="rounded-lg bg-accent/10 p-4">
                <h4 className="mb-2 text-sm font-medium text-foreground">Coming Soon:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Voice recording and playback</span></li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Guided prompts for difficult conversations</span></li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>AI feedback on tone and delivery</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border bg-muted/50 px-6 py-4">
              <button
                onClick={() => setShowPracticeModal(false)}
                className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default function DeliverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <DeliverForm />
    </Suspense>
  );
}