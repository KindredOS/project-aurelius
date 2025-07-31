import React, { useState, useEffect, useCallback } from 'react';
import { Scale, Zap, Trophy, RotateCcw, Lightbulb, Target } from 'lucide-react';

const AlgebraBalanceGame = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, hint
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [leftSide, setLeftSide] = useState({ coefficient: 2, constant: 5, variable: 'x' });
  const [rightSide, setRightSide] = useState({ coefficient: 0, constant: 13, variable: 'x' });
  const [targetX, setTargetX] = useState(4);
  const [showHint, setShowHint] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [operationHistory, setOperationHistory] = useState([]);

  // Available operations that students can drag and drop
  const operations = [
    { id: 'add', symbol: '+', name: 'Add', color: 'bg-green-500' },
    { id: 'subtract', symbol: '−', name: 'Subtract', color: 'bg-red-500' },
    { id: 'multiply', symbol: '×', name: 'Multiply', color: 'bg-blue-500' },
    { id: 'divide', symbol: '÷', name: 'Divide', color: 'bg-purple-500' },
  ];

  // Generate a new level
  const generateLevel = useCallback(() => {
    const difficulty = Math.min(Math.floor(level / 3) + 1, 4);
    let newLeft, newRight, newTarget;

    switch(difficulty) {
      case 1: // Simple one-step
        newTarget = Math.floor(Math.random() * 10) + 1;
        const addend = Math.floor(Math.random() * 15) + 5;
        newLeft = { coefficient: 1, constant: addend, variable: 'x' };
        newRight = { coefficient: 0, constant: newTarget + addend, variable: 'x' };
        break;
      case 2: // Two-step
        newTarget = Math.floor(Math.random() * 8) + 2;
        const coeff = Math.floor(Math.random() * 4) + 2;
        const const1 = Math.floor(Math.random() * 10) + 3;
        newLeft = { coefficient: coeff, constant: const1, variable: 'x' };
        newRight = { coefficient: 0, constant: coeff * newTarget + const1, variable: 'x' };
        break;
      case 3: // Variables on both sides
        newTarget = Math.floor(Math.random() * 6) + 2;
        const leftCoeff = Math.floor(Math.random() * 3) + 3;
        const rightCoeff = Math.floor(Math.random() * 2) + 1;
        const leftConst = Math.floor(Math.random() * 8) + 2;
        const rightConst = leftCoeff * newTarget + leftConst - rightCoeff * newTarget;
        newLeft = { coefficient: leftCoeff, constant: leftConst, variable: 'x' };
        newRight = { coefficient: rightCoeff, constant: rightConst, variable: 'x' };
        break;
      default: // Complex
        newTarget = Math.floor(Math.random() * 5) + 2;
        const a = Math.floor(Math.random() * 3) + 2;
        const b = Math.floor(Math.random() * 4) + 1;
        const c = Math.floor(Math.random() * 3) + 1;
        const d = a * newTarget + b - c * newTarget;
        newLeft = { coefficient: a, constant: b, variable: 'x' };
        newRight = { coefficient: c, constant: d, variable: 'x' };
        break;
    }

    setLeftSide(newLeft);
    setRightSide(newRight);
    setTargetX(newTarget);
    setMoves(0);
    setGameState('playing');
    setOperationHistory([]);
    setShowHint(false);
  }, [level]);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  // Check if the equation is solved
  const checkSolution = useCallback(() => {
    const leftValue = leftSide.coefficient * targetX + leftSide.constant;
    const rightValue = rightSide.coefficient * targetX + rightSide.constant;
    const isBalanced = Math.abs(leftValue - rightValue) < 0.001;
    
    // Check if x is isolated (coefficient of x is 1 on one side, 0 on the other)
    const leftIsolated = leftSide.coefficient === 1 && rightSide.coefficient === 0;
    const rightIsolated = rightSide.coefficient === 1 && leftSide.coefficient === 0;
    const isIsolated = leftIsolated || rightIsolated;
    
    if (isBalanced && isIsolated) {
      setGameState('won');
      const bonusPoints = Math.max(100 - moves * 5, 20);
      setScore(prev => prev + bonusPoints);
    }
  }, [leftSide, rightSide, targetX, moves]);

  useEffect(() => {
    checkSolution();
  }, [checkSolution]);

  // Apply operation to both sides
  const applyOperation = (operation, value) => {
    if (!value || value === 0) return;
    
    setMoves(prev => prev + 1);
    
    const newLeft = { ...leftSide };
    const newRight = { ...rightSide };
    
    switch(operation) {
      case 'add':
        newLeft.constant += value;
        newRight.constant += value;
        break;
      case 'subtract':
        newLeft.constant -= value;
        newRight.constant -= value;
        break;
      case 'multiply':
        newLeft.coefficient *= value;
        newLeft.constant *= value;
        newRight.coefficient *= value;
        newRight.constant *= value;
        break;
      case 'divide':
        newLeft.coefficient /= value;
        newLeft.constant /= value;
        newRight.coefficient /= value;
        newRight.constant /= value;
        break;
    }
    
    setLeftSide(newLeft);
    setRightSide(newRight);
    setOperationHistory(prev => [...prev, { operation, value }]);
  };

  // Format side for display
  const formatSide = (side) => {
    const parts = [];
    
    if (side.coefficient !== 0) {
      if (side.coefficient === 1) {
        parts.push('x');
      } else if (side.coefficient === -1) {
        parts.push('-x');
      } else {
        parts.push(`${side.coefficient}x`);
      }
    }
    
    if (side.constant !== 0) {
      if (parts.length > 0) {
        if (side.constant > 0) {
          parts.push(` + ${side.constant}`);
        } else {
          parts.push(` - ${Math.abs(side.constant)}`);
        }
      } else {
        parts.push(`${side.constant}`);
      }
    }
    
    return parts.length > 0 ? parts.join('') : '0';
  };

  // Get hint for next move
  const getHint = () => {
    if (leftSide.constant !== 0 && rightSide.constant !== 0) {
      const smallerConstant = Math.abs(leftSide.constant) < Math.abs(rightSide.constant) ? leftSide.constant : rightSide.constant;
      return `Try subtracting ${smallerConstant} from both sides to simplify the constants.`;
    }
    
    if (leftSide.constant !== 0) {
      return `Try ${leftSide.constant > 0 ? 'subtracting' : 'adding'} ${Math.abs(leftSide.constant)} to isolate the x term.`;
    }
    
    if (rightSide.constant !== 0) {
      return `Try ${rightSide.constant > 0 ? 'subtracting' : 'adding'} ${Math.abs(rightSide.constant)} to isolate the x term.`;
    }
    
    if (leftSide.coefficient !== 1 && leftSide.coefficient !== 0) {
      return `Try dividing both sides by ${leftSide.coefficient} to get x by itself.`;
    }
    
    if (rightSide.coefficient !== 1 && rightSide.coefficient !== 0) {
      return `Try dividing both sides by ${rightSide.coefficient} to get x by itself.`;
    }
    
    return "You're close! Look for ways to isolate x on one side.";
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
  };

  const resetLevel = () => {
    generateLevel();
  };

  const [operationInput, setOperationInput] = useState('');

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Algebra Balance Quest
          </h1>
          <p className="text-gray-600">Balance the equation by applying operations to both sides!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <Target className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{level}</div>
            <div className="text-sm opacity-90">Level</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
            <Trophy className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-sm opacity-90">Score</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
            <Zap className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{moves}</div>
            <div className="text-sm opacity-90">Moves</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
            <Scale className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">x = {targetX}</div>
            <div className="text-sm opacity-90">Target</div>
          </div>
        </div>

        {/* Equation Display */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-center text-6xl font-mono font-bold text-gray-800 mb-4">
            <div className="bg-blue-100 px-6 py-4 rounded-lg border-2 border-blue-200">
              {formatSide(leftSide)}
            </div>
            <div className="mx-8 text-4xl">=</div>
            <div className="bg-red-100 px-6 py-4 rounded-lg border-2 border-red-200">
              {formatSide(rightSide)}
            </div>
          </div>
          
          {/* Balance visualization */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Scale size={48} className="text-gray-600" />
              <div className={`absolute -top-2 -left-2 w-4 h-4 rounded-full ${
                Math.abs(leftSide.coefficient * targetX + leftSide.constant - 
                         (rightSide.coefficient * targetX + rightSide.constant)) < 0.001 
                  ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>
          
          <div className="text-center text-gray-600">
            Goal: Isolate x to find x = {targetX}
          </div>
        </div>

        {/* Operations Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {operations.map((op) => (
            <div key={op.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className={`${op.color} text-white p-3 rounded-lg text-center mb-3`}>
                <div className="text-2xl font-bold">{op.symbol}</div>
                <div className="text-sm">{op.name}</div>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Value"
                  className="flex-1 px-2 py-1 border rounded text-center"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value !== 0) {
                        applyOperation(op.id, value);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector(`input[placeholder="Value"]`);
                    const value = parseFloat(input.value);
                    if (!isNaN(value) && value !== 0) {
                      applyOperation(op.id, value);
                      input.value = '';
                    }
                  }}
                  className={`${op.color} text-white px-3 py-1 rounded text-sm hover:opacity-80 transition-opacity`}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Operation History */}
        {operationHistory.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Your moves:</h3>
            <div className="flex flex-wrap gap-2">
              {operationHistory.map((op, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {op.operation} {op.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Lightbulb size={20} />
              <span className="font-semibold">Hint:</span>
            </div>
            <p className="text-yellow-700 mt-2">{getHint()}</p>
          </div>
        )}

        {/* Win Message */}
        {gameState === 'won' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Equation Balanced!</h2>
            <p className="text-green-700 mb-4">
              You solved it in {moves} moves! 
              {moves <= 3 && <span className="font-semibold text-green-800"> Perfect efficiency!</span>}
            </p>
            <button
              onClick={nextLevel}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Next Level
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            <Lightbulb size={20} />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          <button
            onClick={resetLevel}
            className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={20} />
            Reset Level
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 How to Play:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">Goal:</h4>
              <p>Isolate x on one side of the equation by applying operations to both sides equally.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Rules:</h4>
              <p>Whatever you do to one side, you must do to the other to keep the equation balanced!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgebraBalanceGame;