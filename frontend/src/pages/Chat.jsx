import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, CircularProgress, Avatar, Switch, FormControlLabel, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BugReportIcon from '@mui/icons-material/BugReport';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axiosConfig';
import toast from 'react-hot-toast';

const Chat = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your expense assistant. You can ask me to record expenses like 'I spent $20 on lunch today' or ask questions like 'How much did I spend on food last week?'", 
      sender: 'assistant' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        console.log('Fetching chat history...', token);
        if (!token) {
          console.error('No authentication token available');
          setInitialLoading(false);
          return;
        }
        
        // Initialize welcome message
        try {
          await axios.post('/chat/init_message/');
          console.log('Welcome message initialized');
        } catch (initError) {
          console.error('Failed to initialize welcome message:', initError);
        }
        
        const response = await axios.get('/chat/history/');
        
        console.log('Chat history response:', response.data);
        
        if (response.data && response.data.length > 0) {
          // Transform data from API format to component format
          const formattedMessages = response.data.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.role
          }));
          
          console.log('Formatted messages:', formattedMessages);
          setMessages(formattedMessages);
        } else {
          console.log('No chat history found or empty response');
          // Set default welcome message if no history
          setMessages([{ 
            id: Date.now(), 
            text: "Hello! I'm your expense assistant. You can ask me to record expenses like 'I spent $20 on lunch today' or ask questions like 'How much did I spend on food last week?'", 
            sender: 'assistant' 
          }]);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
        }
        toast.error('Failed to load chat history');
        // Set default welcome message on error
        setMessages([{ 
          id: Date.now(), 
          text: "Hello! I'm your expense assistant. You can ask me to record expenses like 'I spent $20 on lunch today' or ask questions like 'How much did I spend on food last week?'", 
          sender: 'assistant' 
        }]);
      } finally {
        setInitialLoading(false);
      }
    };
    
    console.log('Auth token in useEffect:', token);
    if (token) {
      fetchChatHistory();
    } else {
      console.log('No token available, skipping chat history fetch');
      setInitialLoading(false);
    }
  }, [token]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDebug = async () => {
    try {
      const response = await axios.get('/chat/debug/');
      
      // Add debug info to chat
      const debugInfo = JSON.stringify(response.data, null, 2);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `Debug Info:\n${debugInfo}`, 
        sender: 'assistant' 
      }]);
      
      // Show toast with key status
      if (response.data.key_loaded) {
        toast.success('OpenAI API key is loaded');
      } else {
        toast.error('OpenAI API key is NOT loaded');
      }
    } catch (error) {
      console.error('Debug check failed:', error);
      toast.error('Failed to check API key status');
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your chat history? This action cannot be undone.')) {
      try {
        const response = await axios.post('/chat/clear_history/');
        
        // Reset messages to initial state
        setMessages([{ 
          id: Date.now(), 
          text: "Hello! I'm your expense assistant. You can ask me to record expenses like 'I spent $20 on lunch today' or ask questions like 'How much did I spend on food last week?'", 
          sender: 'assistant' 
        }]);
        
        toast.success('Chat history cleared successfully');
      } catch (error) {
        console.error('Failed to clear chat history:', error);
        toast.error('Failed to clear chat history');
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessageId = Date.now();
    setMessages(prev => [...prev, { id: userMessageId, text: input, sender: 'user' }]);
    
    // Clear input field
    setInput('');
    
    // Send to backend
    setLoading(true);
    try {
      // Choose endpoint based on test mode
      const endpoint = testMode ? 'test' : 'simple';
      
      console.log(`Sending message to ${endpoint} endpoint:`, input);
      
      const response = await axios.post(`/chat/${endpoint}/`, { message: input });

      console.log('Chat response:', response.data);

      // Add assistant's response
      const assistantMessageId = Date.now() + 1;
      setMessages(prev => [...prev, { 
        id: assistantMessageId, 
        text: response.data.message, 
        sender: 'assistant' 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // More informative error handling
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        
        // The server responded with a status code outside the 2xx range
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. This might be due to an issue with the OpenAI API. Please check the server logs.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication error. You might need to log in again.';
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      toast.error('Failed to send message. Please try again.');
      
      // Add error message
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: errorMessage,
        sender: 'assistant' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          AI Assistant
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            startIcon={<DeleteIcon />} 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={handleClearHistory}
            disabled={initialLoading}
          >
            Clear History
          </Button>
          <Button 
            startIcon={<BugReportIcon />} 
            variant="outlined" 
            color="secondary" 
            size="small"
            onClick={handleDebug}
          >
            Debug
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                color="primary"
              />
            }
            label="Test Mode"
          />
        </Box>
      </Box>
      
      {/* Chat messages */}
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          mb: 2, 
          overflow: 'auto',
          backgroundColor: '#f8f9fa',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="%23f0f0f0" /%3E%3C/svg%3E")',
          backgroundSize: '15px 15px'
        }}
      >
        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading chat history...</Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <Box 
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      mr: message.sender === 'user' ? 0 : 1,
                      ml: message.sender === 'user' ? 1 : 0,
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main'
                    }}
                  >
                    {message.sender === 'user' ? 'U' : 'AI'}
                  </Avatar>
                  <Paper 
                    elevation={1}
                    sx={{ 
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      border: message.sender === 'user' ? 'none' : '1px solid #e0e0e0'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '80%' }}>
                  <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>AI</Avatar>
                  <Paper 
                    elevation={1}
                    sx={{ 
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CircularProgress size={20} />
                    <Typography>Thinking...</Typography>
                  </Paper>
                </Box>
              </Box>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </Paper>
      
      {/* Input area */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask me about your expenses or add a new one..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          sx={{ mr: 1 }}
          disabled={initialLoading}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend} 
          disabled={loading || !input.trim() || initialLoading}
          sx={{ 
            p: '10px', 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat; 