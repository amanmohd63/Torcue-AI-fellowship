import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: newMessages.filter(m => m.role !== 'error') })
      })

      if (!response.ok) {
        throw new Error("Server returned an error")
      }

      const data = await response.json()
      setMessages([...newMessages, { role: "assistant", content: data.reply }])
    } catch (error) {
      setMessages([...newMessages, { role: "error", content: "Failed to communicate with the server." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-container">
      <header>
        <h1>Order Assistant</h1>
        <p>Ask me about your e-commerce orders!</p>
      </header>

      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-bubble">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            <div className="message-bubble">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-area" onSubmit={sendMessage}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. What is the status of order ORD-1025?"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>Send</button>
      </form>
    </div>
  )
}

export default App
