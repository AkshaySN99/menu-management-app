import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface MenuItem {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  createdAt: string;
  updatedAt: string;
  children: MenuItem[];
}

interface MenuState {
  items: MenuItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MenuState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchMenus = createAsyncThunk('menu/fetchMenus', async () => {
  const response = await fetch('/api/menus');
  return response.json();
});

export const saveMenu = createAsyncThunk('menu/saveMenu', async (menu: MenuItem) => {
  const response = await fetch('/api/menus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menu),
  });
  return response.json();
});

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    addMenuItem: (state, action: PayloadAction<MenuItem>) => {
      state.items.push(action.payload);
    },
    updateMenuItem: (state, action: PayloadAction<MenuItem>) => {
      // Define the return type of the updateItem function as MenuItem[]
      const updateItem = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.id === action.payload.id) {
            // Merge the existing item with the updated properties from the action payload
            return { ...item, ...action.payload };
          }
          if (item.children) {
            // Recursively update children items
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };
      // Update the state items with the updated items
      state.items = updateItem(state.items);
    },
    deleteMenuItem: (state, action: PayloadAction<string>) => {
      const deleteItem = (items: MenuItem[]): MenuItem[] => {
        return items.filter((item) => {
          if (item.id === action.payload) {
            return false;
          }
          if (item.children) {
            item.children = deleteItem(item.children);
          }
          return true;
        });
      };
      state.items = deleteItem(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(saveMenu.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the state with the saved menu item
        const updateItem = (items: MenuItem[]): MenuItem[] => {
          return items.map((item) => {
            if (item.id === action.payload.id) {
              return action.payload;
            }
            if (item.children) {
              return { ...item, children: updateItem(item.children) };
            }
            return item;
          });
        };
        state.items = updateItem(state.items);
      });
  },
});

export const { addMenuItem, updateMenuItem, deleteMenuItem } = menuSlice.actions;

export const selectMenuItems = (state: RootState) => state.menu.items;

export default menuSlice.reducer;

export type { MenuItem as MenuItemType};

