import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPopularMovies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/movies/search?query=marvel`);
      
      if (response.data.success) {
        setMovies(response.data.results.slice(0, 12));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Make sure backend is running on port 5001.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularMovies();
  }, [fetchPopularMovies]);

  if (loading) {
    return <div className="loading">Loading popular movies...</div>;
  }

  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero text-center">
        <div className="container">
          <h1 className="display-4">Welcome to Movie Social Network</h1>
          <p className="lead">Discover, search, and explore thousands of movies</p>
          <Link to="/search" className="btn btn-light btn-lg mt-3">
            Start Searching
          </Link>
        </div>
      </div>

      {/* Popular Movies */}
      <div className="container">
        <h2 className="mb-4">Popular Movies</h2>
        <div className="movie-grid">
          {movies.map(movie => (
            <Link 
              to={`/movie/${movie.id}`} 
              key={movie.id} 
              className="text-decoration-none"
            >
              <div className="card movie-card">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://via.placeholder.com/500x750?text=No+Image'
                  }
                  className="card-img-top movie-poster"
                  alt={movie.title}
                />
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <p className="card-text text-muted">
                    {movie.release_date?.substring(0, 4) || 'N/A'}
                  </p>
                  {movie.vote_average > 0 && (
                    <span className="badge bg-warning text-dark">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;