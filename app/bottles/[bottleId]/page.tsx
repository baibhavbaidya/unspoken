'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { formatTimeAgo } from '@/lib/utils';
import { use } from 'react';
import { ArrowLeft, Heart, Users, Smile, Zap } from 'lucide-react';

type ReactionType = 'heart' | 'hug' | 'peace' | 'strength';

const reactions = [
  { id: 'heart', icon: Heart, label: 'Heart', color: 'bg-red-100 text-red-600 hover:bg-red-50' },
  { id: 'hug', icon: Users, label: 'Hug', color: 'bg-amber-100 text-amber-600 hover:bg-amber-50' },
  { id: 'peace', icon: Smile, label: 'Peace', color: 'bg-blue-100 text-blue-600 hover:bg-blue-50' },
  { id: 'strength', icon: Zap, label: 'Strength', color: 'bg-purple-100 text-purple-600 hover:bg-purple-50' },
];

export default function BottleDetailPage({ params }: { params: Promise<{ bottleId: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Unwrap params using React.use()
  const { bottleId } = use(params);
  
  const [bottle, setBottle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reacting, setReacting] = useState(false);

  useEffect(() => {
    loadBottle();
    if (user) {
      loadUserReaction();
    }
  }, [bottleId, user]);

  const loadBottle = async () => {
    try {
      const bottleRef = doc(db, 'bottles', bottleId);
      const bottleSnap = await getDoc(bottleRef);

      if (bottleSnap.exists()) {
        setBottle({ id: bottleSnap.id, ...bottleSnap.data() });
      } else {
        router.push('/bottles');
      }
    } catch (error) {
      console.error('Error loading bottle:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReaction = async () => {
    if (!user) return;

    try {
      const reactionsRef = collection(db, 'bottleReactions');
      const q = query(
        reactionsRef,
        where('bottleId', '==', bottleId),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const reactionData = snapshot.docs[0].data();
        setUserReaction(reactionData.reactionType as ReactionType);
      }
    } catch (error) {
      console.error('Error loading user reaction:', error);
    }
  };

  const handleReact = async (reactionType: ReactionType) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (reacting) return;

    setReacting(true);

    try {
      const bottleRef = doc(db, 'bottles', bottleId);
      const reactionsRef = collection(db, 'bottleReactions');

      // Check if user already reacted
      const q = query(
        reactionsRef,
        where('bottleId', '==', bottleId),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // User already reacted
        const existingReaction = snapshot.docs[0];
        const existingType = existingReaction.data().reactionType;

        if (existingType === reactionType) {
          // Remove reaction (toggle off)
          await deleteDoc(existingReaction.ref);
          await updateDoc(bottleRef, {
            [`reactions.${reactionType}`]: increment(-1),
          });
          setUserReaction(null);
        } else {
          // Change reaction
          await updateDoc(existingReaction.ref, {
            reactionType: reactionType,
          });
          await updateDoc(bottleRef, {
            [`reactions.${existingType}`]: increment(-1),
            [`reactions.${reactionType}`]: increment(1),
          });
          setUserReaction(reactionType);
        }
      } else {
        // New reaction
        await addDoc(reactionsRef, {
          bottleId: bottleId,
          userId: user.uid,
          reactionType: reactionType,
          createdAt: new Date(),
        });
        await updateDoc(bottleRef, {
          [`reactions.${reactionType}`]: increment(1),
        });
        setUserReaction(reactionType);
      }

      // Reload bottle to get updated counts
      await loadBottle();
    } catch (error) {
      console.error('Error reacting:', error);
    } finally {
      setReacting(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const categoryMap: Record<string, string> = {
      unsent_apologies: '💔',
      hidden_love: '❤️',
      unspoken_gratitude: '🙏',
      setting_boundaries: '🛡️',
      grief_loss: '🕊️',
      breaking_free: '✨',
    };
    return categoryMap[category] || '🌊';
  };

  const getCategoryLabel = (category: string) => {
    const labelMap: Record<string, string> = {
      unsent_apologies: 'Unsent Apology',
      hidden_love: 'Hidden Love',
      unspoken_gratitude: 'Unspoken Gratitude',
      setting_boundaries: 'Setting Boundaries',
      grief_loss: 'Grief & Loss',
      breaking_free: 'Breaking Free',
    };
    return labelMap[category] || 'Message';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!bottle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Bottle not found</h2>
          <button
            onClick={() => router.push('/bottles')}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bottles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/bottles')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Bottles
        </button>

        {/* Bottle Card */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
          {/* Category Badge */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-4xl">{getCategoryEmoji(bottle.category)}</span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                {getCategoryLabel(bottle.category)}
              </div>
              <div className="text-sm text-muted-foreground">
                {bottle.createdAt && formatTimeAgo(bottle.createdAt.toDate())}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm mb-8 max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground">
              {bottle.content}
            </p>
          </div>

          {/* Reactions */}
          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              How does this make you feel?
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {reactions.map((reaction) => {
                const IconComponent = reaction.icon;
                return (
                  <button
                    key={reaction.id}
                    onClick={() => handleReact(reaction.id as ReactionType)}
                    disabled={reacting}
                    className={`rounded-xl border-2 p-4 transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
                      userReaction === reaction.id
                        ? 'border-accent bg-accent/5 shadow-md'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      userReaction === reaction.id ? 'bg-accent/15 text-accent' : reaction.color
                    }`}>
                      <IconComponent className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {bottle.reactions?.[reaction.id] || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">{reaction.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Share Your Story CTA */}
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold text-foreground">
            Have something to say?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Share your own message anonymously and help others feel less alone
          </p>
          <button
            onClick={() => router.push('/bottles/create')}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Release Your Message
          </button>
        </div>
      </div>
    </div>
  );
}