import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Topic, TopicHistory, FavoriteTopic } from './types';

// History store - keeps last 10 generated topics
function createHistoryStore() {
  const { subscribe, set, update } = writable<TopicHistory[]>([]);

  return {
    subscribe,
    add: (topic: Topic) => {
      update(history => {
        const newEntry: TopicHistory = { topic, timestamp: Date.now() };
        // Keep only last 10, remove duplicates of same topic
        const filtered = history.filter(h => h.topic.id !== topic.id);
        return [newEntry, ...filtered].slice(0, 10);
      });
    },
    clear: () => set([]),
    init: (data: TopicHistory[]) => set(data)
  };
}

export const history = createHistoryStore();

// Favorites store
function createFavoritesStore() {
  const { subscribe, set, update } = writable<FavoriteTopic[]>([]);

  return {
    subscribe,
    add: (topic: Topic) => {
      update(favorites => {
        if (favorites.some(f => f.id === topic.id)) return favorites;
        const favorite: FavoriteTopic = { ...topic, addedAt: Date.now() };
        return [...favorites, favorite].sort((a, b) => a.title.localeCompare(b.title));
      });
    },
    remove: (topicId: string) => {
      update(favorites => favorites.filter(f => f.id !== topicId));
    },
    toggle: (topic: Topic) => {
      update(favorites => {
        const exists = favorites.some(f => f.id === topic.id);
        if (exists) {
          return favorites.filter(f => f.id !== topic.id);
        } else {
          const favorite: FavoriteTopic = { ...topic, addedAt: Date.now() };
          return [...favorites, favorite].sort((a, b) => a.title.localeCompare(b.title));
        }
      });
    },
    clear: () => set([]),
    init: (data: FavoriteTopic[]) => set(data)
  };
}

export const favorites = createFavoritesStore();

// Load from localStorage on client
export function loadFromStorage() {
  if (!browser) return;
  
  try {
    const historyData = localStorage.getItem('aa-topic-history');
    const favoritesData = localStorage.getItem('aa-topic-favorites');
    
    if (historyData) {
      history.init(JSON.parse(historyData));
    }
    if (favoritesData) {
      favorites.init(JSON.parse(favoritesData));
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
  }
}

// Save to localStorage
export function saveToStorage(historyData: TopicHistory[], favoritesData: FavoriteTopic[]) {
  if (!browser) return;
  
  try {
    localStorage.setItem('aa-topic-history', JSON.stringify(historyData));
    localStorage.setItem('aa-topic-favorites', JSON.stringify(favoritesData));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}
