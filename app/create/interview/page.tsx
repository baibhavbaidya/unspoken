'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Send } from 'lucide-react';

interface QA {
  question: string;
  answer: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageType = searchParams.get('type') || 'other';
  
  const { user } = useAuth();
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const [qaHistory, setQaHistory] = useState<QA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory, currentQuestion]);

  // Auto focus textarea when loading finishes
useEffect(() => {
  if (!loading && !isComplete) {
    textareaRef.current?.focus();
  }
}, [loading, isComplete]);


  // Get first question on mount
  useEffect(() => {
    if (user?.uid) {
      getNextQuestion('');
    }
  }, [user]);

  const saveConversation = async (history: QA[], status: string) => {
    if (!user?.uid) return;

    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      
      await setDoc(conversationRef, {
        id: conversationId,
        userId: user.uid,
        messageType: messageType,
        status: status,
        qaHistory: history,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(status === 'completed' && { completedAt: new Date() }),
      }, { merge: true });

      console.log('Conversation saved to Firestore');
    } catch (error) {
      console.error('Error saving conversation:', error);
      // Don't throw - continue even if save fails
    }
  };

  const getNextQuestion = async (answer: string) => {
    setLoading(true);
    try {
      if (!user?.uid) {
        alert('You must be logged in to continue');
        router.push('/auth/login');
        return;
      }

      // Build conversation history for API
      const history = qaHistory.flatMap(qa => [
        { role: 'assistant', content: qa.question },
        { role: 'user', content: qa.answer },
      ]);

      console.log('Calling AI API...');

      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType,
          conversationHistory: history,
          userAnswer: answer,
        }),
      });

      const data = await response.json();

      console.log('AI response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      setCurrentQuestion(data.question);
      
      if (data.isComplete) {
        setIsComplete(true);
        
        // Save final conversation to Firestore
        await saveConversation(qaHistory, 'completed');
        
        // Wait 2 seconds then go to generation
        setTimeout(() => {
          router.push(`/create/generate?conversationId=${conversationId}`);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error getting question:', error);
      alert(`Failed to get next question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    // Add to history
    const newHistory = [...qaHistory, { question: currentQuestion, answer: userInput }];
    setQaHistory(newHistory);
    
    // Save to Firestore (don't wait)
    saveConversation(newHistory, 'in_progress');
    
    // Get next question
    await getNextQuestion(userInput);
    
    // Clear input and reset textarea height
    setUserInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const totalQuestions = 6;
  const answeredQuestions = Math.min(qaHistory.length, totalQuestions);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
            <button
              onClick={() => router.push('/create')}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <span className="text-sm text-muted-foreground">
              Question {Math.min(answeredQuestions + 1, totalQuestions)} of {totalQuestions}
            </span>
            <div className="w-14" aria-hidden="true" />
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-muted">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{
                width: `${(answeredQuestions / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8">
            <div className="flex flex-col gap-6">
              {/* Previous Q&A */}
              {qaHistory.map((qa, index) => (
                <div key={index} className="flex flex-col gap-6">
                  {/* AI Question */}
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%] gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-accent"
                          aria-hidden="true"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="7"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M5 10C5 10 6.25 7 8 7C9.75 7 11 10 11 10"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                          <circle cx="8" cy="5.5" r="1" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                        {qa.question}
                      </div>
                    </div>
                  </div>

                  {/* User Answer */}
                  <div className="flex justify-end">
                    <div className="flex max-w-[85%] flex-row-reverse gap-3">
                      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
                        {qa.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Current Question */}
              {currentQuestion && !isComplete && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-accent"
                        aria-hidden="true"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M5 10C5 10 6.25 7 8 7C9.75 7 11 10 11 10"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <circle cx="8" cy="5.5" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                      {currentQuestion}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-accent"
                        aria-hidden="true"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M5 10C5 10 6.25 7 8 7C9.75 7 11 10 11 10"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <circle cx="8" cy="5.5" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Message */}
              {isComplete && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✨</div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Great! I have everything I need
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Now I'll create your message in 3 different tones...
                  </p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        {/* Input area */}
        {!isComplete && (
          <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl px-6 py-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Take your time..."
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                />
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!userInput.trim() || loading}
                  className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}