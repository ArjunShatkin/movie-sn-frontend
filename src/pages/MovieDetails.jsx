import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function MovieDetails({ currentUser }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    spoilers: false
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/movies/${id}`);

      if (response.data.success) {
        setMovie(response.data.movie);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setError('Failed to load movie details');
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/movie/${id}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const checkIfFavorite = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/favorites/user/${currentUser._id}`);
      if (response.data.success) {
        const favorite = response.data.favorites.find(fav => fav.movieId === id);
        if (favorite) {
          setIsFavorite(true);
          setFavoriteId(favorite._id);
        }
      }
    } catch (err) {
      console.error('Error checking favorite:', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      alert('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`${API_URL}/api/favorites/${favoriteId}`, {
          withCredentials: true
        });
        setIsFavorite(false);
        setFavoriteId(null);
        alert('Removed from favorites');
      } else {
        // Add to favorites
        const response = await axios.post(
          `${API_URL}/api/favorites`,
          {
            movieId: id,
            movieTitle: movie.title,
            moviePoster: movie.poster_path
          },
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setIsFavorite(true);
          setFavoriteId(response.data.favorite._id);
          alert('Added to favorites!');
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites');
    }
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
    checkIfFavorite();
  }, [id, currentUser]);

  const handleReviewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Please login to write a review');
      return;
    }

    if (currentUser.role !== 'reviewer') {
      alert('Only reviewers can write detailed reviews');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/reviews`,
        {
          movieId: id,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
          ...reviewForm
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setReviews([response.data.review, ...reviews]);
        setReviewForm({
          rating: 5,
          title: '',
          content: '',
          spoilers: false
        });
        setShowReviewForm(false);
        alert('Review posted successfully!');
      }
    } catch (err) {
      console.error('Error posting review:', err);
      alert('Failed to post review');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!movie) return <div className="alert alert-warning m-3">Movie not found</div>;

  return (
    <div className="container mt-5">
      <Link to="/search" className="btn btn-secondary mb-4">← Back to Search</Link>
      
      <div className="row">
        <div className="col-md-4">
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image'
            }
            alt={movie.title}
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-8">
          <h1>{movie.title}</h1>
          <p className="text-muted">
            {movie.release_date?.substring(0, 4)} • {movie.runtime} min
          </p>
          
          {movie.vote_average > 0 && (
            <h4>
              <span className="badge bg-warning text-dark">
                ⭐ {movie.vote_average.toFixed(1)}/10
              </span>
            </h4>
          )}

          <h5 className="mt-4">Overview</h5>
          <p>{movie.overview}</p>

          {movie.genres && movie.genres.length > 0 && (
            <>
              <h5 className="mt-4">Genres</h5>
              <div>
                {movie.genres.map(genre => (
                  <span key={genre.id} className="badge bg-primary me-2">
                    {genre.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Favorite Button */}
          <div className="mt-4">
            <button
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={handleToggleFavorite}
            >
              {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
            </button>
          </div>

          {movie.budget > 0 && (
            <p className="mt-4">
              <strong>Budget:</strong> ${movie.budget.toLocaleString()}
            </p>
          )}

          {movie.revenue > 0 && (
            <p>
              <strong>Revenue:</strong> ${movie.revenue.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Reviews ({reviews.length})</h3>
            {currentUser && currentUser.role === 'reviewer' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="card mb-4">
              <div className="card-body">
                <h5>Write Your Review</h5>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label">Rating (1-10)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="rating"
                      min="1"
                      max="10"
                      value={reviewForm.rating}
                      onChange={handleReviewChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Review Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={reviewForm.title}
                      onChange={handleReviewChange}
                      required
                      placeholder="Sum up your review in one line"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Review</label>
                    <textarea
                      className="form-control"
                      name="content"
                      rows="5"
                      value={reviewForm.content}
                      onChange={handleReviewChange}
                      required
                      placeholder="Share your thoughts about this movie..."
                    ></textarea>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="spoilers"
                      name="spoilers"
                      checked={reviewForm.spoilers}
                      onChange={handleReviewChange}
                    />
                    <label className="form-check-label" htmlFor="spoilers">
                      Contains spoilers
                    </label>
                  </div>

                  <button type="submit" className="btn btn-success">
                    Post Review
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Display Reviews */}
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review this movie!</p>
          ) : (
            <div>
              {reviews.map(review => (
                <div key={review._id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title">{review.title}</h5>
                        <p className="text-muted small">
                          By{' '}
                          <Link to={`/profile/${review.userId._id}`}>
                            {review.userId.username}
                          </Link>
                          {' '}• {new Date(review.createdAt).toLocaleDateString()}
                          {review.spoilers && (
                            <span className="badge bg-danger ms-2">Spoilers</span>
                          )}
                        </p>
                      </div>
                      <span className="badge bg-warning text-dark">
                        ⭐ {review.rating}/10
                      </span>
                    </div>
                    <p className="card-text mt-2">{review.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;