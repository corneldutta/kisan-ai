import { createContext, ReactNode, useContext, useState } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isVoice?: boolean;
  imageUri?: string;
  audioUri?: string;
}

interface ConversationContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Kisan Mitra. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I am your Kisan Mitra. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <ConversationContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
} 