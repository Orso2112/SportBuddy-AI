
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

export interface UserSport {
  sport: string;
  level: string;
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string; // Stored for simulation purposes
  selectedSports: UserSport[];
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

export interface Exercise {
  name: string;
  category: string;
}

export interface WorkoutLog {
  id: string;
  exercise: string;
  timestamp: number;
}
