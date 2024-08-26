import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Page from "../Logs/user/page";

function UserDashboard() {
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [navbarDropdownVisible, setNavbarDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.token) {
          throw new Error("No user data found in localStorage.");
        }

        const response = await axios.get(
          `http://localhost:8081/user/user-profile`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        const photoPath = response.data.user.photo.replace(/\\/, "/");
        const imageUrl = `http://localhost:8081/${photoPath}`;

        setProfileImage(imageUrl);
        setUsername(response.data.user.username);
      } catch (error) {
        setError("Error fetching user profile.");
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
    setNavbarDropdownVisible(false);
  };

  const toggleNavbarDropdown = (e) => {
    e.stopPropagation();
    setNavbarDropdownVisible(!navbarDropdownVisible);
    setDropdownVisible(false);
  };

  const styles = {
    dashboardContainer: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
    },
    navbar: {
      backgroundColor: "#004d00",
      color: "#FFFFFF",
      padding: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "relative",
    },
    navBrandLogo: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    navLinks: {
      display: "flex",
      gap: "15px",
    },
    navLink: {
      color: "#FFFFFF",
      textDecoration: "none",
      fontSize: "1rem",
    },
    profileDropdown: {
      display: "flex",
      alignItems: "center",
      position: "relative",
    },
    profileImg: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      overflow: "hidden",
      border: "4px solid #f0f0f0",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      marginRight: "10px",
      cursor: "pointer",
    },
    dropdownContent: {
      display: navbarDropdownVisible ? "block" : "none",
      position: "absolute",
      top: "60px",
      right: "0",
      backgroundColor: "#f9f9f9",
      minWidth: "160px",
      boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
      zIndex: 1,
      padding: "10px",
      borderRadius: "5px",
      overflow: "hidden",
    },
    sidebar: {
      backgroundColor: "#e6ffe6",
      color: "#004d00",
      width: "250px",
      padding: "15px",
      position: "relative",
    },
    profileImgDiv: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      overflow: "hidden",
      border: "4px solid #f0f0f0",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      margin: "auto",
    },
    mainContent: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      color: "#333333",
      padding: "20px",
    },
    errorMessage: {
      color: "red",
    },
    dropdownNavContent: {
      display: dropdownVisible ? "block" : "none",
      position: "absolute",
      top: "60px",
      left: "0",
      backgroundColor: "#f9f9f9",
      minWidth: "160px",
      boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
      zIndex: 1,
      padding: "10px",
      borderRadius: "5px",
      overflow: "hidden",
    },
    dropdownBtn: {
      width: "100%",
      backgroundColor: "#004d00",
      color: "#FFFFFF",
      border: "none",
      padding: "10px",
      textAlign: "left",
      cursor: "pointer",
      borderRadius: "5px",
    },
    dropdownLink: {
      display: "block",
      padding: "10px",
      color: "#004d00",
      textDecoration: "none",
      borderBottom: "1px solid #ddd",
      borderRadius: "5px",
    },
    dropdownLinkHover: {
      backgroundColor: "#e6ffe6",
    },
  };

  return (
    <div
      style={styles.dashboardContainer}
      onClick={() => {
        setDropdownVisible(false);
        setNavbarDropdownVisible(false);
      }}
    >
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrandLogo}>UserPanel</div>
        <div style={styles.navLinks}>
          <Link to="/user/home" style={styles.navLink}>
            Home
          </Link>
          <Link to="/user/events" style={styles.navLink}>
            Events
          </Link>
          <Link to="/user/profile" style={styles.navLink}>
            Profile
          </Link>
        </div>
        <div style={styles.profileDropdown}>
          <div style={styles.profileImg} onClick={toggleNavbarDropdown}>
            <img
              src={profileImage || "/default-profile-image.jpg"}
              alt="User"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={styles.dropdownContent}>
            <Link to="/user/update-profile" style={styles.dropdownLink}>
              Update Profile
            </Link>
            <Link to="/user/logout" style={styles.dropdownLink}>
              Logout
            </Link>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div style={{ display: "flex" }}>
        <aside style={styles.sidebar}>
          <div>
            <div style={styles.profileImgDiv}>
              <img
                src={profileImage || "/default-profile-image.jpg"}
                alt="User"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <button style={styles.dropdownBtn} onClick={toggleDropdown}>
              User Menu
            </button>
            <div style={styles.dropdownNavContent}>
              <Link to="/user/manage-event" style={styles.dropdownLink}>
                Manage Events
              </Link>
              <Link to="/create-event" style={styles.dropdownLink}>
                Create Event
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <h1>Welcome, {username}</h1>
          {error && <p style={styles.errorMessage}>{error}</p>}
          <Page />
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;
