import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("User"); // Default role
  const Registration_URL = "http://localhost:8081/user/register";
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      photo: null,
      role: "User", // Default role with proper capitalization
    },
    onSubmit: async (values, actions) => {
      console.log("Form Values:", values); // Log form values for debugging
      try {
        const formData = new FormData();
        formData.append("username", values.username);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("confirmPassword", values.confirmPassword);
        formData.append("role", values.role); // Include the role in form data
        if (values.photo) {
          formData.append("photo", values.photo);
        }

        const response = await axios.post(Registration_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Server response:", response.data);
        alert(response.data.message);
        actions.resetForm();
        navigate("/login");
      } catch (error) {
        console.error(
          "Registration failed:",
          error.response?.data || error.message
        );
        alert("Registration failed. Please try again.");
      }
    },
  });

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
        paddingTop: "60px", 
        margin: 0,
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ width: "400px", borderRadius: "15px" }}
      >
        <h2
          className="text-center mb-4"
          style={{ fontFamily: "Poppins, sans-serif", color: "#333" }}
        >
          Register
        </h2>
        <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
          <div className="form-group mb-3">
            <label htmlFor="role" className="form-label">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="form-control"
              onChange={(e) => {
                formik.setFieldValue("role", e.target.value);
                setRole(e.target.value); // Update role state
              }}
              value={formik.values.role}
            >
              <option value="User">User</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              onChange={formik.handleChange}
              value={formik.values.username}
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              placeholder="Confirm your password"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="photo" className="form-label">
              Profile Image
            </label>
            <input
              type="file"
              className="form-control"
              id="photo"
              name="photo"
              onChange={(event) => {
                formik.setFieldValue("photo", event.currentTarget.files[0]);
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ backgroundColor: "#333", borderColor: "#333" }}
          >
            Register
          </button>
        </form>
        <p className="text-center mt-3" style={{ color: "#555" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#333", textDecoration: "none" }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
