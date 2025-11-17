
import React, { useState, useMemo } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { useDb } from '../hooks/useDb';
import type { ReferenceCategory, ReferenceItem } from '../types';
import { PlusIcon } from './icons';

// Editor for a reference item (formula, note, etc.)
const ItemEditor: React.FC<{
    item: Partial<ReferenceItem>;
    onSave: (item: Partial<ReferenceItem>) => void;
    onCancel: () => void;
    onDelete?: () => void;
}> = ({ item, onSave, onCancel, onDelete }) => {
    const [title, setTitle] = useState(item.title || '');
    const [content, setContent] = useState(item.content || '');

    const handleSave = () => {
        if (!title.trim()) {
            alert('Title is required.');
            return;
        }
        onSave({ ...item, title, content });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl p-6 space-y-4 animate-scale-in">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{item.id ? 'Edit Item' : 'New Item'}</h2>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title (e.g., Pythagorean Theorem)"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Content (e.g., a² + b² = c²)"
                    rows={8}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="flex justify-end space-x-3">
                    {item.id && onDelete && (
                        <button onClick={onDelete} className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">Delete</button>
                    )}
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save</button>
                </div>
            </div>
        </div>
    );
};


// View for a single category's items
const CategoryDetailView: React.FC<{
    category: ReferenceCategory;
    onBack: () => void;
    items: ReferenceItem[];
    addItem: (item: Omit<ReferenceItem, 'id' | 'profileId'>) => Promise<void>;
    updateItem: (item: ReferenceItem) => Promise<void>;
    removeItem: (id: number) => Promise<void>;
}> = ({ category, onBack, items, addItem, updateItem, removeItem }) => {
    const [selectedItem, setSelectedItem] = useState<Partial<ReferenceItem> | null>(null);

    const handleSaveItem = async (item: Partial<ReferenceItem>) => {
        const now = new Date();
        if (item.id) {
            const existingItem = items.find(i => i.id === item.id);
            if (existingItem) {
                await updateItem({ ...existingItem, ...item, updatedAt: now } as ReferenceItem);
            }
        } else {
            await addItem({
                categoryId: category.id,
                title: item.title || 'Untitled',
                content: item.content || '',
                createdAt: now,
                updatedAt: now,
            });
        }
        setSelectedItem(null);
    };
    
    const handleDeleteItem = async () => {
        if(selectedItem?.id) {
            await removeItem(selectedItem.id);
            setSelectedItem(null);
        }
    };

    return (
        <div className="p-4 pb-20">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="mr-2 p-1 text-2xl">&larr;</button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{category.name}</h1>
            </div>

            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-wrap line-clamp-3">{item.content}</p>
                    </div>
                ))}
                 {items.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No items in this category yet.</p>
                    </div>
                )}
            </div>
            
            <button
                onClick={() => setSelectedItem({})}
                className="fixed bottom-20 right-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
                aria-label="Add new item"
            >
                <PlusIcon className="w-6 h-6" />
            </button>

            {selectedItem && (
                <ItemEditor
                    item={selectedItem}
                    onSave={handleSaveItem}
                    onCancel={() => setSelectedItem(null)}
                    onDelete={handleDeleteItem}
                />
            )}
        </div>
    );
};

// Main component for the Formula Book
const FormulaBook: React.FC = () => {
    const { currentProfile, setView } = useProfile();
    const { data: categories, add: addCategory, remove: removeCategory } = useDb<ReferenceCategory>('referenceCategories', currentProfile?.id);
    const { data: allItems, add: addItem, update: updateItem, remove: removeItem } = useDb<ReferenceItem>('referenceItems', currentProfile?.id);
    
    const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    const itemsByCategoryId = useMemo(() => {
        const map = new Map<number, number>();
        allItems.forEach(item => {
            map.set(item.categoryId, (map.get(item.categoryId) || 0) + 1);
        });
        return map;
    }, [allItems]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        await addCategory({ name: newCategoryName.trim(), createdAt: new Date() });
        setNewCategoryName('');
    };
    
    const handleDeleteCategory = async (categoryId: number) => {
        if (!window.confirm("Are you sure? This will delete the category and all items within it.")) return;
        
        // Delete all items in the category first
        const itemsToDelete = allItems.filter(item => item.categoryId === categoryId);
        for (const item of itemsToDelete) {
            await removeItem(item.id);
        }
        
        // Then delete the category itself
        await removeCategory(categoryId);
    };

    if (selectedCategory) {
        return <CategoryDetailView 
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            items={allItems.filter(item => item.categoryId === selectedCategory.id).sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime())}
            addItem={addItem}
            updateItem={updateItem}
            removeItem={removeItem}
        />;
    }

    return (
        <div className="p-4 pb-20">
            <div className="flex items-center mb-4">
                <button onClick={() => setView('more')} className="mr-2 p-1 text-2xl">&larr;</button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Formula & Reference Book</h1>
            </div>

            <div className="space-y-3">
                {categories.map(category => (
                    <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedCategory(category)}>
                           <h3 className="font-bold text-lg">{category.name}</h3>
                           <p className="text-sm text-gray-500">{itemsByCategoryId.get(category.id) || 0} items</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }} className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white font-semibold">Delete</button>
                    </div>
                ))}
                {categories.length === 0 && (
                     <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">Create a category to get started.</p>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Add new category (e.g., Physics)"
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button onClick={handleAddCategory} className="p-3 rounded-lg bg-indigo-600 text-white">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormulaBook;
