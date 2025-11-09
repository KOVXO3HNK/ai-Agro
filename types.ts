
export type Page = 'advisor' | 'diagnostics' | 'weather' | 'nutrition' | 'economics';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
