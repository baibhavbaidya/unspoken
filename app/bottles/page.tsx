'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/ui/navbar';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatTimeAgo } from '@/lib/utils';
import { Heart, MessageCircle, Plus } from 'lucide-react';

type BottleCategory = 'all' | 'unsent_apologies' | 'hidden_love' | 'unspoken_gratitude' | 'setting_boundaries' | 'grief_loss' | 'breaking_free';

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
  isFeatured: boolean;
  createdAt: any;
}

const categories = [
  { id: 'all', label: 'All', emoji: '🌊' },
  { id: 'unsent_apologies', label: 'Unsent Apologies', emoji: '💔' },
  { id: 'hidden_love', label: 'Hidden Love', emoji: '❤️' },
  { id: 'unspoken_gratitude', label: 'Unspoken Gratitude', emoji: '🙏' },
  { id: 'setting_boundaries', label: 'Setting Boundaries', emoji: '🛡️' },
  { id: 'grief_loss', label: 'Grief & Loss', emoji: '🕊️' },
  { id: 'breaking_free', label: 'Breaking Free', emoji: '✨' },
];

export default function BottlesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BottleCategory>('all');

  useEffect(() => {
    loadBottles();
  }, [selectedCategory]);

  const loadBottles = async () => {
    setLoading(true);
    try {
      const bottlesRef = collection(db, 'bottles');
      const bottlesQuery = query(
        bottlesRef,
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const bottlesSnap = await getDocs(bottlesQuery);
      let bottlesData = bottlesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bottle[];
      
      bottlesData = bottlesData.filter(bottle => bottle.isPublic === true);
      
      if (selectedCategory !== 'all') {
        bottlesData = bottlesData.filter(bottle => bottle.category === selectedCategory);
      }
      
      setBottles(bottlesData);
    } catch (error) {
      console.error('Error loading bottles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.emoji || '🌊';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl md:text-5xl">
                Message in a Bottle
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                A space for what was never said
              </p>
            </div>
            
            {user && (
              <button
                onClick={() => router.push('/bottles/create')}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Share Your Message
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as BottleCategory)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span className="mr-1.5">{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottles Grid - Masonry Style */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : bottles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <div className="text-6xl mb-4">🌊</div>
            <h3 className="font-serif text-lg font-medium text-foreground">
              No bottles found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to share a message in this category
            </p>
            {user && (
              <button
                onClick={() => router.push('/bottles/create')}
                className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Share Your Message
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {bottles.map((bottle) => (
              <div
                key={bottle.id}
                onClick={() => router.push(`/bottles/${bottle.id}`)}
                className="group mb-6 break-inside-avoid cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-3 text-3xl">
                  {getCategoryEmoji(bottle.category)}
                </div>

                <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-foreground">
                  {bottle.content}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {(bottle.reactions?.heart || 0) + (bottle.reactions?.hug || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {bottle.commentCount || 0}
                  </span>
                  <span className="ml-auto">
                    {bottle.createdAt && formatTimeAgo(bottle.createdAt.toDate())}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Stats */}
        {bottles.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {bottles.length} messages • A community of healing
            </p>
          </div>
        )}
      </main>
    </div>
  );
}