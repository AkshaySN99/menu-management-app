import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddMenuItemProps {
  parentName: string;
  depth: number;
  onAdd: (name: string) => void;
  onClose: () => void;
}

const AddMenuItem: React.FC<AddMenuItemProps> = ({ parentName, depth, onAdd, onClose }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Add Menu Item</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Menu</label>
          <input
            type="text"
            value={parentName}
            readOnly
            className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Depth</label>
          <input
            type="number"
            value={depth}
            readOnly
            className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm"
            placeholder="Enter menu item name"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-800 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default AddMenuItem;

