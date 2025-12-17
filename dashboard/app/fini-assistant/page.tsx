"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, User, Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const FiniAssistantPage = () => {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (message?: string) => {
    const currentMessage = message || prompt;
    if (!currentMessage.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: currentMessage }];
    setChatHistory(newHistory);
    if (!message) {
      setPrompt('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/fini-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the assistant.');
      }

      const data = await response.json();
      setChatHistory([...newHistory, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error(error);
      setChatHistory([...newHistory, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Por favor tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "Quais modelos AMG estão disponíveis?",
    "Qual a autonomia do EQA?",
    "Cria copy para Instagram do Classe C",
    "Diferenças entre GLC e GLE?",
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 border-b border-border">
            <CardTitle>Chat</CardTitle>
            <CardDescription>Converse com o Fini Assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatHistory.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Comece uma conversa...</p>
                </div>
              )}
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amg/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-amg" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg break-words ${
                      message.role === 'user'
                        ? 'bg-amg text-white'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amg/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-amg" />
                  </div>
                  <div className="p-3 rounded-lg bg-secondary animate-pulse">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Pergunte algo sobre Mercedes-Benz..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !prompt.trim()}
                  className="bg-amg hover:bg-amg-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amg/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-amg" />
              </div>
              <div>
                <CardTitle>Fini Assistant</CardTitle>
              </div>
            </div>
            <CardDescription className="mt-2">
              O seu especialista em Mercedes-Benz. Peça para criar copy, obter informações de modelos, ou qualquer outra coisa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Experimente perguntar:</h3>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto py-2 px-3 text-sm whitespace-normal"
                  onClick={() => handleSendMessage(example)}
                  disabled={isLoading}
                >
                  <span className="line-clamp-2">{example}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FiniAssistantPage;
