import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Get('popular')
  async getPopular(@Query('page') page: string) {
    return this.moviesService.getPopularMovies(page ? parseInt(page) : 1);
  }

  @Get('top-rated')
  async getTopRated(@Query('page') page: string) {
    return this.moviesService.getTopRatedMovies(page ? parseInt(page) : 1);
  }

  @Get('upcoming')
  async getUpcoming(@Query('page') page: string) {
    return this.moviesService.getUpcomingMovies(page ? parseInt(page) : 1);
  }

  @Get('now-playing')
  async getNowPlaying(@Query('page') page: string) {
    return this.moviesService.getNowPlayingMovies(page ? parseInt(page) : 1);
  }

  @Get('search')
  async search(@Query('query') query: string, @Query('page') page: string) {
    return this.moviesService.searchMovies(query, page ? parseInt(page) : 1);
  }

  @Get(':id')
  async getDetails(@Param('id') id: string) {
    return this.moviesService.getMovieDetails(parseInt(id));
  }

  // NEW: Get movie videos/trailers
  @Get(':id/videos')
  async getVideos(@Param('id') id: string) {
    return this.moviesService.getMovieVideos(parseInt(id));
  }
}