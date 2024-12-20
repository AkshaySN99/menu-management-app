import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuController } from './menu/menu.controller';
import { MenuService } from './menu/menu.service';
import { MenuModule } from './menu/menu.module';
import { PrismaService } from './menu/prisma/prisma.service';

@Module({
  imports: [MenuModule],
  controllers: [AppController, MenuController],
  providers: [AppService, MenuService, PrismaService],
})
export class AppModule {}
