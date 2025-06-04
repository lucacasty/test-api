// App.tsx
import AppName from '/AppName';
import Chat from '/Chat';
import Headings from '/Headings';
import SearchBar from '/SearchBar';
import Button from '/Button';
import { useState } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface ChatMessage {
  prompt: string;
  response: string;
}

const App = () => {
  // State to manage the input value
  const [inputValue, setInputValue] = useState('');
  // State to manage chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Function to handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  // Function to handle button click
  const handleSend = async () => {
    if (inputValue.trim() === '') return;

    const chatPrompt = `You: ${inputValue}`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: inputValue,
          },
        ],
        model: 'llama3-8b-8192',
      });

      const responseContent =
        chatCompletion.choices[0]?.message?.content || 'No response';

      const newChatMessage: ChatMessage = {
        prompt: chatPrompt,
        response: responseContent,
      };

      // Add the new chat message to the chat messages
      setChatMessages([...chatMessages, newChatMessage]);
    } catch (error) {
      console.error('Error fetching chat completion:', error);
      const errorMessage = 'Error fetching chat completion';
      const newChatMessage: ChatMessage = {
        prompt: chatPrompt,
        response: errorMessage,
      };
      // Add the error message to the chat messages
      setChatMessages([...chatMessages, newChatMessage]);
    } finally {
      // Clear the input field
      setInputValue('');
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent the default action (newline)
      handleSend();
    }
  }

  return (
    <>
      <AppName>
        <div>
          <span>Grëg's </span>ChatBot
        </div>
      </AppName>
      <div>
        <Headings>
          <div>
            <h1>Hi, Welcome.</h1>
          </div>
          <div>
            <h3>How can I help you today?</h3>
          </div>
        </Headings>
      </div>
      <div className="chat-container">
        <Chat>
        {/* Render chat messages */}
        {chatMessages.map((message, index) => (
          <div key={index} className="chat-message">
            <div className="chat-prompt">{message.prompt}</div>
            <div className="chat-response">{message.response}</div>
          </div>
        ))}
        </Chat>
      </div>
      <div className="searchBar-container">
        <SearchBar>
          <textarea
            className="search-input"
            placeholder="Enter your text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <Button textContent="Send" handleClick={handleSend} />
        </SearchBar>
      </div>
    </>
)};

export default App;