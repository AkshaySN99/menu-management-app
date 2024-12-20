import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Define menu items as a tree structure
  const menus = [
    {
      name: 'System Management',
      depth: 0,
      children: [
        {
          name: 'Systems',
          depth: 1,
          children: [
            {
              name: 'System Code',
              depth: 2,
              children: [
                { name: 'Code Registration', depth: 3 },
                { name: 'Code Registration - 2', depth: 3 },
              ],
            },
            { name: 'Properties', depth: 2 },
            {
              name: 'Menus',
              depth: 2,
              children: [{ name: 'Menu Registration', depth: 3 }],
            },
            {
              name: 'API List',
              depth: 2,
              children: [
                { name: 'API Registration', depth: 3 },
                { name: 'API Edit', depth: 3 },
              ],
            },
          ],
        },
        {
          name: 'Users & Groups',
          depth: 1,
          children: [
            {
              name: 'Users',
              depth: 2,
              children: [{ name: 'User Account Registration', depth: 3 }],
            },
            {
              name: 'Groups',
              depth: 2,
              children: [{ name: 'User Group Registration', depth: 3 }],
            },
          ],
        },
        { name: '사용자 승인', depth: 1 },
        { name: '사용자 승인 상세', depth: 1 },
      ],
    },
  ];

  // Recursive function to seed the menus
  async function createMenu(
    menu: { name: string; depth: number; children?: any[] },
    parentId: string | null = null
  ) {
    const createdMenu = await prisma.menu.create({
      data: {
        name: menu.name,
        depth: menu.depth,
        parentId: parentId,
      },
    });

    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        await createMenu(child, createdMenu.id);
      }
    }
  }

  // Seed the menu structure
  for (const menu of menus) {
    await createMenu(menu);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });