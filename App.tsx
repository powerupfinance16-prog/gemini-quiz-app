import React, { useState, useCallback } from 'react';
import { GameState, QuizConfig, QuizQuestion } from './types';
import { generateQuiz } from './services/geminiService';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { GoogleGenAI } from '@google/genai';

const PREDEFINED_TOPICS = [
  "General Knowledge",
  "Science & Nature",
  "History & Culture",
  "Technology",
  "Art & Literature"
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(PREDEFINED_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleStartQuiz = useCallback(async () => {
    setGameState(GameState.LOADING);
    const topic = customTopic.trim() || selectedTopic;
    try {
      const generatedQuestions = await generateQuiz({
        topic,
        difficulty: 'medium'
      });
      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setScore(0);
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error(error);
      setGameState(GameState.ERROR);
    }
  }, [customTopic, selectedTopic]);

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    setSelectedAnswer(optionIndex);
    const isCorrect = optionIndex === questions[currentIndex].correctAnswerIndex;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameState(GameState.FINISHED);
    }
  };

  const resetGame = () => {
    setGameState(GameState.IDLE);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCustomTopic("");
  };

  // --- RENDER HELPERS ---

  const renderStartScreen = () => (
    <div className="max-w-md w-full mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-4xl text-neutral-800 font-light tracking-tight">
          Knowledge <span className="font-serif italic text-neutral-500">Search</span>
        </h1>
        <p className="text-neutral-500">
          Powered by Gemini 2.5 Flash
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 ml-1">
            Choose a topic
          </label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopic("");
                }}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                  selectedTopic === topic && !customTopic
                    ? "bg-neutral-800 text-white border-neutral-800 shadow-md"
                    : "bg-white/40 text-neutral-600 border-transparent hover:border-neutral-200 hover:bg-white/60"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200/60"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/50 px-2 text-neutral-400 backdrop-blur-sm rounded">or anything else</span>
          </div>
        </div>

        <div className="space-y-2">
           <input 
              type="text" 
              placeholder="E.g., Quantum Physics, 90s Hip Hop..." 
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-200 transition-all text-neutral-800 placeholder:text-neutral-400"
           />
        </div>

        <Button onClick={handleStartQuiz} className="w-full" isLoading={gameState === GameState.LOADING}>
          Start Quiz
        </Button>
      </div>
    </div>
  );

  const renderQuestion = () => {
    const question = questions[currentIndex];
    const isAnswered = selectedAnswer !== null;

    return (
      <div className="max-w-2xl w-full mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6 px-2">
           <button onClick={resetGame} className="text-xs text-neutral-400 hover:text-neutral-800 transition-colors uppercase tracking-widest font-semibold">
             Exit
           </button>
           <span className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">
             {currentIndex + 1} / {questions.length}
           </span>
        </div>

        <ProgressBar current={currentIndex + (isAnswered ? 1 : 0)} total={questions.length} />

        <div className="glass-panel p-8 md:p-10 rounded-3xl min-h-[400px] flex flex-col justify-between relative overflow-hidden">
           
           <div className="space-y-8 z-10">
              <h2 className="text-2xl md:text-3xl font-serif text-neutral-800 leading-tight">
                {question.question}
              </h2>

              <div className="grid gap-3">
                {question.options.map((option, idx) => {
                  let buttonStyle = "bg-white/40 hover:bg-white/80 border-transparent hover:border-neutral-200";
                  
                  if (isAnswered) {
                    if (idx === question.correctAnswerIndex) {
                      buttonStyle = "bg-emerald-100/80 border-emerald-200 text-emerald-900";
                    } else if (idx === selectedAnswer) {
                      buttonStyle = "bg-rose-100/80 border-rose-200 text-rose-900";
                    } else {
                      buttonStyle = "opacity-50 bg-white/20";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 md:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${buttonStyle}`}
                    >
                      <span className="font-medium">{option}</span>
                      {isAnswered && idx === question.correctAnswerIndex && (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isAnswered && idx === selectedAnswer && idx !== question.correctAnswerIndex && (
                        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
           </div>

           {/* Explanation Slide-up */}
           {showExplanation && (
             <div className="mt-8 pt-6 border-t border-neutral-200/50 animate-slide-up">
               <div className="flex items-start gap-3">
                 <div className="bg-neutral-100 p-2 rounded-full shrink-0">
                    <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <div className="space-y-4 w-full">
                    <div>
                        <p className="text-sm font-semibold text-neutral-900 mb-1">Insight</p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            {question.explanation}
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleNext} className="py-2 px-6 text-sm">
                            {currentIndex === questions.length - 1 ? "Finish" : "Next Question"}
                        </Button>
                    </div>
                 </div>
               </div>
             </div>
           )}

        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="max-w-md w-full mx-auto text-center space-y-8 animate-fade-in">
       <div className="glass-panel p-10 rounded-3xl space-y-8 relative overflow-hidden">
          {/* Confetti or decorative background elements could go here */}
          
          <div className="space-y-2">
            <h2 className="text-5xl font-serif text-neutral-800">
                {score} <span className="text-2xl text-neutral-400 font-sans font-light">/ {questions.length}</span>
            </h2>
            <p className="text-neutral-500 font-medium">
                {score === questions.length ? "Perfect Score!" : 
                 score > questions.length / 2 ? "Great Job!" : "Keep Learning!"}
            </p>
          </div>

          <div className="w-full h-px bg-neutral-200/60"></div>

          <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/40">
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Topic</p>
                <p className="font-medium text-neutral-800 truncate">{customTopic || selectedTopic}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/40">
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Accuracy</p>
                <p className="font-medium text-neutral-800">{Math.round((score/questions.length)*100)}%</p>
              </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={resetGame} className="w-full">
                Try Another Topic
            </Button>
          </div>
       </div>
    </div>
  );

  const renderError = () => (
      <div className="max-w-md w-full mx-auto text-center space-y-6 animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-xl font-medium text-neutral-800 mb-2">Something went wrong</h3>
            <p className="text-neutral-500 mb-6">We couldn't generate the quiz right now. Please check your connection or try again.</p>
            <Button onClick={resetGame} variant="secondary">
                Go Back
            </Button>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 selection:bg-neutral-200">
      <div className="w-full max-w-4xl">
        {gameState === GameState.IDLE && renderStartScreen()}
        {gameState === GameState.LOADING && renderStartScreen()} 
        {/* We keep the start screen during loading but the button shows spinner */}
        {gameState === GameState.PLAYING && renderQuestion()}
        {gameState === GameState.FINISHED && renderResults()}
        {gameState === GameState.ERROR && renderError()}
      </div>
      
      {/* Footer / Attribution */}
      <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none">
         <p className="text-[10px] text-neutral-400 font-medium opacity-50">
             GENERATED BY GEMINI
         </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slide-up {
            animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;