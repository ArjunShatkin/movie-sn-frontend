import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Search() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load saved search results on mount
  useEffect(() => {
    const savedQuery = localStorage.getItem('searchQuery');
    const savedResults = localStorage.getItem('searchResults');
    
    if (savedQuery && savedResults) {
      setQuery(savedQuery);
      setMovies(JSON.parse(savedResults));
      setSearched(true);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const response = await axios.get(`${API_URL}/api/movies/search`, {
        params: { query: query }
      });

      if (response.data.success) {
        const results = response.data.results;
        setMovies(results);
        
        // Save to localStorage
        localStorage.setItem('searchQuery', query);
        localStorage.setItem('searchResults', JSON.stringify(results));
      }
      setLoading(false);
    } catch (err) {
      console.error('Search error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-5">
      <h1 className="text-center mb-4">Search Movies</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-box">
        <div className="input-group input-group-lg">
          <input
            type="text"
            className="form-control"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="loading">Searching...</div>
      )}

      {/* Results */}
      {!loading && searched && (
        <div className="mt-5">
          <h3 className="mb-4">
            {movies.length > 0 
              ? `Found ${movies.length} results for "${query}"`
              : `No results found for "${query}"`
            }
          </h3>

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
      )}
    </div>
  );
}

export default Search;