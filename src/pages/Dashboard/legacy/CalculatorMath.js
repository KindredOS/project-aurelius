// Import necessary libraries
import React, { useState } from 'react';
import styles from './calculatorMath.module.css';
import { HfInference } from '@huggingface/inference';

const client = new HfInference("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");

const CalculatorMath = () => {
    // State for managing user input and results
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);
    const [chatInput, setChatInput] = useState("");
    const [currentChat, setCurrentChat] = useState({ prompt: "", response: "" });
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Function to handle button input
    const handleButtonClick = (value) => {
        setInput((prev) => prev + value);
    };

    // Function to handle evaluation
    const evaluateResult = () => {
        try {
            const evaluatedResult = eval(input); // Evaluate the input string
            setResult(evaluatedResult);
        } catch (error) {
            setResult("Error");
        }
    };

    // Function to clear the input and result
    const clearAll = () => {
        setInput("");
        setResult(null);
    };

    // Function to handle AI chat submission
    const handleChatSubmit = async () => {
        if (chatInput.trim() === "") return;

        setCurrentChat({ prompt: chatInput, response: "" });

        try {
            setIsAnalyzing(true);
            let out = "";
            const stream = client.chatCompletionStream({
                model: "NousResearch/Hermes-3-Llama-3.1-8B",
                messages: [{ role: "user", content: chatInput }],
                temperature: 0.5,
                max_tokens: 2048,
                top_p: 0.7,
            });

            for await (const chunk of stream) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const newContent = chunk.choices[0].delta.content;
                    out += newContent;
                    setCurrentChat((prev) => ({ ...prev, response: out }));
                }
            }
        } catch (error) {
            console.error("Error fetching AI response:", error.message || error);
            setCurrentChat((prev) => ({ ...prev, response: "Error: Unable to fetch response." }));
        } finally {
            setIsAnalyzing(false);
        }

        setChatInput("");
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>CalculatorMath</h1>

            {/* Display Section */}
            <div className={styles.displaySection}>
                <input
                    type="text"
                    value={input}
                    readOnly
                    className={styles.inputField}
                />
                {result !== null && (
                    <div className={styles.result}>
                        <strong>Result:</strong> {result}
                    </div>
                )}
            </div>

            {/* Button Grid */}
            <div className={styles.buttonGrid}>
                {["7", "8", "9", "/"].map((btn) => (
                    <button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className={styles.button}
                    >
                        {btn}
                    </button>
                ))}
                {["4", "5", "6", "*"].map((btn) => (
                    <button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className={styles.button}
                    >
                        {btn}
                    </button>
                ))}
                {["1", "2", "3", "-"].map((btn) => (
                    <button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className={styles.button}
                    >
                        {btn}
                    </button>
                ))}
                {["0", ".", "=", "+"].map((btn) => (
                    <button
                        key={btn}
                        onClick={btn === "=" ? evaluateResult : () => handleButtonClick(btn)}
                        className={styles.button}
                    >
                        {btn}
                    </button>
                ))}
                <button
                    onClick={clearAll}
                    className={`${styles.button} ${styles.clearButton}`}
                >
                    Clear
                </button>
            </div>

            {/* Chat Section */}
            <div className={styles.chatSection}>
                <h2>Chat with AI</h2>
                <div className={styles.chatMessage}>
                    <div><strong>Prompt:</strong> {currentChat.prompt}</div>
                    <div><strong>Response:</strong> {currentChat.response}</div>
                </div>
                <div className={styles.chatInputSection}>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a question..."
                        className={styles.inputField}
                    />
                    <button
                        onClick={handleChatSubmit}
                        className={styles.button}
                        disabled={isAnalyzing}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculatorMath;
