
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  COACH = 'COACH',
  SOCIAL = 'SOCIAL',
  MAPS = 'MAPS',
  SCOUT = 'SCOUT',
  CHAT = 'CHAT'
}

export type Language = 'en' | 'it';
export type Theme = 'light' | 'dark';

export interface UserStats {
  workouts: number;
  matches: number;
  chats: number;
}

export interface UserProfile {
  name: string;
  sport: string;
  level: string;
  avatar: string;
  stats: UserStats;
}

export interface MatchAd {
  id: string;
  creator: string;
  sport: string;
  location: string;
  time: string;
  needed: number;
}

export interface VenueInfo {
  name: string;
  id: string;
  lat: number;
  lng: number;
  type: string;
}

/**
 * Represents a physical exercise for the AI Coach.
 */
export interface Exercise {
  name: string;
  category: string;
}

/**
 * Represents a logged workout entry.
 */
export interface WorkoutLog {
  id: string;
  exercise: string;
  timestamp: number;
}
