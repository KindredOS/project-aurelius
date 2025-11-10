import React, { useState } from 'react';
import { HfInference } from "@huggingface/inference";

const client = new HfInference("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");

function CourseChat({ chatVisible, toggleChat }) {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleChat = async () => {
    if (!userMessage.trim()) return;

    const newMessage = { role: "user", content: userMessage };
    setChatHistory((prev) => [...prev, newMessage]);
    setUserMessage("");
    setLoading(true);

    try {
      let assistantMessage = "";

      // Limit history to the last 5 messages
      const limitedHistory = [...chatHistory, newMessage].slice(-5);

      const stream = client.chatCompletionStream({
        model: "NousResearch/Hermes-3-Llama-3.1-8B",
        messages: limitedHistory,
        temperature: 0.5,
        max_tokens: 2048,
        top_p: 0.7,
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          assistantMessage += chunk.choices[0].delta.content;
        }
      }

      setChatHistory((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("Error during chat streaming:", error);
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '15px',
          borderRadius: '50%',
          backgroundColor: '#007BFF',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          width: '60px',
          height: '60px',
          transition: 'transform 0.3s ease',
        }}
      >
        💬
      </button>

      {chatVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: expanded ? '20px' : '80px',
            right: '20px',
            width: expanded ? '500px' : '300px',
            height: expanded ? '600px' : 'auto',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxHeight: expanded ? 'none' : '400px',
            overflowY: 'auto',
            transition: 'all 0.3s ease',
          }}
        >
          <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Chat
            <button
              onClick={toggleExpand}
              style={{
                background: 'none',
                border: 'none',
                color: '#007BFF',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          </h4>
          <div
            style={{
              maxHeight: expanded ? '500px' : '300px',
              overflowY: 'auto',
              marginBottom: '10px',
              padding: '5px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: '#f9f9f9',
            }}
          >
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '5px' }}>
                <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your message here..."
            style={{ width: '100%', height: '60px', marginBottom: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
          ></textarea>
          <button
            onClick={handleChat}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
    </>
  );
}

export default CourseChat;
