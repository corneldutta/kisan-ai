import { createContext, ReactNode, useContext, useState } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isVoice?: boolean;
  audioUri?: string;
  imageUri?: string;
  transcription?: string;
  confidence?: number;
  analysis?: {
    disease?: string;
    severity?: string;
    treatment?: string;
  };
}

interface ConversationContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  getLastUserMessage: () => Message | null;
  getLastAIMessage: () => Message | null;
  getMessagesByType: (isVoice: boolean) => Message[];
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Kisan Mitra. I can help you with crop diseases, pest control, market prices, and government schemes. You can talk to me using voice or text, and I can analyze crop images too!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const addMessage = (message: Message) => {
    setMessages(prev => {
      // Check for duplicate messages (same id or very similar timestamp/text)
      const isDuplicate = prev.some(existingMsg => 
        existingMsg.id === message.id || 
        (Math.abs(existingMsg.timestamp.getTime() - message.timestamp.getTime()) < 1000 && 
         existingMsg.text === message.text && 
         existingMsg.isUser === message.isUser)
      );
      
      if (isDuplicate) {
        return prev;
      }
      
      return [...prev, message];
    });
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I am your Kisan Mitra. I can help you with crop diseases, pest control, market prices, and government schemes. You can talk to me using voice or text, and I can analyze crop images too!',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const getLastUserMessage = (): Message | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].isUser) {
        return messages[i];
      }
    }
    return null;
  };

  const getLastAIMessage = (): Message | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isUser) {
        return messages[i];
      }
    }
    return null;
  };

  const getMessagesByType = (isVoice: boolean): Message[] => {
    return messages.filter(msg => msg.isVoice === isVoice);
  };

  return (
    <ConversationContext.Provider value={{ 
      messages, 
      addMessage, 
      updateMessage,
      clearMessages,
      getLastUserMessage,
      getLastAIMessage,
      getMessagesByType
    }}>
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