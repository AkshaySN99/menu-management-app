// create-menu.dto.ts
export class CreateMenuDto {
    name: string;
    parentId?: string | null;
    depth: number;
  }
  
  // update-menu.dto.ts
  export class UpdateMenuDto {
    name?: string;
    parentId?: string;
    depth?: number;
  }
  
  // menu.response.dto.ts
  export class MenuResponseDto {
    id: string;
    name: string;
    parentId?: string;
    depth: number;
    children: MenuResponseDto[];
  }
  