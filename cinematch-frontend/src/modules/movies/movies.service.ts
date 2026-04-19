import { Injectable } from '@nestjs/common';
import { TmdbApi } from './tmdb.api';

@Injectable()
export class MoviesService {
  constructor(private tmdbApi: TmdbApi) {}

  async getPopularMovies(page: number = 1) {
    return this.tmdbApi.getPopularMovies(page);
  }

  async getTopRatedMovies(page: number = 1) {
    return this.tmdbApi.getTopRatedMovies(page);
  }

  async getUpcomingMovies(page: number = 1) {
    return this.tmdbApi.getUpcomingMovies(page);
  }

  async getNowPlayingMovies(page: number = 1) {
    return this.tmdbApi.getNowPlayingMovies(page);
  }

  async getMovieDetails(id: number) {
    return this.tmdbApi.getMovieDetails(id);
  }

  async searchMovies(query: string, page: number = 1) {
    return this.tmdbApi.searchMovies(query, page);
  }

  // NEW: Get movie videos/trailers
  async getMovieVideos(id: number) {
    return this.tmdbApi.getMovieVideos(id);
  }
}