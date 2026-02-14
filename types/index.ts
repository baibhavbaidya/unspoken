import { Timestamp } from 'firebase/firestore';

export type MessageType = 'apology' | 'love' | 'gratitude' | 'boundary' | 'confession' | 'other';

export type MessageStatus = 'draft' | 'sent' | 'scheduled' | 'bottled' | 'practicing';

export type BottleCategory = 
  | 'unsent_apologies' 
  | 'hidden_love' 
  | 'unspoken_gratitude' 
  | 'setting_boundaries' 
  | 'grief_loss' 
  | 'breaking_free';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  messagesCreated: number;
  bottlesReleased: number;
  practiceSessionsCompleted: number;
}

export interface Conversation {
  id: string;
  userId: string;
  messageType: MessageType;
  status: 'in_progress' | 'completed';
  recipientName: string;
  recipientRelationship: string;
  qaHistory: Array<{
    question: string;
    answer: string;
    timestamp: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface MessageVersion {
  tone: 'vulnerable' | 'direct' | 'gentle';
  title: string;
  content: string;
}

export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  recipientName: string;
  recipientRelationship: string;
  messageType: MessageType;
  versions: MessageVersion[];
  selectedVersion: number;
  finalContent: string;
  status: MessageStatus;
  deliveryMethod?: string;
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Bottle {
  id: string;
  userId: string;
  category: BottleCategory;
  tags: string[];
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
  createdAt: Timestamp;
}

export interface PracticeSetup {
  id: string;
  messageId: string;
  userId: string;
  recipientProfile: {
    name: string;
    relationship: string;
    personality: string;
    expectedReaction: string;
    communicationStyle: string[];
  };
  createdAt: Timestamp;
}

export interface PracticeSession {
  id: string;
  setupId: string;
  messageId: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }>;
  feedback?: {
    strengths: string[];
    improvements: string[];
    overallScore: number;
  };
  duration: number;
  completed: boolean;
  createdAt: Timestamp;
}