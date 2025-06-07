// Import necessary libraries
import React, { useState } from 'react';
import styles from './calculatorMath.module.css';

const CalculatorMath = () => {
    // State for managing user input and results
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);

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
        </div>
    );
};

export default CalculatorMath;
