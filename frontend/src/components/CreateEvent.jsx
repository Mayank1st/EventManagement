import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateEvent() {
  const [username, setUsername] = useState("");
  const [formInitialized, setFormInitialized] = useState(false);
  const CreateEvent_URL = "http://localhost:8081/user/createevent";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.username) {
        setUsername(user.username);
        setFormInitialized(true);
      }
    };

    fetchUserData();
  }, []);

  const formik = useFormik({
    initialValues: {
      creator: username,
      title: "",
      location: "",
      startingdate: "",
      enddate: "",
      maxpeoples: "",
    },
    enableReinitialize: true,
    onSubmit: async (values, actions) => {
      try {
        // Extract token from localStorage
        const localStorageData = JSON.parse(localStorage.getItem("user"));
        const token = localStorageData ? localStorageData.token : null;

        const response = await axios.post(CreateEvent_URL, values, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response Data:", response.data);

        alert(response.data.message);
        actions.resetForm();
        navigate("/eventlog");
      } catch (error) {
        console.error("Event Creation failed:", error.response?.data || error.message);
      }
    },
  });

  if (!formInitialized) return <div>Loading...</div>;

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "#000",
        paddingTop: "60px",
        margin: 0,
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "400px",
          borderRadius: "15px",
          backgroundColor: "#000",
          color: "#fff",
          borderColor: "lightSkyBlue",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{
            fontFamily: "Poppins, sans-serif",
            color: "lightSkyBlue",
          }}
        >
          Create Event Form
        </h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="creator" className="form-label" style={{ color: "lightSkyBlue" }}>
              Creator
            </label>
            <input
              type="text"
              className="form-control"
              id="creator"
              name="creator"
              value={formik.values.creator}
              readOnly
              style={{
                backgroundColor: "#333",
                color: "#fff",
                borderColor: "lightSkyBlue",
              }}
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="title" className="form-label" style={{ color: "lightSkyBlue" }}>
              Event Title
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              onChange={formik.handleChange}
              value={formik.values.title}
              placeholder="Enter the event title"
              style={{
                backgroundColor: "#333",
                color: "#fff",
                borderColor: "lightSkyBlue",
              }}
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="location" className="form-label" style={{ color: "lightSkyBlue" }}>
              Location
            </label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              onChange={formik.handleChange}
              value={formik.values.location}
              placeholder="Enter the event location"
              style={{
                backgroundColor: "#333",
                color: "#fff",
                borderColor: "lightSkyBlue",
              }}
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="startingdate" className="form-label" style={{ color: "lightSkyBlue" }}>
              Starting Date
            </label>
            <input
              type="date"
              className="form-control"
              id="startingdate"
              name="startingdate"
              onChange={formik.handleChange}
              value={formik.values.startingdate}
              placeholder="Enter the starting date"
              style={{
                backgroundColor: "#333",
                color: "#fff",
                borderColor: "lightSkyBlue",
              }}
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="enddate" className="form-label" style={{ color: "lightSkyBlue" }}>
              End Date
            </label>
            <input
              type="date"
              className="form-control"
              id="enddate"
              name="enddate"
              onChange={formik.handleChange}
              value={formik.values.enddate}
              placeholder="Enter the end date"
              style={{
                backgroundColor: "#333",
                color: "#fff",
                borderColor: "lightSkyBlue",
              }}
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="maxpeoples" className="form-label" style={{ color: "lightSkyBlue" }}>
              Maximum Number of Participants
            </label>
            <input
              type="number"
              className="form-control"
              id="maxpeoples"
              name="maxpeoples"
              onChange={formik.handleChange}
              value={formik.values.maxpeoples}
              placeholder="Enter the maximum number of participants"
              style={{
                backgroundColor: "#333",
                color: "#fff",
                borderColor: "lightSkyBlue",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              backgroundColor: "lightSkyBlue",
              borderColor: "lightSkyBlue",
              color: "#000",
            }}
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
