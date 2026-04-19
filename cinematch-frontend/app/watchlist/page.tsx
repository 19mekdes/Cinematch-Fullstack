'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Star, Film } from 'lucide-react';

interface WatchlistMovie {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePosterPath: string | null;
  movieRating: number;
  movieReleaseDate: string;
  addedAt: string;
}

const API_URL = 'http://localhost:4000/api';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
    
    if (storedToken) {
      fetchWatchlist(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchWatchlist = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/watchlist`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setWatchlist(watchlist.filter(item => item.movieId !== movieId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return '/placeholder.jpg';
    return `https://image.tmdb.org/t/p/w200${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Your Watchlist</h1>
          <p className="text-gray-600 mb-8">Please login to view your watchlist</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Watchlist</h1>
          <p className="text-gray-600 mb-8">No movies in your watchlist yet</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
        
        <div className="grid gap-4">
          {watchlist.map((movie) => (
            <div key={movie.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Poster */}
                <Link href={`/movie/${movie.movieId}`}>
                  <div className="relative w-20 h-28 shrink-0">
                    <Image
                      src={getImageUrl(movie.moviePosterPath)}
                      alt={movie.movieTitle}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </Link>
                
                {/* Info */}
                <div className="flex-1">
                  <Link href={`/movie/${movie.movieId}`}>
                    <h2 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                      {movie.movieTitle}
                    </h2>
                  </Link>
                  
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>{movie.movieReleaseDate?.split('-')[0] || 'TBA'}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{movie.movieRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-xs mt-2">
                    Added: {new Date(movie.addedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWatchlist(movie.movieId)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}