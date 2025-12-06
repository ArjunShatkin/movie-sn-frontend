import React from 'react';

function About() {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">About Movie Social Network</h1>
      
      <div className="card">
        <div className="card-body">
          <h3>Team Members</h3>
          <ul>
            <li><strong>Your Name</strong> - Section XX</li>
            {/* Add more team members here */}
          </ul>

          <h3 className="mt-4">GitHub Repositories</h3>
          <ul>
            <li>
              <strong>Frontend:</strong>{' '}
              <a href="https://github.com/YOUR_USERNAME/movie-sn-frontend" target="_blank" rel="noopener noreferrer">
                github.com/YOUR_USERNAME/movie-sn-frontend
              </a>
            </li>
            <li>
              <strong>Backend:</strong>{' '}
              <a href="https://github.com/YOUR_USERNAME/movie-sn-backend" target="_blank" rel="noopener noreferrer">
                github.com/YOUR_USERNAME/movie-sn-backend
              </a>
            </li>
          </ul>

          <h3 className="mt-4">Project Info</h3>
          <p>
            Movie Social Network is a web application that allows users to search for movies,
            view details, and explore the world of cinema. Built with React, Node.js, Express,
            MongoDB, and the TMDB API.
          </p>

          <h3 className="mt-4">Technologies Used</h3>
          <ul>
            <li>Frontend: React + Vite</li>
            <li>Backend: Node.js + Express</li>
            <li>Database: MongoDB Atlas</li>
            <li>External API: The Movie Database (TMDB)</li>
            <li>Deployment: Vercel (Frontend) + Render (Backend)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;