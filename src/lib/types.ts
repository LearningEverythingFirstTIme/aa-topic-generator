export interface Topic {
  id: string;
  category: string;
  title: string;
  description: string;
}

export interface TopicHistory {
  topic: Topic;
  timestamp: number;
}

export interface FavoriteTopic extends Topic {
  addedAt: number;
}
