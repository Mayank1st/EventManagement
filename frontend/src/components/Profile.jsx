import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const localStorageData = JSON.parse(localStorage.getItem("user"));
        if (!localStorageData || !localStorageData.token) {
          throw new Error("User not logged in or token missing");
        }

        const response = await axios.get("https://eventmanagement-1-a7zk.onrender.com/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorageData.token}`,
          },
        });

        const newProfileData = response.data.user;
        console.log("Fetched profile data:", newProfileData);
        setProfileData(newProfileData);

        const updatedData = {
          ...localStorageData,
          username: newProfileData.username,
          roles: newProfileData.roles, // Store roles information
        };
        localStorage.setItem("user", JSON.stringify(updatedData));

        setLoading(false);
      } catch (err) {
        console.error("Fetch profile data error:", err);
        setError(err.response ? err.response.data.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEventClick = ({ type }) => {
    if (type === "createEvent") {
      navigate("/createevent");
    } else if (type === "eventLog") {
      navigate("/eventlog");
    }
  };

  const handleImageUpload = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!profileData || !profileData._id) {
      alert("Profile data is not available. Please try again later.");
      console.log("Profile data or _id is missing:", profileData);
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const localStorageData = JSON.parse(localStorage.getItem("user"));
      const response = await axios.patch(
        `https://eventmanagement-1-a7zk.onrender.com/user/updateprofile/${profileData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorageData.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setProfileData((prev) => ({ ...prev, photo: response.data.photo }));
        alert("Profile photo updated successfully!");

        // Optionally update local storage with new photo
        const updatedData = {
          ...localStorageData,
          username: profileData.username,
          userId: profileData._id,
          roles: profileData.roles, // Ensure roles are stored
        };
        localStorage.setItem("user", JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      alert("Failed to update profile photo. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const isOrganizerOrAdmin = profileData?.roles.includes("Organizer") || profileData?.roles.includes("Admin");

  return (
    <>
      <div className="profile-card-outer-div container mt-5">
        <div className="card mb-3">
          <div className="profile-img-div">
            <img
              src={
                profileData?.photo
                  ? `https://eventmanagement-1-a7zk.onrender.com/${profileData.photo}`
                  : "https://www.svgrepo.com/show/397593/ninja-medium-skin-tone.svg"
              }
              className="card-img-top"
              alt="Profile"
            />
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              onChange={handleFileChange}
              style={{ display: "none" }} 
            />
            <img
              src="https://www.svgrepo.com/show/489869/pencil.svg"
              alt="Edit"
              onClick={handleImageUpload}
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                cursor: "pointer",
                width: "30px",
                height: "30px",
              }}
            />
          </div>
          <hr />
          <div className="card-body">
            <h5 className="card-title">{profileData?.username || "User Name"}</h5>
            <p className="card-text">Email: {profileData?.email || "User Email"}</p>
            <p className="card-text">
              <small className="text-body-secondary">
                <div className="btn-group" role="group">
                  {isOrganizerOrAdmin ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => handleEventClick({ type: "createEvent" })}
                    >
                      Create Event
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleEventClick({ type: "eventLog" })}
                  >
                    Event Log
                  </button>
                </div>
              </small>
            </p>
          </div>
        </div>
      </div>
      <h1 className="display-5 user-table-heading mt-5">User Table</h1>
      <div className="container mt-3">
        <hr />
        {/* <UserTable /> */}
      </div>
    </>
  );
}

export default Profile;
