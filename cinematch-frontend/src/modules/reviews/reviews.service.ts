import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: number, movieId: number, rating: number, comment: string) {
    // Validate inputs
    if (!movieId) {
      throw new BadRequestException('Movie ID is required');
    }
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    if (!comment || comment.trim().length < 3) {
      throw new BadRequestException('Comment must be at least 3 characters');
    }

    // Check if user already reviewed this movie
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this movie');
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        userId,
        movieId,
        rating,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return review;
  }

  async getMovieReviews(movieId: number) {
    if (!movieId) {
      return [];
    }

    const reviews = await this.prisma.review.findMany({
      where: { movieId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return reviews;
  }

  async getUserReview(userId: number, movieId: number) {
    if (!userId || !movieId) {
      return null;
    }

    const review = await this.prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    return review;
  }

  async updateReview(userId: number, movieId: number, rating?: number, comment?: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updateData: any = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }
      updateData.rating = rating;
    }
    if (comment !== undefined) {
      if (comment.trim().length < 3) {
        throw new BadRequestException('Comment must be at least 3 characters');
      }
      updateData.comment = comment.trim();
    }

    const updated = await this.prisma.review.update({
      where: { id: review.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteReview(userId: number, movieId: number) {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.delete({
      where: { id: review.id },
    });

    return { message: 'Review deleted successfully' };
  }

  async likeReview(reviewId: number) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        likes: { increment: 1 },
      },
    });

    return updated;
  }

  async getAverageRating(movieId: number) {
    if (!movieId) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const result = await this.prisma.review.aggregate({
      where: { movieId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      averageRating: Number(result._avg.rating) || 0,
      totalReviews: result._count,
    };
  }
}