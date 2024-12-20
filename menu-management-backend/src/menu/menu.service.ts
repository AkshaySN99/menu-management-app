// menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getAllMenus() {
    const menus = await this.prisma.menu.findMany({
      where: {
        parentId: null, // Fetch root-level menus
      },
      include: {
        children: true, // Include child items recursively
      },
    });

    for (const menu of menus) {
        menu.children = await this.getChildMenusByParentId(menu.id);
      }
    
      return menus;
  }

  async getChildMenusByParentId(parentId: string) {
    // Query the Menu table to get child menus
    const childMenus = await this.prisma.menu.findMany({
      where: {
        parentId: parentId, // Filter by the parentId
      },
      include: {
        children: true, // Include child menus recursively (if necessary)
      },
    });

    for (const menu of childMenus) {
        menu.children = await this.getChildMenusByParentId(menu.id);
      }

    return childMenus;
  }

  async getMenuById(id: string) {
    return this.prisma.menu.findUnique({
      where: { id },
      include: {
        children: true, // Fetch child items if needed
      },
    });
  }
  async createMenu(createMenuDto: CreateMenuDto) {
    const { parentId, ...data } = createMenuDto;
    return this.prisma.menu.create({
      data: {
        ...data,
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });
  }

  async updateMenu(id: string, updateMenuDto: UpdateMenuDto) {
    const { parentId, ...data } = updateMenuDto;
    return this.prisma.menu.update({
      where: { id },
      data: {
        ...data,
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });
  }

  async deleteMenu(id: string) {
    // Deleting a menu will automatically handle children if the DB has ON DELETE CASCADE
    return this.prisma.menu.delete({
      where: { id },
    });
  }

  async saveMenu() {
    // Implement functionality to save menus (e.g., batch save or backup)
  }
}
