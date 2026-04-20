import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MoviesModule } from './modules/movies/movies.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';  // ADD THIS LINE

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    WatchlistModule,
    ReviewsModule,  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}