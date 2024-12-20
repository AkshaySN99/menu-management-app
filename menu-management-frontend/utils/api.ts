const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface MenuItem {
  id?: string;
  name: string;
  parentId: string | null;
  depth: number;
  children: MenuItem[];
}

// DTOs for creating and updating menu items
export type CreateMenuDto = Omit<MenuItem, 'id' | 'children'>;
export type UpdateMenuDto = Partial<Omit<MenuItem, 'children'>>;

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const response = await fetch(`${API_URL}/menus`);
  if (!response.ok) {
    const errorDetails = await response.json();
    throw new Error(`Failed to get all menus: ${errorDetails.message || response.statusText}`);
  }
  return response.json();
}

export async function addMenuItem(item: CreateMenuDto): Promise<MenuItem> {
  const response = await fetch(`${API_URL}/menus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error('Failed to add menu item');
  }

  return response.json();
}

export async function updateMenuItem(id: string, item: MenuItem): Promise<MenuItem> {
  const response = await fetch(`${API_URL}/menus/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }

  return response.json();
}

export async function deleteMenuItem(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/menus/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
}

