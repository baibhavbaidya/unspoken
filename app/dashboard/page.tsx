'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/ui/navbar';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatTimeAgo } from '@/lib/utils';
import { FileText, Waves, Heart, Plus } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  conversationId: string;
  messageType: string;
  versions?: Array<{
    tone: string;
    title: string;
    content: string;
  }>;
  selectedVersion?: number;
  finalContent: string;
  status: string;
  createdAt: any;
  updatedAt: any;
}

interface Bottle {
  id: string;
  userId: string;
  category: string;
  content: string;
  reactions: {
    heart: number;
    hug: number;
    peace: number;
    strength: number;
  };
  commentCount: number;
  viewCount: number;
  isPublic: boolean;
  createdAt: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'drafts'>('all');
  const [stats, setStats] = useState({
    messagesCreated: 0,
    bottlesReleased: 0,
    totalReactions: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(
        messagesRef,
        where('userId', '==', user.uid)
      );
      const messagesSnap = await getDocs(messagesQuery);

      let messagesData = messagesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      const uniqueMessagesMap = new Map<string, Message>();
      messagesData.forEach(msg => {
        if (!uniqueMessagesMap.has(msg.id)) {
          uniqueMessagesMap.set(msg.id, msg);
        }
      });
      messagesData = Array.from(uniqueMessagesMap.values());

      messagesData = messagesData.sort((a, b) => 
        (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
      );

      setMessages(messagesData);

      const bottlesRef = collection(db, 'bottles');
      const bottlesQuery = query(
        bottlesRef,
        where('userId', '==', user.uid)
      );
      const bottlesSnap = await getDocs(bottlesQuery);

      let bottlesData = bottlesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bottle[];

      bottlesData = bottlesData.sort((a, b) => 
        (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
      );

      setBottles(bottlesData);

      const totalReactions = bottlesData.reduce((sum, bottle) => {
        const reactions = bottle.reactions || {};
        return sum + (reactions.heart || 0) + (reactions.hug || 0) +
          (reactions.peace || 0) + (reactions.strength || 0);
      }, 0);

      setStats({
        messagesCreated: messagesData.length,
        bottlesReleased: bottlesData.length,
        totalReactions: totalReactions,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (activeTab === 'all') return true;
    if (activeTab === 'drafts') return message.status === 'draft';
    return true;
  });

  const uniqueMessages = Array.from(
    new Map(filteredMessages.map(m => [m.id, m])).values()
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              {user?.email}
            </p>
          </div>

          {/* Stats */}
          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <span className="font-serif text-3xl font-medium text-foreground">
                  {stats.messagesCreated}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Messages Created
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <Waves className="h-8 w-8 text-muted-foreground" />
                <span className="font-serif text-3xl font-medium text-foreground">
                  {stats.bottlesReleased}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Bottles Released
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <Heart className="h-8 w-8 text-muted-foreground" />
                <span className="font-serif text-3xl font-medium text-foreground">
                  {stats.totalReactions}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Reactions Received
              </p>
            </div>
          </div>

          {/* Quick Action */}
          <div className="mb-12">
            <button
              onClick={() => router.push('/create')}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Create New Message
            </button>
          </div>

          {/* Messages Section */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-foreground">
                My Messages
              </h2>
              
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All ({messages.length})
                </button>
                <button
                  onClick={() => setActiveTab('drafts')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'drafts'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Drafts ({messages.filter(m => m.status === 'draft').length})
                </button>
              </div>
            </div>

            {uniqueMessages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-serif text-lg font-medium text-foreground">
                  {activeTab === 'all' ? 'No messages yet' : 'No drafts'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeTab === 'all' 
                    ? 'Create your first message to get started' 
                    : "You don't have any saved drafts"}
                </p>
                <button
                  onClick={() => router.push('/create')}
                  className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Create Message
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {uniqueMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => router.push(`/create/edit?messageId=${message.id}`)}
                    className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {message.messageType}
                        </span>
                        {message.status === 'draft' && (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {message.finalContent || message.versions?.[0]?.content || 'No content yet'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {message.createdAt && formatTimeAgo(message.createdAt.toDate())}
                      </span>
                      <span className="font-medium text-primary group-hover:underline">
                        {message.status === 'draft' ? 'Continue editing' : 'View'} →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}