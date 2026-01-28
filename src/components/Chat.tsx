import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Messages area */}
      <div className="flex flex-col gap-6 min-h-[400px]">
        {messages.length === 0 && !isLoading && (
          <div className="text-muted text-sm">
            <p className="uppercase tracking-widest text-xs mb-2">No messages yet</p>
            <p>Start a conversation by typing below.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`pl-4 ${
              msg.role === 'user'
                ? 'border-l-2 border-foreground sm:w-3/5'
                : 'border-l border-border sm:w-4/5'
            }`}
          >
            <span className="uppercase tracking-widest text-xs text-muted block mb-1">
              {msg.role === 'user' ? 'You' : 'Ray'}
            </span>
            <p className={msg.role === 'user' ? 'text-foreground' : 'text-muted'}>
              {msg.parts
                .filter((part): part is { type: 'text'; content: string } => part.type === 'text')
                .map((part) => part.content)
                .join('')}
            </p>
          </div>
        ))}

        {isLoading && (
          <div className="border-l border-border pl-4 sm:w-4/5">
            <span className="uppercase tracking-widest text-xs text-muted block mb-1">Ray</span>
            <p className="text-muted animate-pulse">Thinking...</p>
          </div>
        )}
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !isLoading) {
            void sendMessage(input);
            setInput('');
          }
        }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent border-b border-border py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="uppercase tracking-widest text-xs border border-foreground px-6 py-2 text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
