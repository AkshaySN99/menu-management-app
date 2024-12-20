import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Grid, BookmarkIcon as Breadcrumb, X, MenuIcon } from 'lucide-react';
import AddMenuItem from './AddMenuItem';
import { addMenuItem, updateMenuItem, deleteMenuItem, fetchMenuItems } from '../utils/api';

interface MenuItem {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  children: MenuItem[];
}

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [addingTo, setAddingTo] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const items = await fetchMenuItems();
      setMenuItems(items as MenuItem[]);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items. Please try again. ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: MenuItem, isLast: boolean = false, parentExpanded: boolean = true) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className={`relative ${parentExpanded ? '' : 'hidden'}`}>
        <div className="flex items-center py-1.5 group">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" style={{ left: '-1px' }}></div>
          {!isLast && (
            <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-200" style={{ left: '-1px' }}></div>
          )}
          <div className="relative">
            {hasChildren && (
              <button 
                onClick={() => toggleExpand(item.id)} 
                className="mr-1 z-10 bg-white text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
            {!hasChildren && <div className="w-4 h-4 mr-1"></div>}
          </div>
          <span 
            className={`cursor-pointer text-sm ${selectedItem?.id === item.id ? 'text-blue-800' : 'text-gray-600'} ml-1 hover:text-gray-900`}
            onClick={() => {
              setSelectedItem(item);
              setAddingTo(null);
            }}
          >
            {item.name}
          </span>
          <button 
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
            onClick={() => {
              setAddingTo(item);
              setSelectedItem(null);
            }}
          >
            <Plus size={14} />
          </button>
        </div>
        {hasChildren && (
          <div className="ml-4 relative">
            {item.children.map((child, index) => renderMenuItem(child, index === item.children.length - 1, isExpanded))}
          </div>
        )}
      </div>
    );
  };

  const handleSave = async () => {
    if (selectedItem) {
      try {
        const updatedItem = await updateMenuItem(selectedItem.id, selectedItem);
        setMenuItems(prevItems => updateItemInTree(prevItems, updatedItem as MenuItem));
        setSelectedItem(null);
      } catch (err) {
        setError('Failed to update item. Please try again. ' + err);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedItem) {
      try {
        await deleteMenuItem(selectedItem.id);
        setMenuItems(prevItems => removeItemFromTree(prevItems, selectedItem.id));
        setSelectedItem(null);
      } catch (err) {
        setError('Failed to delete item. Please try again. ' + err);
      }
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  const expandAll = () => {
    const expandRecursively = (items: MenuItem[]): string[] => {
      return items.flatMap(item => [
        item.id,
        ...(item.children ? expandRecursively(item.children) : [])
      ]);
    };
    const allIds = expandRecursively(menuItems);
    setExpandedItems(new Set(allIds));
  };

  /* const findItemById = (items: MenuItem[], id: string): MenuItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }; */

  const updateItemInTree = (items: MenuItem[], updatedItem: MenuItem): MenuItem[] => {
    return items.map(item => {
      if (item.id === updatedItem.id) {
        return { ...item, ...updatedItem };
      }
      if (item.children) {
        return { ...item, children: updateItemInTree(item.children, updatedItem) };
      }
      return item;
    });
  };

  const removeItemFromTree = (items: MenuItem[], id: string): MenuItem[] => {
    return items.filter(item => {
      if (item.id === id) {
        return false;
      }
      if (item.children) {
        item.children = removeItemFromTree(item.children, id);
      }
      return true;
    });
  };

  const handleAddNewItem = async (name: string) => {
    if (addingTo) {
      const newItem = {
        name,
        parentId: addingTo.id,
        depth: addingTo.depth + 1
      };
      try {
        const addedItem = await addMenuItem(newItem);
        setMenuItems(prevItems => updateItemInTree(prevItems, {
          ...addingTo,
          children: [...addingTo.children, addedItem as MenuItem]
        }));
        setAddingTo(null);
      } catch (err) {
        setError('Failed to add item. Please try again. ' + err);
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-1/6 bg-[#0f172a] text-gray-400 p-4`}>
        <h2 className="text-xl font-bold mb-4">Menu</h2>
      </div>
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center text-gray-500 text-sm">
              <span className="mr-2">
                <Grid size={16} />
              </span>
              <span>
                <Breadcrumb size={16} className="inline mr-2" />
              </span>
              <span>Menus</span>
            </div>
            <button
              className="md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon size={24} />
            </button>
          </div>
          <div className="flex items-center mb-8">
            <div className="bg-blue-800 p-2 rounded-full mr-3">
              <Grid className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
          </div>
          <div className="mb-6">
            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
              <option>system management</option>
            </select>
          </div>
          <div className="mb-6 flex gap-2">
            <button 
              className="bg-blue-800 text-white px-4 py-2 rounded-full text-sm font-medium" 
              onClick={expandAll}
            >
              Expand All
            </button>
            <button 
              className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200" 
              onClick={() => setExpandedItems(new Set())}
            >
              Collapse All
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-100">
            {menuItems.map((item, index) => renderMenuItem(item, index === menuItems.length - 1))}
          </div>
        </div>
        <div className="w-full md:w-1/3 p-8 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center">
          {selectedItem && (
            <div className="mb-8 max-w-sm mx-auto">
              <div className="relative bg-white p-6 rounded-lg border border-gray-100">
                <button 
                  onClick={handleClose}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Menu Item</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Menu ID</label>
                    <input 
                      type="text" 
                      value={selectedItem.id} 
                      readOnly 
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Depth</label>
                    <input 
                      type="number" 
                      value={selectedItem.depth} 
                      readOnly 
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Data</label>
                    <input 
                      type="text" 
                      value={selectedItem.parentId || 'Root'} 
                      readOnly 
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={selectedItem.name}
                      onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    className="w-full bg-blue-800 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors" 
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button 
                    className="w-full bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-900 transition-colors" 
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {addingTo && (
            <div className="mb-8 max-w-sm mx-auto">
              <AddMenuItem
                parentName={addingTo.name}
                depth={addingTo.depth + 1}
                onAdd={handleAddNewItem}
                onClose={() => setAddingTo(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;

