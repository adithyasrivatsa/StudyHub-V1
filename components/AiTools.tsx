
import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';

type AiToolTab = 'quiz' | 'flashcards' | 'practice' | 'tutor';

const AiTools: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AiToolTab>('quiz');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [prompt, setPrompt] = useState('');

    const handleGenerate = async () => {
        if (!navigator.onLine) {
            alert("AI Tools require an internet connection.");
            return;
        }
        if (!prompt) {
            alert("Please enter a topic or content.");
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            let res;
            switch (activeTab) {
                case 'quiz':
                    res = await geminiService.generateQuiz(prompt, 5);
                    break;
                case 'flashcards':
                    res = await geminiService.generateFlashcards(prompt);
                    break;
                case 'practice':
                    res = await geminiService.generatePracticeSet(prompt);
                    break;
                case 'tutor':
                    res = await geminiService.getStudyPlan('Improve understanding', prompt.split(','));
                    break;
            }
            setResult(res);
        } catch (error) {
            console.error(error);
            alert("Failed to generate content.");
        } finally {
            setLoading(false);
        }
    };
    
    const getPlaceholderText = () => {
        switch (activeTab) {
            case 'quiz': return 'e.g., Cellular Biology';
            case 'flashcards': return 'e.g., Paste your notes here...';
            case 'practice': return 'e.g., Algebra II';
            case 'tutor': return 'e.g., Calculus, Physics, Chemistry';
        }
    }

    const renderResult = () => {
        if (loading) {
            return <div className="text-center p-8 text-indigo-500 animate-pulse">Generating...</div>;
        }
        if (!result) {
            return <div className="text-center p-8 text-gray-500">Your generated content will appear here.</div>;
        }

        switch (activeTab) {
            case 'quiz':
                return (
                    <div className="space-y-4">
                        {result.map((item: any, index: number) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="font-semibold">{index + 1}. {item.question}</p>
                                <div className="text-sm mt-2">Correct Answer: {item.answer}</div>
                            </div>
                        ))}
                    </div>
                );
            case 'flashcards':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.map((item: any, index: number) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="font-semibold">Front: {item.front}</p>
                                <hr className="my-2 border-gray-300 dark:border-gray-600"/>
                                <p>Back: {item.back}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'tutor':
                return <div className="prose dark:prose-invert bg-gray-100 dark:bg-gray-700 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }}/>;
            default:
                return <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>;
        }
    };

    return (
        <div className="p-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">AI Tools</h1>
            
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {(['quiz', 'flashcards', 'practice', 'tutor'] as AiToolTab[]).map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setResult(null); setPrompt(''); }} className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={getPlaceholderText()}
                    rows={activeTab === 'flashcards' ? 5 : 2}
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={handleGenerate} disabled={loading} className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:bg-indigo-300">
                    {loading ? 'Generating...' : 'Generate'}
                </button>
            </div>
            
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm min-h-[200px]">
                <h2 className="font-semibold text-lg mb-4">Output</h2>
                {renderResult()}
            </div>
        </div>
    );
};

export default AiTools;
