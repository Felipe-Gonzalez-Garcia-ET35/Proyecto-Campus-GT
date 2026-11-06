export type UserStatus = 'disponible' | 'ocupado' | 'offline';
export type BeepType = 'sonoro' | 'silencioso';

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  status: UserStatus;
  favorite_games: string[];
}

export interface Beep {
  id: string;
  sender_id: string;
  group_id: string;
  game_title: string;
  beep_type: BeepType;
  slots_total: number;
  slots_taken: number;
  created_at: string;
  expires_at: string;
}

export interface BeepResponse {
  id: string;
  beep_id: string;
  user_id: string;
  status: 'accepted' | 'declined';
  responded_at: string;
  profile?: Profile;
}
