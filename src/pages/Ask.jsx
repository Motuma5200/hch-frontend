import React, { useState } from "react";

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      console.error(err);
      setResponse("❌ Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow w-75" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">💬 Chat with Medical AI</h3>
        </div>

        {/* Chat body */}
        <div
          className="card-body"
          style={{ height: "60vh", overflowY: "auto", backgroundColor: "#f8f9fa" }}
        >
          {loading && (
            <p className="text-muted">⏳ Thinking… please wait</p>
          )}
          {!loading && response && (
            <div className="p-3 bg-secondary text-white rounded">
              {response}
            </div>
          )}
          {!loading && !response && (
            <p className="text-muted text-center">
              Welcome! Type your health question below.
            </p>
          )}
        </div>

        {/* Input area */}
        <div className="card-footer">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Write what you feel here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="btn btn-primary" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
