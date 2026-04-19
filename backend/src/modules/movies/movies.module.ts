import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TmdbApi } from './tmdb.api';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, TmdbApi],
  exports: [MoviesService],
})
export class MoviesModule {}
