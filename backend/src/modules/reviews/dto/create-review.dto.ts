import { IsInt, IsString, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  movieId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(3)
  comment: string;
}