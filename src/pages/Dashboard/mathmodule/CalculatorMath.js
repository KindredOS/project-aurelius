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

    // Function to evaluate mathematical expression (safe, no eval)
    const evaluateResult = () => {
        try {
            const tokens = tokenize(input);
            const rpn = toRPN(tokens);
            const resultValue = evaluateRPN(rpn);
            setResult(resultValue);
        } catch (error) {
            setResult("Error");
        }
    };

    // Tokenize input into numbers and operators
    const tokenize = (expression) => {
        const regex = /\d+(\.\d+)?|[+\-*/()]|\s+/g;
        const tokens = expression.match(regex).filter(t => !/\s+/.test(t));
        return tokens;
    };

    // Convert tokens to Reverse Polish Notation using Shunting Yard algorithm
    const toRPN = (tokens) => {
        const output = [];
        const ops = [];
        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

        tokens.forEach(token => {
            if (!isNaN(token)) {
                output.push(token);
            } else if ('+-*/'.includes(token)) {
                while (
                    ops.length &&
                    '*/+-'.includes(ops[ops.length - 1]) &&
                    precedence[ops[ops.length - 1]] >= precedence[token]
                ) {
                    output.push(ops.pop());
                }
                ops.push(token);
            } else if (token === '(') {
                ops.push(token);
            } else if (token === ')') {
                while (ops.length && ops[ops.length - 1] !== '(') {
                    output.push(ops.pop());
                }
                if (ops.length === 0) throw new Error("Mismatched parentheses");
                ops.pop(); // Remove '('
            }
        });

        while (ops.length) {
            const op = ops.pop();
            if (op === '(' || op === ')') throw new Error("Mismatched parentheses");
            output.push(op);
        }

        return output;
    };

    // Evaluate the RPN expression
    const evaluateRPN = (tokens) => {
        const stack = [];

        tokens.forEach(token => {
            if (!isNaN(token)) {
                stack.push(parseFloat(token));
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (token) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/': stack.push(a / b); break;
                    default: throw new Error("Invalid operator");
                }
            }
        });

        if (stack.length !== 1) throw new Error("Invalid expression");
        return stack[0];
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
