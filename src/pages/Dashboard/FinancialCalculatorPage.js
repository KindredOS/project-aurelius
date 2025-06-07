// Import necessary libraries
import React, { useState } from 'react';

const SavingsPlanner = () => {
    const [goal, setGoal] = useState(0);
    const [monthlyContribution, setMonthlyContribution] = useState(0);
    const [interestRate, setInterestRate] = useState(0);
    const [result, setResult] = useState('');

    const calculateSavings = () => {
        if (goal > 0 && monthlyContribution > 0) {
            const months = Math.ceil(goal / monthlyContribution);
            setResult(`It will take ${months} months to reach your goal.`);
        } else {
            setResult('Please enter valid values for goal and contribution.');
        }
    };

    return (
        <div>
            <h2>Savings Planner</h2>
            <p>Set a savings goal and track your progress over time.</p>
            <label>
                Savings Goal: 
                <input type="number" value={goal} onChange={(e) => setGoal(+e.target.value)} />
            </label>
            <br />
            <label>
                Monthly Contribution: 
                <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(+e.target.value)} />
            </label>
            <br />
            <label>
                Interest Rate (optional): 
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(+e.target.value)} />
            </label>
            <br />
            <button onClick={calculateSavings}>Calculate</button>
            <p>{result}</p>
        </div>
    );
};

const BudgetCalculator = () => {
    const [income, setIncome] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [result, setResult] = useState('');

    const calculateBudget = () => {
        const remaining = income - expenses;
        setResult(remaining >= 0 ? `You have $${remaining} remaining.` : `You are over budget by $${-remaining}.`);
    };

    return (
        <div>
            <h2>Budget Calculator</h2>
            <p>Manage your income and expenses to stay within budget.</p>
            <label>
                Monthly Income: 
                <input type="number" value={income} onChange={(e) => setIncome(+e.target.value)} />
            </label>
            <br />
            <label>
                Monthly Expenses: 
                <input type="number" value={expenses} onChange={(e) => setExpenses(+e.target.value)} />
            </label>
            <br />
            <button onClick={calculateBudget}>Calculate</button>
            <p>{result}</p>
        </div>
    );
};

const CarOwnershipPlanner = () => {
    const [carPrice, setCarPrice] = useState(0);
    const [loanTerm, setLoanTerm] = useState(0);
    const [interestRate, setInterestRate] = useState(0);
    const [monthlyPayment, setMonthlyPayment] = useState('');

    const calculateCarPayment = () => {
        if (carPrice > 0 && loanTerm > 0) {
            const rate = interestRate / 100 / 12;
            const payment = carPrice * rate / (1 - Math.pow(1 + rate, -loanTerm));
            setMonthlyPayment(`Your monthly payment is $${payment.toFixed(2)}`);
        } else {
            setMonthlyPayment('Please enter valid car price and loan term.');
        }
    };

    return (
        <div>
            <h2>Car Ownership Planner</h2>
            <p>Estimate the costs of owning a car, including financing and maintenance.</p>
            <label>
                Car Price: 
                <input type="number" value={carPrice} onChange={(e) => setCarPrice(+e.target.value)} />
            </label>
            <br />
            <label>
                Loan Term (months): 
                <input type="number" value={loanTerm} onChange={(e) => setLoanTerm(+e.target.value)} />
            </label>
            <br />
            <label>
                Interest Rate (%): 
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(+e.target.value)} />
            </label>
            <br />
            <button onClick={calculateCarPayment}>Calculate</button>
            <p>{monthlyPayment}</p>
        </div>
    );
};

const FinancialCalculatorPage = () => {
    const [selectedTool, setSelectedTool] = useState('overview');

    const tools = [
        { id: 'overview', name: 'Overview', description: 'Explore financial tools to plan your future.' },
        { id: 'savings', name: 'Savings Planner', description: 'Plan and track your savings goals.' },
        { id: 'budget', name: 'Budget Calculator', description: 'Manage your monthly income and expenses.' },
        { id: 'car', name: 'Car Ownership Planner', description: 'Estimate the cost of owning a car, including financing and maintenance.' }
    ];

    const renderContent = () => {
        switch (selectedTool) {
            case 'savings':
                return <SavingsPlanner />;
            case 'budget':
                return <BudgetCalculator />;
            case 'car':
                return <CarOwnershipPlanner />;
            default:
                return (
                    <div>
                        <h2>Welcome to Financial Tools!</h2>
                        <p>Select a tool from the sidebar to begin planning your financial future.</p>
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif', height: '100vh', backgroundColor: '#f9f9f9' }}>
            <div style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #ddd', padding: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <h1 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px' }}>Financial Tools</h1>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {tools.map((tool) => (
                        <li
                            key={tool.id}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                cursor: 'pointer',
                                backgroundColor: selectedTool === tool.id ? '#007bff' : '#e8e8e8',
                                color: selectedTool === tool.id ? 'white' : '#000',
                                borderRadius: '5px',
                                textAlign: 'center'
                            }}
                            onClick={() => setSelectedTool(tool.id)}
                        >
                            {tool.name}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '5px', marginLeft: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default FinancialCalculatorPage;
