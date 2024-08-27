import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './Admin.css'; 

function AdminDashboard() {
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.token) {
          throw new Error("No user data found in localStorage.");
        }

        // Fetch user profile
        const profileResponse = await axios.get(
          `https://eventmanagement-1-a7zk.onrender.com/user/admin-profile`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        if (profileResponse.data && profileResponse.data.user) {
          const photoPath = profileResponse.data.user.photo.replace(/\\/, "/");
          const imageUrl = `https://eventmanagement-1-a7zk.onrender.com/${photoPath}`;

          setProfileImage(imageUrl);
          setUsername(profileResponse.data.user.username);
        } else {
          throw new Error("Invalid profile response data.");
        }

        // Fetch events
        const eventsResponse = await axios.get(
          `https://eventmanagement-1-a7zk.onrender.com/user/admin-events`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        if (eventsResponse.data && eventsResponse.data.events) {
          setEvents(eventsResponse.data.events);
        } else {
          throw new Error("Invalid events response data.");
        }
      } catch (error) {
        setError(`Error fetching Admin profile or events: ${error.message}`);
        console.error("Error fetching Admin profile or events:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="admin-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand-logo">AdminPanel</div>
        <div className="nav-links">
          <a href="/admin/home" className="nav-link">Home</a>
          <a href="/admin/events" className="nav-link">Events</a>
          <a href="/admin/profile" className="nav-link">Profile</a>
        </div>
        <div className="profile-dropdown">
          <div className="profile-img">
            <img src={profileImage || "/default-profile-image.jpg"} alt="User" />
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="admin-layout">
        <aside className="sidebar">
          <div className="profile-img-div">
            <img src={profileImage || "/default-profile-image.jpg"} alt="User" />
          </div>
          <nav className="sidebar-nav">
            <Link to="/admin/manage-event" className="sidebar-link">Manage Events</Link>
            <Link to="/create-event" className="sidebar-link">Create Event</Link>
            <Link to="/admin/reports" className="sidebar-link">Reports</Link>
            <Link to="/admin/settings" className="sidebar-link">Settings</Link>
            <Link to="/admin/manage-users" className="sidebar-link">Manage Users</Link> 
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <h1>Welcome, {username}</h1>
          {error && <p className="error-message">{error}</p>}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
