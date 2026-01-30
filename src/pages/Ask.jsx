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
        { role: "assistant", content: "❌ Error connecting to the server." },
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
        backgroundColor: "#f0f2f5",
        paddingTop: "60px",           // ← adjust this value according to your navbar height
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#0d6efd",
          color: "white",
          padding: "1rem",
          fontSize: "1.4rem",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        💬 Chat with Medical AI
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {messages.length === 0 && !loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              fontSize: "1.1rem",
              textAlign: "center",
            }}
          >
            Welcome! Ask any health-related question below.
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                backgroundColor:
                  msg.role === "user" ? "#0d6efd" : "white",
                color: msg.role === "user" ? "white" : "#212529",
                borderRadius: "12px",
                padding: "0.9rem 1.2rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                lineHeight: "1.45",
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
              borderRadius: "12px",
              padding: "0.9rem 1.2rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              color: "#6c757d",
            }}
          >
            ⏳ Thinking…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area – centered and limited width */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "white",
          borderTop: "1px solid #dee2e6",
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            width: "100%",
            maxWidth: "720px",           // ← this is the main control value
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
            placeholder="Ask your medical question..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.8rem 1rem",
              border: "1px solid #ced4da",
              borderRadius: "8px",
              fontSize: "1rem",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !question.trim()}
            style={{
              padding: "0.8rem 1.6rem",
              backgroundColor: "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "500",
              cursor: loading || !question.trim() ? "not-allowed" : "pointer",
              opacity: loading || !question.trim() ? 0.6 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}