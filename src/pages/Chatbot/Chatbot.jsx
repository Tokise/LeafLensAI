import Header from '../../components/header/Header';
import '../../css/Chatbot.css';

const Chatbot = () => {
  return (
    <div className="chatbot-container">
      <Header />
      <h1>Plant Expert Chat</h1>
      <div className="chat-interface">
        <div className="chat-messages">
          <div className="message bot">
            Hello! I'm your plant care expert. How can I help you today?
          </div>
        </div>
        <div className="chat-input">
          <input 
            type="text" 
            placeholder="Ask me anything about plants..."
            disabled
          />
          <button disabled>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
