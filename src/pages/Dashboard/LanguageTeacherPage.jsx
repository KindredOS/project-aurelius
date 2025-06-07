import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, Check, X, ChevronRight, BookOpen, Mic, Headphones, MessageSquare } from 'lucide-react';
import styles from './LanguageTeacherPage.module.css';

const LanguageTeacherPage = () => {
    const [selectedTool, setSelectedTool] = useState('overview');
    const [selectedLanguage, setSelectedLanguage] = useState('spanish');
    
    // Language data
    const languages = {
        spanish: { name: 'Spanish', flag: '🇪🇸' },
        french: { name: 'French', flag: '🇫🇷' },
        german: { name: 'German', flag: '🇩🇪' },
        italian: { name: 'Italian', flag: '🇮🇹' }
    };

    // Enhanced vocabulary data
    const vocabularyData = {
        spanish: [
            { word: 'Hola', translation: 'Hello', category: 'Greetings', pronunciation: 'OH-lah' },
            { word: 'Gracias', translation: 'Thank you', category: 'Courtesy', pronunciation: 'GRAH-see-ahs' },
            { word: 'Casa', translation: 'House', category: 'Home', pronunciation: 'KAH-sah' },
            { word: 'Agua', translation: 'Water', category: 'Food & Drink', pronunciation: 'AH-gwah' },
            { word: 'Comida', translation: 'Food', category: 'Food & Drink', pronunciation: 'koh-MEE-dah' },
            { word: 'Familia', translation: 'Family', category: 'People', pronunciation: 'fah-MEE-lee-ah' },
            { word: 'Trabajo', translation: 'Work', category: 'Daily Life', pronunciation: 'trah-BAH-hoh' },
            { word: 'Tiempo', translation: 'Time/Weather', category: 'Daily Life', pronunciation: 'tee-EHM-poh' }
        ],
        french: [
            { word: 'Bonjour', translation: 'Hello', category: 'Greetings', pronunciation: 'bon-ZHOOR' },
            { word: 'Merci', translation: 'Thank you', category: 'Courtesy', pronunciation: 'mer-SEE' },
            { word: 'Maison', translation: 'House', category: 'Home', pronunciation: 'meh-ZOHN' },
            { word: 'Eau', translation: 'Water', category: 'Food & Drink', pronunciation: 'OH' },
            { word: 'Nourriture', translation: 'Food', category: 'Food & Drink', pronunciation: 'noo-ree-TOOR' },
            { word: 'Famille', translation: 'Family', category: 'People', pronunciation: 'fah-MEEL' }
        ]
    };

    // Grammar lessons data
    const grammarLessons = {
        spanish: [
            {
                title: 'Articles (El, La, Los, Las)',
                content: 'Spanish nouns have gender (masculine/feminine) and number (singular/plural).',
                examples: ['El libro (the book - masculine)', 'La mesa (the table - feminine)', 'Los libros (the books)', 'Las mesas (the tables)'],
                practice: [
                    { question: '__ casa (the house)', answer: 'La', options: ['El', 'La', 'Los', 'Las'] },
                    { question: '__ libros (the books)', answer: 'Los', options: ['El', 'La', 'Los', 'Las'] }
                ]
            },
            {
                title: 'Present Tense Verbs',
                content: 'Regular -ar verbs follow a pattern. Remove -ar and add endings: -o, -as, -a, -amos, -áis, -an',
                examples: ['Hablar (to speak): Yo hablo, Tú hablas, Él/Ella habla'],
                practice: [
                    { question: 'Yo __ español (I speak Spanish)', answer: 'hablo', options: ['hablo', 'hablas', 'habla', 'hablamos'] }
                ]
            }
        ]
    };

    // Tools configuration
    const tools = [
        { id: 'overview', name: 'Overview', icon: BookOpen, description: 'Learn new languages with interactive tools.' },
        { id: 'vocabulary', name: 'Vocabulary Builder', icon: MessageSquare, description: 'Expand your vocabulary with quizzes and flashcards.' },
        { id: 'grammar', name: 'Grammar Lessons', icon: BookOpen, description: 'Understand grammar rules and structures.' },
        { id: 'speaking', name: 'Speaking Practice', icon: Mic, description: 'Improve your pronunciation and speaking skills.' },
        { id: 'listening', name: 'Listening Practice', icon: Headphones, description: 'Develop your listening comprehension.' }
    ];

    // Component states
    const [vocabularyState, setVocabularyState] = useState({
        currentMode: 'flashcards', // flashcards, quiz
        currentCard: 0,
        isFlipped: false,
        quizScore: 0,
        quizTotal: 0,
        showResult: false,
        selectedAnswer: null
    });

    const [grammarState, setGrammarState] = useState({
        currentLesson: 0,
        showPractice: false,
        currentQuestion: 0,
        score: 0,
        selectedAnswer: null,
        showResult: false
    });

    const [speakingState, setSpeakingState] = useState({
        isRecording: false,
        currentPhrase: 0,
        phrases: [
            { text: 'Hola, ¿cómo estás?', translation: 'Hello, how are you?', pronunciation: 'OH-lah KOH-moh ehs-TAHS' },
            { text: 'Me llamo...', translation: 'My name is...', pronunciation: 'meh YAH-moh' },
            { text: '¿Dónde está el baño?', translation: 'Where is the bathroom?', pronunciation: 'DOHN-deh ehs-TAH ehl BAH-nyoh' }
        ]
    });

    // Utility functions
    const speak = (text, lang = 'es') => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'spanish' ? 'es-ES' : 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    // Vocabulary functions
    const nextCard = () => {
        const vocab = vocabularyData[selectedLanguage] || [];
        setVocabularyState(prev => ({
            ...prev,
            currentCard: (prev.currentCard + 1) % vocab.length,
            isFlipped: false
        }));
    };

    const flipCard = () => {
        setVocabularyState(prev => ({ ...prev, isFlipped: !prev.isFlipped }));
    };

    const startQuiz = () => {
        setVocabularyState(prev => ({
            ...prev,
            currentMode: 'quiz',
            currentCard: 0,
            quizScore: 0,
            quizTotal: 0,
            showResult: false,
            selectedAnswer: null
        }));
    };

    const selectQuizAnswer = (answer) => {
        const vocab = vocabularyData[selectedLanguage] || [];
        const currentVocab = vocab[vocabularyState.currentCard];
        const isCorrect = answer === currentVocab.translation;
        
        setVocabularyState(prev => ({
            ...prev,
            selectedAnswer: answer,
            showResult: true,
            quizScore: isCorrect ? prev.quizScore + 1 : prev.quizScore,
            quizTotal: prev.quizTotal + 1
        }));

        setTimeout(() => {
            setVocabularyState(prev => ({
                ...prev,
                currentCard: (prev.currentCard + 1) % vocab.length,
                showResult: false,
                selectedAnswer: null
            }));
        }, 1500);
    };

    // Grammar functions
    const selectGrammarAnswer = (answer) => {
        const lessons = grammarLessons[selectedLanguage] || [];
        const currentLesson = lessons[grammarState.currentLesson];
        const currentQuestion = currentLesson.practice[grammarState.currentQuestion];
        const isCorrect = answer === currentQuestion.answer;

        setGrammarState(prev => ({
            ...prev,
            selectedAnswer: answer,
            showResult: true,
            score: isCorrect ? prev.score + 1 : prev.score
        }));

        setTimeout(() => {
            const nextQuestion = grammarState.currentQuestion + 1;
            if (nextQuestion < currentLesson.practice.length) {
                setGrammarState(prev => ({
                    ...prev,
                    currentQuestion: nextQuestion,
                    selectedAnswer: null,
                    showResult: false
                }));
            } else {
                setGrammarState(prev => ({
                    ...prev,
                    showPractice: false,
                    currentQuestion: 0,
                    selectedAnswer: null,
                    showResult: false
                }));
            }
        }, 1500);
    };

    // Render functions
    const renderOverview = () => (
        <div className={styles.contentSection}>
            <div className={styles.overviewHeader}>
                <h2 className={`${styles.overviewTitle} ${styles.text3xl} ${styles.fontBold} ${styles.textGray800}`}>
                    Welcome to Language Teacher!
                </h2>
                <p className={`${styles.overviewDescription} ${styles.textLg} ${styles.textGray600}`}>
                    Select a language and start your learning journey with our interactive tools.
                </p>
                
                <div className={styles.languageSelector}>
                    <label className={`${styles.languageLabel} ${styles.textSm} ${styles.fontMedium} ${styles.textGray800}`}>
                        Choose Your Language:
                    </label>
                    <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className={styles.languageSelect}
                    >
                        {Object.entries(languages).map(([key, lang]) => (
                            <option key={key} value={key}>{lang.flag} {lang.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.toolsGrid}>
                {tools.slice(1).map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <div key={tool.id} className={styles.toolCard}
                             onClick={() => setSelectedTool(tool.id)}>
                            <div className={styles.toolCardHeader}>
                                <Icon className={styles.toolCardIcon} />
                                <h3 className={`${styles.toolCardTitle} ${styles.textXl} ${styles.fontSemibold} ${styles.textGray800}`}>
                                    {tool.name}
                                </h3>
                            </div>
                            <p className={`${styles.toolCardDescription} ${styles.textGray600}`}>
                                {tool.description}
                            </p>
                            <div className={styles.toolCardFooter}>
                                <ChevronRight className={styles.chevronIcon} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderVocabularyBuilder = () => {
        const vocab = vocabularyData[selectedLanguage] || [];
        if (vocab.length === 0) return <div className={styles.contentSection}>No vocabulary available for this language yet.</div>;

        const currentVocab = vocab[vocabularyState.currentCard];

        if (vocabularyState.currentMode === 'quiz') {
            const wrongAnswers = vocab.filter(v => v.translation !== currentVocab.translation)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(v => v.translation);
            const allAnswers = [currentVocab.translation, ...wrongAnswers].sort(() => Math.random() - 0.5);

            return (
                <div className={styles.contentSection}>
                    <div className={`${styles.practiceNav} ${styles.mb6}`}>
                        <h2 className={`${styles.text2xl} ${styles.fontBold} ${styles.textGray800}`}>
                            Vocabulary Quiz
                        </h2>
                        <div className={`${styles.textLg} ${styles.fontSemibold} ${styles.textGreen600}`}>
                            Score: {vocabularyState.quizScore}/{vocabularyState.quizTotal}
                        </div>
                    </div>

                    <div className={`${styles.card} ${styles.cardCentered}`}>
                        <div className={`${styles.textCenter} ${styles.mb8}`}>
                            <h3 className={`${styles.text3xl} ${styles.fontBold} ${styles.textGray800} ${styles.mb2}`}>
                                {currentVocab.word}
                            </h3>
                            <button onClick={() => speak(currentVocab.word, selectedLanguage)} className={styles.audioButton}>
                                <Volume2 className={styles.buttonIconLarge} />
                            </button>
                            <p className={`${styles.textGray600} ${styles.mt2}`}>/{currentVocab.pronunciation}/</p>
                        </div>

                        <div className={styles.quizGrid}>
                            {allAnswers.map((answer, index) => {
                                let buttonClass = styles.quizButton;
                                if (vocabularyState.showResult) {
                                    buttonClass += ` ${styles.quizButtonDisabled}`;
                                    if (answer === currentVocab.translation) {
                                        buttonClass += ` ${styles.quizButtonCorrect}`;
                                    } else if (answer === vocabularyState.selectedAnswer) {
                                        buttonClass += ` ${styles.quizButtonIncorrect}`;
                                    } else {
                                        buttonClass += ` ${styles.quizButtonDefault}`;
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectQuizAnswer(answer)}
                                        disabled={vocabularyState.showResult}
                                        className={buttonClass}
                                    >
                                        {answer}
                                        {vocabularyState.showResult && answer === currentVocab.translation && <Check className={styles.buttonIcon} />}
                                        {vocabularyState.showResult && answer === vocabularyState.selectedAnswer && answer !== currentVocab.translation && <X className={styles.buttonIcon} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className={`${styles.textCenter} ${styles.mt8}`}>
                            <button
                                onClick={() => setVocabularyState(prev => ({ ...prev, currentMode: 'flashcards' }))}
                                className={`${styles.button} ${styles.buttonGray}`}
                            >
                                Back to Flashcards
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.contentSection}>
                <div className={`${styles.practiceNav} ${styles.mb6}`}>
                    <h2 className={`${styles.text2xl} ${styles.fontBold} ${styles.textGray800}`}>
                        Vocabulary Builder
                    </h2>
                    <button
                        onClick={startQuiz}
                        className={`${styles.button} ${styles.buttonSecondary}`}
                    >
                        Start Quiz
                    </button>
                </div>

                <div className={styles.cardSmall}>
                    <div className={styles.flashcard} onClick={flipCard}>
                        <div className={styles.textCenter}>
                            {!vocabularyState.isFlipped ? (
                                <>
                                    <h3 className={`${styles.text3xl} ${styles.fontBold} ${styles.textGray800} ${styles.mb4}`}>
                                        {currentVocab.word}
                                    </h3>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); speak(currentVocab.word, selectedLanguage); }} 
                                        className={`${styles.audioButton} ${styles.mb2}`}
                                    >
                                        <Volume2 className={styles.buttonIconLarge} />
                                    </button>
                                    <p className={`${styles.textGray600}`}>/{currentVocab.pronunciation}/</p>
                                    <p className={`${styles.textSm} ${styles.textGray500} ${styles.mt4}`}>
                                        Click to reveal translation
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className={`${styles.text3xl} ${styles.fontBold} ${styles.textGreen600} ${styles.mb2}`}>
                                        {currentVocab.translation}
                                    </h3>
                                    <p className={`${styles.textGray600} ${styles.mb2}`}>
                                        Category: {currentVocab.category}
                                    </p>
                                    <p className={`${styles.textSm} ${styles.textGray500}`}>
                                        Click to see word again
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.flashcardControls}>
                        <button
                            onClick={nextCard}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                        >
                            <RotateCcw className={styles.buttonIcon} />
                            Next Card
                        </button>
                        <span className={styles.flashcardCounter}>
                            {vocabularyState.currentCard + 1} of {vocab.length}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderGrammarLessons = () => {
        const lessons = grammarLessons[selectedLanguage] || [];
        if (lessons.length === 0) return <div className={styles.contentSection}>No grammar lessons available for this language yet.</div>;

        const currentLesson = lessons[grammarState.currentLesson];

        if (grammarState.showPractice) {
            const currentQuestion = currentLesson.practice[grammarState.currentQuestion];
            
            return (
                <div className={styles.contentSection}>
                    <h2 className={`${styles.text2xl} ${styles.fontBold} ${styles.textGray800} ${styles.mb6}`}>
                        Practice: {currentLesson.title}
                    </h2>
                    
                    <div className={`${styles.card} ${styles.cardCentered}`}>
                        <div className={`${styles.textCenter} ${styles.mb8}`}>
                            <h3 className={`${styles.textXl} ${styles.fontSemibold} ${styles.textGray800} ${styles.mb4}`}>
                                {currentQuestion.question}
                            </h3>
                        </div>

                        <div className={styles.quizGrid}>
                            {currentQuestion.options.map((option, index) => {
                                let buttonClass = styles.quizButton;
                                if (grammarState.showResult) {
                                    buttonClass += ` ${styles.quizButtonDisabled}`;
                                    if (option === currentQuestion.answer) {
                                        buttonClass += ` ${styles.quizButtonCorrect}`;
                                    } else if (option === grammarState.selectedAnswer) {
                                        buttonClass += ` ${styles.quizButtonIncorrect}`;
                                    } else {
                                        buttonClass += ` ${styles.quizButtonDefault}`;
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectGrammarAnswer(option)}
                                        disabled={grammarState.showResult}
                                        className={buttonClass}
                                    >
                                        {option}
                                        {grammarState.showResult && option === currentQuestion.answer && <Check className={styles.buttonIcon} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className={`${styles.textCenter} ${styles.mt6}`}>
                            <p className={`${styles.textGray600}`}>
                                Question {grammarState.currentQuestion + 1} of {currentLesson.practice.length}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.contentSection}>
                <h2 className={`${styles.text2xl} ${styles.fontBold} ${styles.textGray800} ${styles.mb6}`}>
                    Grammar Lessons
                </h2>
                
                <div className={styles.cardCentered}>
                    {lessons.map((lesson, index) => (
                        <div key={index} className={`${styles.card} ${styles.mb6}`}>
                            <h3 className={`${styles.textXl} ${styles.fontSemibold} ${styles.textGray800} ${styles.mb4}`}>
                                {lesson.title}
                            </h3>
                            <p className={`${styles.textGray600} ${styles.mb4}`}>
                                {lesson.content}
                            </p>
                            
                            <div className={styles.mb4}>
                                <h4 className={`${styles.fontSemibold} ${styles.textGray800} ${styles.mb2}`}>
                                    Examples:
                                </h4>
                                <ul className={`${styles.textGray600}`}>
                                    {lesson.examples.map((example, idx) => (
                                        <li key={idx} style={{ listStyle: 'disc', marginLeft: '1.5rem' }}>
                                            {example}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => setGrammarState(prev => ({ 
                                    ...prev, 
                                    currentLesson: index, 
                                    showPractice: true, 
                                    currentQuestion: 0, 
                                    score: 0 
                                }))}
                                className={`${styles.button} ${styles.buttonPrimary}`}
                            >
                                Practice This Lesson
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSpeakingPractice = () => {
        const currentPhrase = speakingState.phrases[speakingState.currentPhrase];
        
        return (
            <div className={styles.contentSection}>
                <h2 className={`${styles.text2xl} ${styles.fontBold} ${styles.textGray800} ${styles.mb6}`}>
                    Speaking Practice
                </h2>
                
                <div className={styles.cardCentered}>
                    <div className={styles.card}>
                        <div className={`${styles.textCenter} ${styles.mb8}`}>
                            <h3 className={`${styles.text2xl} ${styles.fontBold} ${styles.textGray800} ${styles.mb2}`}>
                                {currentPhrase.text}
                            </h3>
                            <p className={`${styles.textLg} ${styles.textGray600} ${styles.mb2}`}>
                                {currentPhrase.translation}
                            </p>
                            <p className={`${styles.textGray500}`}>
                                /{currentPhrase.pronunciation}/
                            </p>
                        </div>

                        <div className={`${styles.textCenter} ${styles.mb8}`} style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => speak(currentPhrase.text, selectedLanguage)}
                                className={`${styles.button} ${styles.buttonPrimary}`}
                            >
                                <Volume2 className={styles.buttonIconLarge} />
                                Listen
                            </button>
                            
                            <button className={`${styles.button} ${styles.buttonRed}`}>
                                <Mic className={styles.buttonIconLarge} />
                                Record Yourself
                            </button>
                        </div>

                        <div className={styles.practiceNav}>
                            <button
                                onClick={() => setSpeakingState(prev => ({ 
                                    ...prev, 
                                    currentPhrase: Math.max(0, prev.currentPhrase - 1) 
                                }))}
                                disabled={speakingState.currentPhrase === 0}
                                className={`${styles.button} ${styles.buttonGray} ${speakingState.currentPhrase === 0 ? styles.buttonDisabled : ''}`}
                            >
                                Previous
                            </button>
                            
                            <span className={styles.practiceCounter}>
                                {speakingState.currentPhrase + 1} of {speakingState.phrases.length}
                            </span>
                            
                            <button
                                onClick={() => setSpeakingState(prev => ({ 
                                    ...prev, 
                                    currentPhrase: Math.min(prev.phrases.length - 1, prev.currentPhrase + 1) 
                                }))}
                                disabled={speakingState.currentPhrase === speakingState.phrases.length - 1}
                                className={`${styles.button} ${styles.buttonGray} ${speakingState.currentPhrase === speakingState.phrases.length - 1 ? styles.buttonDisabled : ''}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderListeningPractice = () => (
        <div className={styles.contentSection}>
            <h2 className={`${styles.text2xl} ${styles.fontBold} ${styles.textGray800} ${styles.mb6}`}>
                Listening Practice
            </h2>
            
            <div className={styles.cardCentered}>
                <div className={`${styles.card} ${styles.textCenter}`}>
                    <Headphones className={`${styles.textGreen600} ${styles.mb4}`} style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem' }} />
                    <h3 className={`${styles.textXl} ${styles.fontSemibold} ${styles.textGray800} ${styles.mb4}`}>
                        Audio Exercises
                    </h3>
                    <p className={`${styles.textGray600} ${styles.mb6}`}>
                        Listen to native speakers and improve your comprehension skills.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button 
                            onClick={() => speak('Hola, me llamo María. Soy de España y me gusta mucho viajar.', selectedLanguage)}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            style={{ width: '100%' }}
                        >
                            <Play className={styles.buttonIconLarge} />
                            Listen to Introduction
                        </button>
                        
                        <button 
                            onClick={() => speak('¿Te gusta la comida italiana? A mí me encanta la pizza y la pasta.', selectedLanguage)}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            style={{ width: '100%' }}
                        >
                            <Play className={styles.buttonIconLarge} />
                            Listen to Conversation
                        </button>
                        
                        <button 
                            onClick={() => speak('El clima hoy está muy bueno. Hace sol y no hay nubes en el cielo.', selectedLanguage)}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            style={{ width: '100%' }}
                        >
                            <Play className={styles.buttonIconLarge} />
                            Listen to Weather Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Main render function
    const renderContent = () => {
        switch (selectedTool) {
            case 'vocabulary':
                return renderVocabularyBuilder();
            case 'grammar':
                return renderGrammarLessons();
            case 'speaking':
                return renderSpeakingPractice();
            case 'listening':
                return renderListeningPractice();
            default:
                return renderOverview();
        }
    };

    return (
        <div className={styles.languageTeacherPageContainer}>
            {/* Sidebar Navigation */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h1 className={styles.sidebarTitle}>Language Teacher</h1>
                    <p className={styles.sidebarSubtitle}>
                        {languages[selectedLanguage].flag} {languages[selectedLanguage].name}
                    </p>
                </div>
                
                <nav className={styles.sidebarNav}>
                    <h2 className={styles.navTitle}>Tools</h2>
                    <ul className={styles.toolList}>
                        {tools.map((tool) => {
                            const Icon = tool.icon;
                            return (
                                <li key={tool.id} className={styles.toolItem}>
                                    <button
                                        onClick={() => setSelectedTool(tool.id)}
                                        className={`${styles.toolButton} ${selectedTool === tool.id ? styles.active : ''}`}
                                    >
                                        <Icon className={styles.toolIcon} />
                                        {tool.name}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default LanguageTeacherPage;