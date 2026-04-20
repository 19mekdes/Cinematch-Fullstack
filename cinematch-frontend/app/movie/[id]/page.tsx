'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, Clock, Heart, ArrowLeft, Play, X } from 'lucide-react';
import ReviewSection from '@/components/reviews/ReviewSection';
interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
}
interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

const API_URL = 'http://localhost:4000/api';

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params?.id as string;
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
    
    if (movieId) {
      fetchMovieDetails();
      fetchMovieVideos();
      if (storedToken) {
        checkWatchlistStatus(storedToken);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/movies/${movieId}`);
      if (!response.ok) throw new Error('Movie not found');
      const data = await response.json();
      setMovie(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/movies/${movieId}/videos`);
      if (response.ok) {
        const data = await response.json();
        const trailers = data.results?.filter(
          (video: Video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
        ) || [];
        setVideos(trailers);
        
        if (trailers.length > 0) {
          setTrailerKey(trailers[0].key);
        }
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const checkWatchlistStatus = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/watchlist`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (response.ok) {
        const watchlist = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exists = watchlist.some((item: any) => item.movieId === parseInt(movieId));
        setIsInWatchlist(exists);
      }
    } catch (err) {
      console.error('Error checking watchlist:', err);
    }
  };

  const addToWatchlist = async () => {
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: movie?.id,
          movieTitle: movie?.title,
          moviePosterPath: movie?.poster_path,
          movieRating: movie?.vote_average,
          movieReleaseDate: movie?.release_date,
        }),
      });

      if (response.ok) {
        setIsInWatchlist(true);
        alert('Added to watchlist!');
      }
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    }
  };

  const removeFromWatchlist = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setIsInWatchlist(false);
        alert('Removed from watchlist!');
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  const openTrailer = () => {
    if (trailerKey) {
      setShowTrailer(true);
    } else {
      alert('No trailer available for this movie');
    }
  };

  const getImageUrl = (path: string | null, size: string = 'original') => {
    if (!path) return '/placeholder.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Movie Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Backdrop Image */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        {movie.backdrop_path ? (
          <Image
            src={getImageUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-blue-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>

      {/* Movie Info Container */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-2/3 rounded-lg overflow-hidden shadow-xl">
              <Image
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 30vw, 20vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-white">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-lg text-white/80 italic mb-4">{movie.tagline}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span>{movie.vote_average?.toFixed(1)}</span>
                <span className="text-white/60">({movie.vote_count?.toLocaleString()} votes)</span>
              </div>

              {movie.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              )}
               
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-white/90 leading-relaxed">{movie.overview}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {trailerKey && (
                <button
                  onClick={openTrailer}
                  className="px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Watch Trailer
                </button>
              )}
              
              <button
                onClick={isInWatchlist ? removeFromWatchlist : addToWatchlist}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  isInWatchlist
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWatchlist ? 'fill-white' : ''}`} />
                {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
            </div>

            {/* Additional Trailers Section */}
            {videos.length > 1 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">More Videos</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {videos.slice(1).map((video) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        setTrailerKey(video.key);
                        setShowTrailer(true);
                      }}
                      className="shrink-0 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {video.name.length > 30 ? video.name.substring(0, 30) + '...' : video.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection movieId={parseInt(movieId)} token={token} />
      </div>
    </div>
  );
}