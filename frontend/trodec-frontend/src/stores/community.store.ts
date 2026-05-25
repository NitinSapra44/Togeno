import { create } from 'zustand';
import {
  getJoinedCommunities,
  Community,
  joinCommunity as apiJoinCommunity,
  leaveCommunity as apiLeaveCommunity
} from '@/services/communities.service';

interface CommunityState {
  joinedCommunities: string[]; // Array of community IDs
  joinedCommunityObjects: Community[]; // Full community objects for "My Communities" tab
  isLoading: boolean;
  joiningIds: string[]; // IDs of communities currently being joined
  hasFetched: boolean;
  error: string | null;

  fetchJoinedCommunities: (force?: boolean) => Promise<void>;
  joinCommunity: (id: string, communityObj?: Community) => Promise<void>;
  leaveCommunity: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  joinedCommunities: [],
  joinedCommunityObjects: [],
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
      const items = response.data.filter(item => item.community !== null);
      const ids = items.map(item => item.community!.id);
      const objects = items.map(item => item.community!);

      set({ joinedCommunities: ids, joinedCommunityObjects: objects, isLoading: false, hasFetched: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch joined communities',
        isLoading: false
      });
    }
  },

  joinCommunity: async (id: string, communityObj?: Community) => {
    const previousJoined = get().joinedCommunities;
    const previousObjects = get().joinedCommunityObjects;

    // Optimistic Update
    set((state) => ({
      joinedCommunities: Array.from(new Set([...state.joinedCommunities, id])),
      joinedCommunityObjects: communityObj
        ? Array.from(new Map([...state.joinedCommunityObjects, communityObj].map(c => [c.id, c])).values())
        : state.joinedCommunityObjects,
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
        joinedCommunityObjects: previousObjects,
        joiningIds: state.joiningIds.filter(jid => jid !== id),
        error: err instanceof Error ? err.message : 'Failed to join community'
      }));
      throw err;
    }
  },

  leaveCommunity: async (id: string) => {
    const previousJoined = get().joinedCommunities;
    const previousObjects = get().joinedCommunityObjects;

    // Optimistic Update
    set((state) => ({
      joinedCommunities: state.joinedCommunities.filter(communityId => communityId !== id),
      joinedCommunityObjects: state.joinedCommunityObjects.filter(c => c.id !== id),
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
        joinedCommunityObjects: previousObjects,
        joiningIds: state.joiningIds.filter(jid => jid !== id),
        error: err instanceof Error ? err.message : 'Failed to leave community'
      }));
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));
