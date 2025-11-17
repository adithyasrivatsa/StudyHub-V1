
import React from 'react';
import type { Opportunity } from '../types';

const staticOpportunities: Opportunity[] = [
    {
        title: 'Google Summer of Code',
        company: 'Google',
        deadline: 'Varies (Typically April)',
        link: 'https://summerofcode.withgoogle.com/',
        type: 'Internship',
    },
    {
        title: 'Microsoft Learn Student Ambassador',
        company: 'Microsoft',
        deadline: 'Quarterly Applications',
        link: 'https://studentambassadors.microsoft.com/',
        type: 'Job',
    },
    {
        title: 'GitHub Campus Expert',
        company: 'GitHub',
        deadline: 'Rolling Applications',
        link: 'https://education.github.com/experts',
        type: 'Job',
    },
    {
        title: 'MLH Fellowship',
        company: 'Major League Hacking',
        deadline: 'Seasonal (Spring, Summer, Fall)',
        link: 'https://fellowship.mlh.io/',
        type: 'Internship',
    },
    {
        title: 'Rhodes Scholarship',
        company: 'University of Oxford',
        deadline: 'Varies by country',
        link: 'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/',
        type: 'Scholarship',
    },
    {
        title: 'Hacktoberfest',
        company: 'DigitalOcean & others',
        deadline: 'October Annually',
        link: 'https://hacktoberfest.com/',
        type: 'Hackathon',
    },
];

const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
    const typeColorMap = {
        'Internship': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Scholarship': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Hackathon': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        'Job': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    const type = opportunity.type || 'Scholarship';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{opportunity.title}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeColorMap[type]}`}>
                    {type}
                </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{opportunity.company}</p>
            <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Deadline: {opportunity.deadline}</p>
                <a href={opportunity.link} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white font-semibold">Apply</a>
            </div>
        </div>
    );
};

const Opportunities: React.FC = () => {
    return (
        <div className="p-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Opportunities</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This is a curated list of popular, recurring opportunities. Please visit the official websites for the most up-to-date information and deadlines.
            </p>
            <div className="space-y-4">
                {staticOpportunities.map((op, index) => <OpportunityCard key={index} opportunity={op} />)}
            </div>
        </div>
    );
};

export default Opportunities;
