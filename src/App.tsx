import { useState, useRef, useEffect } from 'react';
import { synth } from './synth/synth-sai';
import { logger } from './synth/logger';
import './App.css';

interface Message {
  id: string;
  role: 'user' | 'synth';
  content: string;
  timestamp: number;
  modules?: string[];
  confidence?: number;
  processingTime?: number;
}

interface LogEntry {
  timestamp: number;
  level: string;
  module: string;
  message: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showLogs) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  // Update logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const recentLogs = logger.getLogs(100);
      setLogs(recentLogs.map(l => ({
        timestamp: l.timestamp,
        level: l.level,
        module: l.module,
        message: l.message
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await synth.process(input, 'user');

      const synthMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'synth',
        content: response.output,
        timestamp: Date.now(),
        modules: response.modulesUsed,
        confidence: response.confidence,
        processingTime: response.processingTime
      };

      setMessages(prev => [...prev, synthMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'synth',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exportConversation = () => {
    const conversation = logger.exportConversations();
    downloadFile(conversation, 'synth-conversation.md');
  };

  const exportCode = (content: string, filename: string = 'synth-output') => {
    downloadFile(content, `${filename}.txt`);
  };

  const exportLogs = () => {
    const logs = logger.exportLogs();
    downloadFile(logs, 'synth-logs.md');
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setMessages([]);
    logger.clearConversations();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🧠 Synth SAI</h1>
          <p>Synthetic Artificial Intelligence | 39 Modules | All Wired to Real APIs</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowLogs(!showLogs)} className="btn-secondary">
            {showLogs ? '💬 Chat' : '📊 Logs'}
          </button>
          <button onClick={exportConversation} className="btn-secondary">
            💾 Export Chat
          </button>
          <button onClick={exportLogs} className="btn-secondary">
            📄 Export Logs
          </button>
          <button onClick={clearChat} className="btn-danger">
            🗑️ Clear
          </button>
        </div>
      </header>

      <main className="main">
        {!showLogs ? (
          <div className="chat-container">
            <div className="chat-panel">
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <h2>Welcome to Synth SAI</h2>
                    <p>Start a conversation to see the 16 modules in action.</p>
                    <div className="example-prompts">
                      <button onClick={() => setInput('What is the latest news today?')}>
                        📰 Latest news
                      </button>
                      <button onClick={() => setInput('Track flights over the US')}>
                        ✈️ Track flights
                      </button>
                      <button onClick={() => setInput('What earthquakes happened recently?')}>
                        🌍 Recent earthquakes
                      </button>
                      <button onClick={() => setInput('What is quantum computing?')}>
                        🧠 Knowledge query
                      </button>
                      <button onClick={() => setInput('Build a calculator website')}>
                        💻 Generate code
                      </button>
                      <button onClick={() => setInput('Hello, how are you?')}>
                        👋 Say hello
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`message ${msg.role}`}>
                        <div className="message-header">
                          <span className="message-role">
                            {msg.role === 'user' ? '👤 You' : '🧠 Synth'}
                          </span>
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="message-content">
                          {msg.content.includes('<div') ? (
                            <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                          ) : (
                            <pre>{msg.content}</pre>
                          )}
                        </div>
                        {msg.role === 'synth' && msg.modules && (
                          <div className="message-meta">
                            <div className="meta-item">
                              <strong>Modules:</strong> {msg.modules.length}
                            </div>
                            <div className="meta-item">
                              <strong>Confidence:</strong> {((msg.confidence || 0) * 100).toFixed(1)}%
                            </div>
                            <div className="meta-item">
                              <strong>Time:</strong> {(msg.processingTime || 0).toFixed(2)}ms
                            </div>
                            <button
                              onClick={() => exportCode(msg.content, 'synth-response')}
                              className="btn-small"
                            >
                              📥 Export
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="message synth loading">
                        <div className="message-header">
                          <span className="message-role">🧠 Synth</span>
                        </div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="chat-input-container">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  disabled={isLoading}
                  rows={3}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="btn-primary"
                >
                  {isLoading ? 'Processing...' : 'Send 🚀'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="logs-container">
            <div className="logs-header">
              <h2>System Logs</h2>
              <div className="logs-stats">
                <span>Total: {logs.length}</span>
                <span>Errors: {logs.filter(l => l.level === 'error').length}</span>
                <span>Warnings: {logs.filter(l => l.level === 'warning').length}</span>
              </div>
            </div>
            <div className="logs-content">
              {logs.length === 0 ? (
                <div className="empty-state">
                  <p>No logs yet. Start a conversation to see system activity.</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={`log-entry ${log.level}`}>
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`log-level ${log.level}`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="log-module">[{log.module}]</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
