import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TmdbApi {
  private readonly api;
  private readonly imageBaseUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('TMDB_API_KEY');
    const baseUrl = this.configService.get<string>('TMDB_BASE_URL');
    const imageUrl = this.configService.get<string>('TMDB_IMAGE_BASE_URL');
    
    if (!apiKey) {
      throw new Error('TMDB_API_KEY is not defined in environment variables');
    }
    if (!baseUrl) {
      throw new Error('TMDB_BASE_URL is not defined in environment variables');
    }
    if (!imageUrl) {
      throw new Error('TMDB_IMAGE_BASE_URL is not defined in environment variables');
    }
    
    this.api = axios.create({
      baseURL: baseUrl,
      params: {
        api_key: apiKey,
        language: 'en-US',
      },
    });
    this.imageBaseUrl = imageUrl;
  }

  async getPopularMovies(page: number = 1) {
    const response = await this.api.get('/movie/popular', { params: { page } });
    return response.data;
  }

  async getTopRatedMovies(page: number = 1) {
    const response = await this.api.get('/movie/top_rated', { params: { page } });
    return response.data;
  }

  async getUpcomingMovies(page: number = 1) {
    const response = await this.api.get('/movie/upcoming', { params: { page } });
    return response.data;
  }

  async getNowPlayingMovies(page: number = 1) {
    const response = await this.api.get('/movie/now_playing', { params: { page } });
    return response.data;
  }

  async getMovieDetails(movieId: number) {
    const response = await this.api.get(`/movie/${movieId}`);
    return response.data;
  }

  async searchMovies(query: string, page: number = 1) {
    const response = await this.api.get('/search/movie', { params: { query, page } });
    return response.data;
  }

  // NEW: Get movie videos/trailers
  async getMovieVideos(movieId: number) {
    const response = await this.api.get(`/movie/${movieId}/videos`);
    return response.data;
  }

  getImageUrl(path: string, size: string = 'original'): string {
    if (!path) return '/placeholder-image.jpg';
    return `${this.imageBaseUrl}/${size}${path}`;
  }
}