import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Profile({ currentUser }) {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isOwnProfile = currentUser && currentUser._id === id;

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const userResponse = await axios.get(`${API_URL}/api/users/${id}`);
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
        setEditData(userResponse.data.user);
      }

      // Fetch user's reviews
      const reviewsResponse = await axios.get(`${API_URL}/api/reviews/user/${id}`);
      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.reviews);
      }

      // Fetch user's favorites
      const favoritesResponse = await axios.get(`${API_URL}/api/favorites/user/${id}`);
      if (favoritesResponse.data.success) {
        setFavorites(favoritesResponse.data.favorites);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/users/${id}`,
        editData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="container mt-5"><div className="alert alert-warning">User not found</div></div>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        {/* User Info Card */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <div 
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                  style={{ width: '100px', height: '100px', fontSize: '48px' }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {!editing ? (
                <>
                  <h3>{user.username}</h3>
                  <p className="text-muted">
                    <span className="badge bg-info">
                      {user.role === 'reviewer' ? 'Reviewer' : 'Casual User'}
                    </span>
                  </p>

                  {(isOwnProfile || user.emailPublic) && (
                    <p className="text-muted">
                      <i className="bi bi-envelope"></i> {user.email}
                    </p>
                  )}

                  {user.role === 'reviewer' && user.bio && (
                    <div className="mt-3">
                      <h6>Bio</h6>
                      <p>{user.bio}</p>
                    </div>
                  )}

                  {user.role === 'casual' && user.favoriteGenre && (
                    <div className="mt-3">
                      <h6>Favorite Genre</h6>
                      <p>{user.favoriteGenre}</p>
                    </div>
                  )}

                  <p className="text-muted small mt-3">
                    Joined {new Date(user.joinedDate).toLocaleDateString()}
                  </p>

                  {isOwnProfile && (
                    <button 
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </>
              ) : (
                <div className="text-start">
                  <h5 className="text-center mb-3">Edit Profile</h5>

                  {user.role === 'reviewer' && (
                    <div className="mb-3">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        rows="3"
                        value={editData.bio || ''}
                        onChange={handleEditChange}
                      ></textarea>
                    </div>
                  )}

                  {user.role === 'casual' && (
                    <div className="mb-3">
                      <label className="form-label">Favorite Genre</label>
                      <select
                        className="form-control"
                        name="favoriteGenre"
                        value={editData.favoriteGenre || ''}
                        onChange={handleEditChange}
                      >
                        <option value="">Select...</option>
                        <option value="Action">Action</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Drama">Drama</option>
                        <option value="Horror">Horror</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Romance">Romance</option>
                        <option value="Thriller">Thriller</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      <input
                        type="checkbox"
                        name="emailPublic"
                        checked={editData.emailPublic || false}
                        onChange={(e) => setEditData({...editData, emailPublic: e.target.checked})}
                      />
                      {' '}Make email public
                    </label>
                  </div>

                  <button 
                    className="btn btn-success btn-sm me-2"
                    onClick={handleSaveProfile}
                  >
                    Save
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditing(false);
                      setEditData(user);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews and Favorites */}
        <div className="col-md-8">
          {/* Reviews Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title">
                Reviews ({reviews.length})
              </h4>

              {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet</p>
              ) : (
                <div>
                  {reviews.map(review => (
                    <div key={review._id} className="border-bottom mb-3 pb-3">
                      <div className="d-flex justify-content-between">
                        <h5>
                          <Link to={`/movie/${review.movieId}`}>
                            {review.movieTitle}
                          </Link>
                        </h5>
                        <span className="badge bg-warning text-dark">
                          ⭐ {review.rating}/10
                        </span>
                      </div>
                      <h6>{review.title}</h6>
                      <p className="text-muted small">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p>{review.content.substring(0, 150)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorites Section */}
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">
                Favorite Movies ({favorites.length})
              </h4>

              {favorites.length === 0 ? (
                <p className="text-muted">No favorites yet</p>
              ) : (
                <div className="row">
                  {favorites.map(fav => (
                    <div key={fav._id} className="col-md-3 mb-3">
                      <Link to={`/movie/${fav.movieId}`}>
                        <img
                          src={
                            fav.moviePoster
                              ? `https://image.tmdb.org/t/p/w200${fav.moviePoster}`
                              : 'https://via.placeholder.com/200x300?text=No+Image'
                          }
                          alt={fav.movieTitle}
                          className="img-fluid rounded"
                        />
                        <p className="text-center mt-2 small">{fav.movieTitle}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;