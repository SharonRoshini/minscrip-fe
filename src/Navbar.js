import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/upload-csv">Don’t Have API?</Link>
      </div>
    </nav>
  );
}
