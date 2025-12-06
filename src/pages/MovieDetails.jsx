import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!movie) return <div className="alert alert-warning m-3">Movie not found</div>;

  return (
    <div className="container mt-5">
      <Link to="/" className="btn btn-secondary mb-4">← Back to Home</Link>
      
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
    </div>
  );
}

export default MovieDetails;