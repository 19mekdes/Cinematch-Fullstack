import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('movie/:movieId')
  async getMovieReviews(@Param('movieId') movieId: string) {
    return this.reviewsService.getMovieReviews(parseInt(movieId));
  }

  @Get('movie/:movieId/average')
  async getAverageRating(@Param('movieId') movieId: string) {
    return this.reviewsService.getAverageRating(parseInt(movieId));
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Request() req, @Body() body: CreateReviewDto) {
    return this.reviewsService.createReview(
      req.user.id,
      body.movieId,
      body.rating,
      body.comment,
    );
  }

  @Get('my/:movieId')
  @UseGuards(AuthGuard('jwt'))
  async getUserReview(@Request() req, @Param('movieId') movieId: string) {
    const review = await this.reviewsService.getUserReview(req.user.id, parseInt(movieId));
    return review;
  }

  @Put(':movieId')
  @UseGuards(AuthGuard('jwt'))
  async updateReview(
    @Request() req,
    @Param('movieId') movieId: string,
    @Body() body: { rating?: number; comment?: string },
  ) {
    return this.reviewsService.updateReview(
      req.user.id,
      parseInt(movieId),
      body.rating,
      body.comment,
    );
  }

  @Delete(':movieId')
  @UseGuards(AuthGuard('jwt'))
  async deleteReview(@Request() req, @Param('movieId') movieId: string) {
    return this.reviewsService.deleteReview(req.user.id, parseInt(movieId));
  }

  @Post(':reviewId/like')
  @UseGuards(AuthGuard('jwt'))
  async likeReview(@Param('reviewId') reviewId: string) {
    return this.reviewsService.likeReview(parseInt(reviewId));
  }
}