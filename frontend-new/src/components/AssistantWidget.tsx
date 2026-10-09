"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: string;
  content: string;
}

const AssistantWidget = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: newMessages.filter(m => m.role !== 'error') })
      });

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: "error", content: "Failed to communicate with the server. Is it running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] w-full col-span-full xl:col-span-1 shadow-sm border-primary/20 bg-background">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          Order Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about revenue, cancelled orders, or top customers.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full w-full p-4">
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-10">
                Hi! Try asking: "What was the total revenue in August?"
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-3 text-sm max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "flex size-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"
                )}>
                  {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                
                <div className={cn(
                  "rounded-lg px-4 py-3 shadow-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : 
                  msg.role === "error" ? "bg-destructive text-destructive-foreground" : "bg-muted"
                )}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start gap-3 text-sm max-w-[80%] mr-auto">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border shadow-sm bg-muted border-border">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-lg px-4 py-3 shadow-sm bg-muted flex items-center gap-1">
                  <div className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-muted/10">
        <form onSubmit={sendMessage} className="flex w-full items-center space-x-2">
          <Input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AssistantWidget;
