// App.tsx
import AppName from './components/AppName';
import Button from './components/Button';
import Chat from './components/Chat';
import Groq from 'groq-sdk';
import Headings from './components/Headings';
import SearchBar from './components/SearchBar';
import { useState, useEffect } from 'react';

const groq = new Groq({
  apiKey: import.meta.env.VITE_REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface ChatMessage {
  prompt: string;
  response: string;
}

interface AppState {
  inputValue: string;
  chatMessages: ChatMessage[];
  isChatVisible: boolean;
  isHeadersVisible: boolean;
}

const App = () => {
  // Initialize state with an empty string
  const [state, setState] = useState<AppState>(() => {
    const localValue = localStorage.getItem('appState');
    if (localValue === null) {
      return {
        inputValue: '',
        chatMessages: [],
        isChatVisible: false,
        isHeadersVisible: true,
      };
    }
    return JSON.parse(localValue);
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Update state with the new input value
    setState((prevState) => ({
      ...prevState,
      inputValue: event.target.value,
    }));
  };

  // Check if the input value is empty or contains only whitespace
  const noChatPrompt = state.inputValue.trim() === '';

  // Send the prompt to the API
  const handleSend = async () => {
    if (noChatPrompt) return;

    const chatPrompt = `You: ${state.inputValue}`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: state.inputValue,
          },
        ],
        model: 'llama3-8b-8192',
      });3

      const responseContent =
        chatCompletion.choices[0]?.message?.content || 'No response';

      const newChatMessage: ChatMessage = {
        prompt: chatPrompt,
        response: responseContent,
      };

      // Append the new chat message to the array
      setState((prevState) => ({
        ...prevState,
        chatMessages: [...prevState.chatMessages, newChatMessage],
        isChatVisible: true,
        isHeadersVisible: false,
        inputValue: '',
      }));
    } catch (error) {
      console.error('Error fetching chat completion:', error);
      const errorMessage = 'Error fetching chat completion';
      const newChatMessage: ChatMessage = {
        prompt: chatPrompt,
        response: errorMessage,
      };
      // Append the error message to the array
      setState((prevState) => ({
        ...prevState,
        chatMessages: [...prevState.chatMessages, newChatMessage],
        isChatVisible: true,
        isHeadersVisible: false,
        inputValue: '',
      }));
    }
  };

  const handleClearChat = () => {
    // Clear the chat messages state
    setState((prevState) => ({
      ...prevState,
      chatMessages: [],
      isChatVisible: false,
      isHeadersVisible: true,
      inputValue: '',
    }));

    // Remove chat history from localStorage
    localStorage.removeItem('appState');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent the default action (newline)
      handleSend();
    }
  };

  return (
    <>
      <AppName>
        <div>
          <span>Luca's </span>ChatBot
        </div>
      </AppName>
      {state.isHeadersVisible && (
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
      )}
      {state.isChatVisible && (
        <div className="chat-container">
          <Chat>
            {/* Map over the chat messages to render each one */}
            {state.chatMessages.map((message, index) => (
              <div key={index} className="chatConversations">
                <div className="chat-prompt">{message.prompt}</div>
                <div className="chat-response">{message.response}</div>
              </div>
            ))}
            <Button textContent="Clear Chat" handleClick={handleClearChat} />
          </Chat>
        </div>
      )}
      <div className="searchBar-container">
        <SearchBar>
          <textarea
            className="search-input"
            placeholder="Enter your text"
            value={state.inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <Button
            textContent="Send"
            handleClick={handleSend}
            disabled={noChatPrompt}
          />
        </SearchBar>
      </div>
    </>
  );
};

export default App;