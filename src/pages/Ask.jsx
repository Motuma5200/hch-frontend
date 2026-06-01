import React, { useState, useRef, useEffect } from "react";

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setQuestion("");

    try {
      const res = await fetch("http://127.0.0.1:8080/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "No response received" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Sorry, I couldn't connect to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
        paddingTop: "60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1e3a8a", 
          color: "white",
          padding: "1rem 1.5rem",
          fontSize: "1.5rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <span>🩺</span>
        <div>AI - Medical Assistant</div>
      </div>

      {/* Important Disclaimer */}
      <div
        style={{
          backgroundColor: "#fef3c7",
          borderLeft: "5px solid #f59e0b",
          padding: "12px 20px",
          fontSize: "0.95rem",
          color: "#92400e",
          flexShrink: 0,
        }}
      >
        <strong>⚠️ Important Disclaimer:</strong> This AI is for informational purposes only. 
        It is not a substitute for professional medical advice, diagnosis, or treatment. 
        Always consult a qualified healthcare provider for medical concerns.
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        {messages.length === 0 && !loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🩺</div>
            <h3>Welcome to Medical AI</h3>
            <p>Ask me anything about health, symptoms, or medical information.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "75%",
            }}
          >
            <div
              style={{
                backgroundColor: msg.role === "user" ? "#1e40af" : "#ffffff",
                color: msg.role === "user" ? "white" : "#1f2937",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "14px 18px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                lineHeight: "1.5",
                border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: "white",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 18px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              color: "#64748b",
              border: "1px solid #e2e8f0",
            }}
          >
            🧠 AI is thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "1.2rem 1.5rem",
          backgroundColor: "white",
          borderTop: "1px solid #e2e8f0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your medical question here..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px 18px",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              fontSize: "1.02rem",
              outline: "none",
              transition: "border 0.2s",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !question.trim()}
            style={{
              padding: "0 28px",
              backgroundColor: "#1e40af",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: loading || !question.trim() ? "not-allowed" : "pointer",
              opacity: loading || !question.trim() ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}