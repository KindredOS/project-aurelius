import { useApiUrl } from './ApiConfig';
import { sendAIMessage } from './AiConfig';

const SomeComponent = () => {
  const [aiApiUrl] = useApiUrl("ai"); // Get AI API URL dynamically

  const handleSendMessage = async () => {
    const userInput = "Hello, AI!";
    const response = await sendAIMessage(aiApiUrl, userInput);
    console.log(response);
  };

  return (
    <button onClick={handleSendMessage}>
      Send AI Message
    </button>
  );
};

export default SomeComponent;
