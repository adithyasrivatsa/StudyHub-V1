import React, { useState } from 'react';
import { useDb } from '../hooks/useDb';
import type { DocumentFile } from '../types';
import { PlusIcon } from './icons';
import { useProfile } from '../contexts/ProfileContext';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const DocumentViewer: React.FC<{ doc: DocumentFile; onClose: () => void }> = ({ doc, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white truncate">{doc.name}</h2>
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">Close</button>
            </div>
            <div className="flex-1 bg-white rounded-lg overflow-hidden">
                {doc.type.startsWith('image/') ? (
                    <img src={doc.data} alt={doc.name} className="w-full h-full object-contain" />
                ) : (
                    <iframe src={doc.data} title={doc.name} className="w-full h-full border-0" />
                )}
            </div>
        </div>
    );
};

const Documents: React.FC = () => {
    const { currentProfile } = useProfile();
    const { data: documents, add } = useDb<DocumentFile>('documents', currentProfile?.id);
    const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const dataUrl = await fileToBase64(file);
                await add({
                    name: file.name,
                    type: file.type,
                    data: dataUrl,
                    addedAt: new Date(),
                });
            } catch (error) {
                console.error("Error adding document:", error);
                alert("Failed to add document.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="p-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Documents & Certificates</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {documents.map(doc => (
                    <div key={doc.id} className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden aspect-square cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                        {doc.type.startsWith('image/') ? (
                             <img src={doc.data} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                <span className="text-3xl font-bold text-gray-500">{doc.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-colors flex items-end p-2">
                           <p className="text-white text-sm font-semibold truncate group-hover:opacity-100 opacity-0 transition-opacity">{doc.name}</p>
                        </div>
                    </div>
                ))}
                {documents.length === 0 && !isUploading && (
                     <div className="col-span-full text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No documents stored.</p>
                     </div>
                )}
                 {isUploading && (
                     <div className="col-span-full text-center py-10">
                        <p className="text-indigo-500 animate-pulse">Uploading...</p>
                     </div>
                )}
            </div>

            <label htmlFor="file-upload" className="fixed bottom-20 right-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                <PlusIcon className="w-6 h-6" />
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            </label>

            {selectedDoc && <DocumentViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
        </div>
    );
};

export default Documents;