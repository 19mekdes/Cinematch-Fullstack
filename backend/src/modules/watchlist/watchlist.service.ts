import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  async addToWatchlist(userId: number, movieData: {
    movieId: number;
    movieTitle: string;
    moviePosterPath?: string;
    movieRating?: number;
    movieReleaseDate?: string;
    notes?: string;
  }) {
    const existing = await this.prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: movieData.movieId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Movie already in watchlist');
    }

    return this.prisma.watchlist.create({
      data: {
        userId,
        movieId: movieData.movieId,
        movieTitle: movieData.movieTitle,
        moviePosterPath: movieData.moviePosterPath,
        movieRating: movieData.movieRating,
        movieReleaseDate: movieData.movieReleaseDate,
        notes: movieData.notes,
      },
    });
  }

  async removeFromWatchlist(userId: number, movieId: number) {
    try {
      await this.prisma.watchlist.delete({
        where: {
          userId_movieId: {
            userId,
            movieId,
          },
        },
      });
      return { message: 'Movie removed from watchlist' };
    } catch (error) {
      throw new NotFoundException('Movie not found in watchlist');
    }
  }

  async getUserWatchlist(userId: number) {
    return this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });
  }
}
