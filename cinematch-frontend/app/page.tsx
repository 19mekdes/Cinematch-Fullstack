'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Film, TrendingUp, Calendar, Sparkles } from 'lucide-react';

interface Movie {
  backdrop_path: string | null;
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
}

const API_URL = 'http://localhost:4000/api';

type Category = 'popular' | 'top_rated' | 'upcoming' | 'now_playing';

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<Category>('popular');
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (searchQuery) {
      searchMovies();
    } else {
      fetchMovies();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, category, searchQuery]);

  useEffect(() => {
    fetchFeaturedMovie();
  }, []);

  const fetchFeaturedMovie = async () => {
    try {
      const response = await fetch(`${API_URL}/movies/popular?page=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setFeaturedMovie(data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching featured movie:', error);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let url = '';
      switch (category) {
        case 'popular':
          url = `${API_URL}/movies/popular?page=${currentPage}`;
          break;
        case 'top_rated':
          url = `${API_URL}/movies/top-rated?page=${currentPage}`;
          break;
        case 'upcoming':
          url = `${API_URL}/movies/upcoming?page=${currentPage}`;
          break;
        case 'now_playing':
          url = `${API_URL}/movies/now-playing?page=${currentPage}`;
          break;
        default:
          url = `${API_URL}/movies/popular?page=${currentPage}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) {
      setSearchQuery('');
      fetchMovies();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/movies/search?query=${searchQuery}&page=${currentPage}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    searchMovies();
  };

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getImageUrl = (path: string | null, size: string = 'w500') => {
    if (!path) return '/placeholder.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'popular': return <TrendingUp className="w-5 h-5" />;
      case 'top_rated': return <Star className="w-5 h-5" />;
      case 'upcoming': return <Calendar className="w-5 h-5" />;
      case 'now_playing': return <Film className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'popular': return 'Popular Movies';
      case 'top_rated': return 'Top Rated Movies';
      case 'upcoming': return 'Coming Soon';
      case 'now_playing': return 'In Theaters';
      default: return 'Movies';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Hero Section - CENTERED */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        {featuredMovie && featuredMovie.backdrop_path ? (
          <>
            <Image
              src={getImageUrl(featuredMovie.backdrop_path, 'original')}
              alt={featuredMovie.title}
              fill
              className="object-cover brightness-40"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-b from-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-blue-900 to-slate-900" />
        )}
        
        {/* Centered Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <Film className="w-9 h-9 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-linear-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              CineMatch
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-purple-200 mb-4">
              Find your next favorite movie
            </p>
            
            <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Discover thousands of movies, create your watchlist, and get personalized recommendations tailored just for you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto w-full">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for movies by title, genre, or actor..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
            
            
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('popular')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                category === 'popular'
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => handleCategoryChange('top_rated')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                category === 'top_rated'
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Star className="w-4 h-4" />
              Top Rated
            </button>
            <button
              onClick={() => handleCategoryChange('upcoming')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                category === 'upcoming'
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Coming Soon
            </button>
            <button
              onClick={() => handleCategoryChange('now_playing')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                category === 'now_playing'
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Film className="w-4 h-4" />
              In Theaters
            </button>
          </div>
        </div>
      </div>

      {/* Movie Grid Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              {getCategoryIcon()}
              {searchQuery ? `Search Results: "${searchQuery}"` : getCategoryTitle()}
            </h2>
            <p className="text-gray-400 mt-2">
              {searchQuery ? `Found ${movies.length} movies matching your search` : `Explore the best ${getCategoryTitle().toLowerCase()}`}
            </p>
          </div>
          <div className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl backdrop-blur-sm">
            <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No movies found. Try another search!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {movies.map((movie) => (
                <Link key={movie.id} href={`/movie/${movie.id}`}>
                  <div className="group relative bg-slate-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                    <div className="relative aspect-2/3 overflow-hidden">
                      <Image
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-white truncate text-sm md:text-base group-hover:text-purple-400 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-400 text-xs">
                          {movie.release_date?.split('-')[0] || 'TBA'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  ← Previous
                </button>
                
                <div className="flex gap-1">
                  {(() => {
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, startPage + 4);
                    
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) pages.push(<span key="dots1" className="px-2 text-gray-400">...</span>);
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            currentPage === i
                              ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="px-2 text-gray-400">...</span>);
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 CineMatch. All movie data provided by TMDB.
          </p>
        </div>
      </footer>
    </div>
  );
} 