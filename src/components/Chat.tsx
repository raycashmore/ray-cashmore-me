import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { useEffect, useRef, useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full sm:h-auto sm:gap-8">
      {/* Messages area - scrollable on mobile, static on desktop */}
      <div className="flex-1 overflow-y-auto sm:overflow-visible sm:flex-none flex flex-col gap-4 sm:gap-6 sm:min-h-[400px] pb-4 sm:pb-0">
        {messages.length === 0 && !isLoading && (
          <div className="text-muted text-sm">
            <p>Ask me anything about my experience, skills, or projects.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`pl-3 sm:pl-4 ${
              msg.role === 'user'
                ? 'border-l-2 border-foreground sm:w-3/5'
                : 'border-l border-border sm:w-4/5'
            }`}
          >
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-muted block mb-0.5 sm:mb-1">
              {msg.role === 'user' ? 'You' : 'Ray'}
            </span>
            <p className={`text-sm sm:text-base ${msg.role === 'user' ? 'text-foreground' : 'text-muted'}`}>
              {msg.parts
                .filter((part): part is { type: 'text'; content: string } => part.type === 'text')
                .map((part) => part.content)
                .join('')}
            </p>
          </div>
        ))}

        {isLoading && (
          <div className="border-l border-border pl-3 sm:pl-4 sm:w-4/5">
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-muted block mb-0.5 sm:mb-1">Ray</span>
            <p className="text-sm sm:text-base text-muted animate-pulse">Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form - fixed at bottom on mobile */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !isLoading) {
            void sendMessage(input);
            setInput('');
          }
        }}
        className="shrink-0 flex gap-3 sm:gap-4 pt-3 sm:pt-0 border-t border-border sm:border-t-0 bg-background sm:bg-transparent sm:flex-row"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent border-b border-border py-2 text-sm sm:text-base text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="uppercase tracking-widest text-[10px] sm:text-xs border border-foreground px-4 sm:px-6 py-2 text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
