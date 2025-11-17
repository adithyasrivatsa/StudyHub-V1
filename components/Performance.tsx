import React, { useState, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import type { SemesterResult } from '../types';
import { useProfile } from '../contexts/ProfileContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { utils, writeFile } from 'xlsx';

const Performance: React.FC = () => {
    const { currentProfile } = useProfile();
    const { data: results, add, remove } = useDb<SemesterResult>('performance', currentProfile?.id);
    const [semesterName, setSemesterName] = useState('');
    const [gpa, setGpa] = useState('');
    const [credits, setCredits] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const gpaNum = parseFloat(gpa);
        const creditsNum = parseInt(credits, 10);
        if (semesterName && !isNaN(gpaNum) && !isNaN(creditsNum) && gpaNum >= 0 && gpaNum <= 4.0 && creditsNum > 0) {
            await add({ semesterName, gpa: gpaNum, credits: creditsNum });
            setSemesterName('');
            setGpa('');
            setCredits('');
        } else {
            alert('Please enter valid data. GPA must be between 0 and 4.0.');
        }
    };
    
    const cgpaData = useMemo(() => {
        let cumulativeCredits = 0;
        let weightedGpaSum = 0;
        // Sort results by ID to ensure chronological order, assuming IDs are auto-incrementing
        const sortedResults = [...results].sort((a, b) => a.id - b.id);
        return sortedResults.map(r => {
            cumulativeCredits += r.credits;
            weightedGpaSum += r.gpa * r.credits;
            return {
                name: r.semesterName,
                GPA: r.gpa,
                CGPA: parseFloat((weightedGpaSum / cumulativeCredits).toFixed(2))
            };
        });
    }, [results]);

    const exportToExcel = () => {
        const wsData = [
            ["Semester", "GPA", "Credits", "CGPA"],
            ...results.map((res, index) => [
                res.semesterName,
                res.gpa,
                res.credits,
                cgpaData[index]?.CGPA || 'N/A'
            ])
        ];
        const ws = utils.aoa_to_sheet(wsData);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Performance");
        writeFile(wb, "StudentPerformance.xlsx");
    };

    return (
        <div className="p-4 pb-20 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Performance Tracker</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">GPA/CGPA Trend</h2>
                {results.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={cgpaData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 4]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="GPA" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="CGPA" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-gray-500 py-8">Add semester results to see your progress chart.</p>}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Add Semester Result</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <input type="text" value={semesterName} onChange={e => setSemesterName(e.target.value)} placeholder="Semester (e.g., Fall 23)" className="w-full p-2 border rounded-lg col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                    <input type="number" step="0.01" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="GPA" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                    <input type="number" value={credits} onChange={e => setCredits(e.target.value)} placeholder="Credits" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold col-span-1 md:col-span-4">Add Result</button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Results History</h2>
                    <button onClick={exportToExcel} className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white font-semibold" disabled={results.length === 0}>Export to Excel</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-2">Semester</th>
                                <th className="p-2">GPA</th>
                                <th className="p-2">Credits</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(r => (
                                <tr key={r.id} className="border-b dark:border-gray-700">
                                    <td className="p-2 font-medium">{r.semesterName}</td>
                                    <td className="p-2">{r.gpa.toFixed(2)}</td>
                                    <td className="p-2">{r.credits}</td>
                                    <td className="p-2 text-right">
                                        <button onClick={() => remove(r.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Performance;