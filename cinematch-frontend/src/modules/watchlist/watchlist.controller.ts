import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
@UseGuards(AuthGuard('jwt'))
export class WatchlistController {
  constructor(private watchlistService: WatchlistService) {}

  @Get()
  async getWatchlist(@Request() req) {
    return this.watchlistService.getUserWatchlist(req.user.id);
  }

  @Post()
  async addToWatchlist(@Request() req, @Body() body) {
    return this.watchlistService.addToWatchlist(req.user.id, body);
  }

  @Delete(':movieId')
  async removeFromWatchlist(@Request() req, @Param('movieId') movieId: string) {
    return this.watchlistService.removeFromWatchlist(req.user.id, parseInt(movieId));
  }
}
