"use client";
import { useState, useEffect } from "react";
import axios from "axios";

// ollama api url
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function sendMessage(messages) {
  try {
    const response = await axios.post(
      `${API_URL}/api/generate`,
      {
        model: "llama3.2:3b",
        prompt: messages.prompt,
        temperature: 0.7,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data.response;
    } else {
      throw new Error("Ollama API error");
    }
  } catch (error) {
    // console.error("Error sending message:", error);
    throw error;
  }
}
export default function Home() {
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem("messages");
    return storedMessages ? JSON.parse(storedMessages) : [];
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessage = { text: input, sender: "user" };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      const prompt = updatedMessages.map((msg) => msg.text).join(" ");
      const generatedResponse = await sendMessage({ prompt, model: "llama3.2:3b", temperature: 0.7 });

      setMessages([...updatedMessages, { text: generatedResponse, sender: "ollama" }]);
    } catch (error) {
      // console.error("Error sending message:", error);
      setMessages([...updatedMessages, { text: "Failed to communicate with Ollama", sender: "ollama" }]);
    }

    setInput("");
  };

  const handleClearMessages = () => {
    setMessages([]);
    localStorage.removeItem("messages");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Chat with Ollama</h1>
      <div style={{ height: "400px", overflowY: "scroll", marginBottom: "20px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: "10px 0" }}>
            <strong>{msg.sender === "user" ? "You" : "Ollama"}:</strong>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} style={{ width: "100%", padding: "10px" }} />
        <button type="submit" style={{ padding: "10px 20px", marginTop: "10px" }}>
          Send
        </button>
        <button type="button" onClick={handleClearMessages} style={{ padding: "10px 20px", marginLeft: "10px", backgroundColor: "white", color: "black", borderRadius: "3px" }}>
          Clear Chat
        </button>
      </form>
    </div>
  );
}
