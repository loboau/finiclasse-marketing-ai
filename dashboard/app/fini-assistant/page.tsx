"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const FiniAssistantPage = () => {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      setChatHistory([...newHistory, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "Quais são os modelos AMG disponíveis?",
    "Qual a autonomia do novo EQA?",
    "Cria uma copy para um post de Instagram sobre o novo Classe C.",
    "Quais são as diferenças entre o GLC e o GLE?",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8 bg-gray-100 dark:bg-gray-900 h-full">
      <div className="lg:col-span-2 flex flex-col h-full">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Chat</CardTitle>
            <CardDescription>Converse com o Fini Assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="flex-grow overflow-y-auto mb-4 p-4 border rounded-md h-[60vh]">
              {chatHistory.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 my-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <Bot className="w-6 h-6 text-gray-500" />}
                  <div className={`p-3 rounded-lg max-w-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && <User className="w-6 h-6 text-gray-500" />}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 my-4 justify-start">
                  <Bot className="w-6 h-6 text-gray-500" />
                  <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse">
                    <p className="text-sm">...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pergunte qualquer coisa sobre a Mercedes-Benz..."
                className="flex-grow"
              />
              <Button onClick={() => handleSendMessage()} className="ml-2">
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Fini Assistant</CardTitle>
            <CardDescription>O seu especialista em Mercedes-Benz. Peça para criar copy, obter informações de modelos, ou qualquer outra coisa que precise.</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">Experimente perguntar:</h3>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <Button key={index} variant="outline" className="w-full text-left justify-start" onClick={() => handleSendMessage(example)}>
                  {example}
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
