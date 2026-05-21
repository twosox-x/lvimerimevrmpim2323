import { creators } from './creators';

export const streams = creators
  .filter(c => c.isLive)
  .map(c => ({
    id: `stream_${c.id}`,
    creatorId: c.id,
    creator: c,
    title: c.streamTitle,
    category: c.category,
    viewers: c.viewers,
    thumbnail: `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450` // generic gaming/stream placeholder
  }));
