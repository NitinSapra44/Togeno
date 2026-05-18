import { create } from 'zustand';
import { 
  getJoinedCommunities, 
  joinCommunity as apiJoinCommunity, 
  leaveCommunity as apiLeaveCommunity 
} from '@/services/communities.service';

interface CommunityState {
  joinedCommunities: string[]; // Array of community IDs
  isLoading: boolean;
  joiningIds: string[]; // IDs of communities currently being joined
  hasFetched: boolean;
  error: string | null;

  fetchJoinedCommunities: (force?: boolean) => Promise<void>;
  joinCommunity: (id: string) => Promise<void>;
  leaveCommunity: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  joinedCommunities: [],
  isLoading: false,
  joiningIds: [],
  hasFetched: false,
  error: null,

  fetchJoinedCommunities: async (force = false) => {
    // Only fetch once unless forced
    if (get().hasFetched && !force) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await getJoinedCommunities({ limit: 100 });
      // The backend returns { membership: ..., community: ... }
      const ids = response.data
        .filter(item => item.community !== null)
        .map(item => item.community!.id);
      
      set({ joinedCommunities: ids, isLoading: false, hasFetched: true });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch joined communities',
        isLoading: false 
      });
    }
  },

  joinCommunity: async (id: string) => {
    const previousJoined = get().joinedCommunities;
    
    // Optimistic Update
    set((state) => ({ 
      joinedCommunities: Array.from(new Set([...state.joinedCommunities, id])),
      joiningIds: [...state.joiningIds, id],
      error: null 
    }));

    try {
      await apiJoinCommunity(id, false);
      
      set((state) => ({
        joiningIds: state.joiningIds.filter(jid => jid !== id)
      }));
    } catch (err) {
      // Revert on error
      set((state) => ({
        joinedCommunities: previousJoined,
        joiningIds: state.joiningIds.filter(jid => jid !== id),
        error: err instanceof Error ? err.message : 'Failed to join community'
      }));
      throw err;
    }
  },

  leaveCommunity: async (id: string) => {
    const previousJoined = get().joinedCommunities;

    // Optimistic Update
    set((state) => ({ 
      joinedCommunities: state.joinedCommunities.filter(communityId => communityId !== id),
      joiningIds: [...state.joiningIds, id],
      error: null 
    }));

    try {
      await apiLeaveCommunity(id);
      
      set((state) => ({
        joiningIds: state.joiningIds.filter(jid => jid !== id)
      }));
    } catch (err) {
      // Revert on error
      set((state) => ({
        joinedCommunities: previousJoined,
        joiningIds: state.joiningIds.filter(jid => jid !== id),
        error: err instanceof Error ? err.message : 'Failed to leave community'
      }));
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));
