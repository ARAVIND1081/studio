
'use client';

import React, { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';
import { getChatbotResponse, type ChatbotInput, type ChatMessage } from '@/ai/flows/chatbot-flow';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { cn } from '@/lib/utils';

interface DisplayMessage extends ChatMessage {
  id: string;
}

const productLinkRegex = /PRODUCT_LINK\[([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;

const renderBotMessage = (content: string) => {
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // Reset lastIndex for global regex
  productLinkRegex.lastIndex = 0;

  while ((match = productLinkRegex.exec(content)) !== null) {
    // Add text before the product link
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    // Add the product link component
    const [_fullMatch, productName, productId, priceString, imageUrl] = match;
    parts.push(
      <div key={`${productId}-${match.index}`} className="my-2.5"> 
        <Link href={`/products/${productId}`} passHref legacyBehavior>
          <a className="flex items-center gap-3 p-2.5 border border-border rounded-lg hover:bg-secondary/60 transition-colors shadow-sm bg-secondary/30">
            <div className="relative w-[50px] h-[50px] shrink-0">
              <Image 
                src={imageUrl} 
                alt={productName} 
                layout="fill"
                objectFit="cover"
                className="rounded bg-muted"
                data-ai-hint="product thumbnail"
              />
            </div>
            <div className="flex-grow min-w-0"> {/* Added min-w-0 for better truncation */}
              <div className="font-semibold text-primary hover:underline truncate">{productName}</div>
              <div className="text-sm text-muted-foreground">{priceString}</div>
            </div>
          </a>
        </Link>
      </div>
    );
    lastIndex = productLinkRegex.lastIndex;
  }
  // Add any remaining text after the last product link
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};


export function ChatWidget() {
  const { siteSettings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (isOpen && messages.length === 0 && !isLoading) {
      setIsLoading(true);
      setTimeout(async () => {
        try {
          const greetingInput: ChatbotInput = {
            userInput: "Hello", 
            chatHistory: [],
            siteName: siteSettings.siteName || "ShopSphere",
          };
          const response = await getChatbotResponse(greetingInput);
          setMessages([{ id: Date.now().toString(), role: 'bot', content: response.botResponse }]);
        } catch (error) {
          console.error("Error fetching initial greeting:", error);
          setMessages([{ id: Date.now().toString(), role: 'bot', content: "Hello! How can I help you today? (Error connecting)" }]);
        } finally {
          setIsLoading(false);
        }
      }, 200); 
    }
  }, [isOpen, siteSettings.siteName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const newUserMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyForAI = messages
        .filter(m => m.id !== newUserMessage.id) 
        .slice(-4) 
        .map(({ role, content }) => ({ role, content }));

      const input: ChatbotInput = {
        userInput: newUserMessage.content,
        chatHistory: historyForAI,
        siteName: siteSettings.siteName || "ShopSphere",
      };

      const response = await getChatbotResponse(input);
      const newBotMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.botResponse,
      };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      const errorBotMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <MessageSquare className="h-7 w-7" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 flex flex-col h-[70vh] max-h-[600px]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center text-primary">
              <Bot className="mr-2 h-6 w-6" /> {siteSettings.siteName} Assistant
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2 mb-3",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'bot' && (
                  <Avatar className="h-8 w-8 bg-accent text-accent-foreground self-start shrink-0">
                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-2 text-sm shadow", // Adjusted max-width
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  )}
                >
                  {msg.role === 'bot' ? renderBotMessage(msg.content) : msg.content}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground self-start shrink-0">
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && ( 
              <div className="flex items-end gap-2 mb-3 justify-start">
                <Avatar className="h-8 w-8 bg-accent text-accent-foreground self-start shrink-0">
                  <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-lg px-3 py-2 text-sm shadow bg-muted text-foreground rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <DialogFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-grow"
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="bg-primary hover:bg-accent hover:text-accent-foreground">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    