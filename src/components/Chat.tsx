import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  });

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto p-4">
      <div className="flex flex-col gap-2 min-h-[300px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900 ml-auto'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {msg.parts
              .filter((part): part is { type: 'text'; content: string } => part.type === 'text')
              .map((part) => part.content)
              .join('')}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !isLoading) {
            void sendMessage(input);
            setInput('');
          }
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-2 border rounded-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
