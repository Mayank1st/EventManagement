import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check if a token exists in localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        setIsAuth(true);
      }
    }
  }, []);

  const handleLogout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem("user");
    setIsAuth(false);
  };

  return (
    <div className="outer-navbar-div container-fluid">
      <div className="container inner-navbar-div ">
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <Link className="navbar-brand nav-brand-logo" to="/">
              Masai
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link
                    className="nav-link active nav-anchor"
                    aria-current="page"
                    to="/"
                  >
                    Home
                  </Link>
                </li>
                {isAuth ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link nav-anchor" to="/profile">
                        Profile
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link nav-anchor"
                        to="/"
                        onClick={handleLogout}
                      >
                        Logout
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link nav-anchor" to="/register">
                        Registration
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link nav-anchor" to="/login">
                        Login
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
