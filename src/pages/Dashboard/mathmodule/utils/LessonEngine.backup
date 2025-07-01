// lessonEngine.js

const conceptGraph = [
    {
      id: 'add-basic',
      question: 'What is 4 + 3?',
      answer: 7,
      next: ['add-double', 'sub-basic'],
    },
    {
      id: 'add-double',
      question: 'What is 14 + 12?',
      answer: 26,
      next: ['sub-basic'],
    },
    {
      id: 'sub-basic',
      question: 'What is 10 - 6?',
      answer: 4,
      next: ['mult-basic'],
    },
    {
      id: 'mult-basic',
      question: 'What is 3 × 4?',
      answer: 12,
      next: [],
    },
  ];
  
  let currentConcept = 'add-basic';
  let attemptLog = {};
  
  export function getNextProblem() {
    const node = conceptGraph.find((c) => c.id === currentConcept);
    return node || null;
  }
  
  export function submitAnswer(answer) {
    const current = conceptGraph.find((c) => c.id === currentConcept);
    const correct = parseInt(answer) === current.answer;
  
    attemptLog[current.id] = attemptLog[current.id] || [];
    attemptLog[current.id].push({ answer, correct, timestamp: Date.now() });
  
    // Move to the next concept (for now, always the first in list)
    if (correct && current.next.length > 0) {
      currentConcept = current.next[0];
    }
  
    return correct;
  }
  
  export function resetLesson() {
    currentConcept = 'add-basic';
    attemptLog = {};
  }