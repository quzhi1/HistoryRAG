'use client';

import { useChat } from '@ai-sdk/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
  });

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <div className="font-bold">{m.role}</div>
              <p>
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <span className="italic font-light">
                    {'calling tool: ' + m?.toolInvocations?.[0].toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-2 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Ask a question about the historical text..."
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
} 