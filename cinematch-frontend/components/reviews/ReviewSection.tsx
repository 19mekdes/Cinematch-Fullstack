'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';

interface Review {
  id: number;
  userId: number;
  movieId: number;
  rating: number;
  comment: string;
  likes: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
}

interface ReviewSectionProps {
  movieId: number;
  token: string | null;
}

const API_URL = 'http://localhost:4000/api';

export default function ReviewSection({ movieId, token }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
    if (token) {
      fetchUserReview();
    }
  }, [movieId, token]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/movie/${movieId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/movie/${movieId}/average`);
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const fetchUserReview = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/reviews/my/${movieId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const text = await response.text();
      if (text && text.length > 0) {
        try {
          const data = JSON.parse(text);
          if (data && data.id) {
            setUserReview(data);
            setRating(data.rating);
            setComment(data.comment);
          }
        } catch (e) {
          console.log('No review found');
        }
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleSubmitReview = async () => {
    setErrorMsg('');
    
    if (!token) {
      alert('Please login to leave a review');
      window.location.href = '/auth/login';
      return;
    }

    if (rating === 0) {
      setErrorMsg('Please select a rating (1-5 stars)');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Please write a comment');
      return;
    }

    if (comment.trim().length < 3) {
      setErrorMsg('Comment must be at least 3 characters');
      return;
    }

    setSubmitting(true);
    try {
      const requestBody = {
        movieId: Number(movieId),
        rating: Number(rating),
        comment: comment.trim()
      };

      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const newReview = await response.json();
        setUserReview(newReview);
        setIsEditing(false);
        fetchReviews();
        fetchAverageRating();
        setRating(0);
        setComment('');
        setErrorMsg('');
        alert('Review submitted successfully!');
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const requestBody = {
        rating: Number(rating),
        comment: comment.trim()
      };

      const response = await fetch(`${API_URL}/reviews/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const updated = await response.json();
        setUserReview(updated);
        setIsEditing(false);
        fetchReviews();
        fetchAverageRating();
        setErrorMsg('');
        alert('Review updated successfully!');
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      const response = await fetch(`${API_URL}/reviews/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setUserReview(null);
        setRating(0);
        setComment('');
        fetchReviews();
        fetchAverageRating();
        alert('Review deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleLike = async (reviewId: number) => {
    if (!token) {
      alert('Please login to like reviews');
      return;
    }

    try {
      await fetch(`${API_URL}/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchReviews();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const renderStars = (ratingValue: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`w-5 h-5 ${
                star <= ratingValue
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-gray-400'
              } ${interactive ? 'hover:scale-110 transition-transform' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            {renderStars(Math.round(averageRating))}
            <span className="text-xl font-bold text-gray-900 ml-2">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-600">({totalReviews} reviews)</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Write/Edit Review Section */}
      {!userReview || isEditing ? (
        <div className="border-t border-gray-200 pt-6 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">Your Rating</label>
            {renderStars(rating, true)}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">Your Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
              placeholder="Share your thoughts about this movie..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={userReview ? handleUpdateReview : handleSubmitReview}
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (userReview) {
                    setRating(userReview.rating);
                    setComment(userReview.comment);
                  } else {
                    setRating(0);
                    setComment('');
                  }
                }}
                className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        // User's Existing Review
        <div className="border-t border-gray-200 pt-6 mt-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userReview.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{userReview.user.name}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(userReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  {renderStars(userReview.rating)}
                </div>
                <p className="text-gray-800 mt-2 leading-relaxed">{userReview.comment}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteReview}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Reviews List */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Reviews ({reviews.length})</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{review.user.name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-800 leading-relaxed">{review.comment}</p>
                  </div>
                  <button
                    onClick={() => handleLike(review.id)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors ml-4"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{review.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}