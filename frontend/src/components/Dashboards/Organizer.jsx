import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Page from "../Logs/organizer/page";

function OrganizerDashboard() {
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [events, setEvents] = useState([]);
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

        // Fetch user profile
        const profileResponse = await axios.get(
          `https://eventmanagement-1-a7zk.onrender.com/user/user-profile`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        // console.log("API response:", profileResponse.data);

        // Check if the response contains the expected data
        if (profileResponse.data && profileResponse.data.user) {
          const photoPath = profileResponse.data.user.photo.replace(/\\/, "/");
          const imageUrl = `https://eventmanagement-1-a7zk.onrender.com/${photoPath}`;

          setProfileImage(imageUrl);
          setUsername(profileResponse.data.user.username);

          // Check if the roles property is defined before using it
          if (
            profileResponse.data.user.roles &&
            profileResponse.data.user.roles.includes("Organizer")
          ) {
            // Fetch events only for organizers
            const eventsResponse = await axios.get(
              `https://eventmanagement-1-a7zk.onrender.com/user/organizer-events`,
              {
                headers: {
                  Authorization: `Bearer ${userData.token}`,
                },
              }
            );

            // Check if the response contains events
            if (eventsResponse.data && eventsResponse.data.events) {
              setEvents(eventsResponse.data.events);
            } else {
              throw new Error("Invalid events response data.");
            }
          }
        } else {
          throw new Error("Invalid profile response data.");
        }
      } catch (error) {
        setError(
          `Error fetching Organizer profile or events: ${error.message}`
        );
        console.error("Error fetching Organizer profile or events:", error);
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
        <div style={styles.navBrandLogo}>OrganizerPanel</div>
        <div style={styles.navLinks}>
          <a href="/organizer/home" style={styles.navLink}>
            Home
          </a>
          <a href="/organizer/events" style={styles.navLink}>
            Events
          </a>
          <a href="/organizer/profile" style={styles.navLink}>
            Profile
          </a>
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
            <Link
              to="/organizer/profile"
              style={{ ...styles.dropdownLink, ...styles.dropdownLinkHover }}
            >
              Profile
            </Link>
            <Link
              to="/organizer/settings"
              style={{ ...styles.dropdownLink, ...styles.dropdownLinkHover }}
            >
              Settings
            </Link>
            <Link
              to="/logout"
              style={{ ...styles.dropdownLink, ...styles.dropdownLinkHover }}
            >
              Logout
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ display: "flex", flexGrow: 1 }}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.profileImgDiv}>
            <img
              src={profileImage || "/default-profile-image.jpg"}
              alt="User"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <h3>{username}</h3>
          <div style={{ position: "relative" }}>
            <button style={styles.dropdownBtn} onClick={toggleDropdown}>
              Menu
            </button>
            <div style={styles.dropdownNavContent}>
              <a href="/create-event" style={styles.dropdownLink}>
               Create Events
              </a>
              <a href="/organizer/reports" style={styles.dropdownLink}>
                Reports
              </a>
              <a href="/organizer/settings" style={styles.dropdownLink}>
                Settings
              </a>
              <a href="/logout" style={styles.dropdownLink}>
                Logout
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <h2>Organizer Dashboard</h2>
          {error && <p style={styles.errorMessage}>{error}</p>}
          <p>Manage your events and view reports here.</p>
          <Page />
        </main>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
