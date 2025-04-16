// Type declarations for third-party modules

declare module 'react-hot-toast' {
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    loading: (message: string) => void;
    dismiss: () => void;
    warning: (message: string) => void;
  };
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
  }
  
  export const Heart: FC<IconProps>;
  export const Reply: FC<IconProps>;
  export const MessageSquare: FC<IconProps>;
  export const AlertCircle: FC<IconProps>;
  export const MessageCircle: FC<IconProps>;
  export const ThumbsUp: FC<IconProps>;
  export const Flag: FC<IconProps>;
  export const Edit: FC<IconProps>;
  export const Trash2: FC<IconProps>;
  // Additional icons can be added as needed
}

// Project-specific module declarations
declare module '@/utils/supabase/client' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient;
}

declare module '@/components/UserAvatar' {
  import { FC } from 'react';
  
  interface UserAvatarProps {
    user?: any;
    size?: number;
    className?: string;
  }
  
  const UserAvatar: FC<UserAvatarProps>;
  export default UserAvatar;
}

declare module '@/context/SupabaseContext' {
  import { FC, ReactNode } from 'react';
  import { SupabaseClient, User, Session } from '@supabase/supabase-js';
  
  export const useSupabase: () => {
    supabase: SupabaseClient;
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    signOut: () => Promise<{ success: boolean; error?: string }>;
  };
  
  export const SupabaseProvider: FC<{ children: ReactNode }>;
} 