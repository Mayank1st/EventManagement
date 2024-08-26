import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const Login_URL = "https://eventmanagement-1-a7zk.onrender.com/user/login";
  // const Login_URL = "http://localhost:8081/user/login";

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values, action) => {
      try {
        const response = await axios.post(Login_URL, values);

        const userData = {
          email: values.email,
          token: response.data.token,
          userId: response.data.userId,
          roles: response.data.roles,
          username: response.data.username,
        };

        console.log(userData);

        localStorage.setItem("user", JSON.stringify(userData));
        alert(response.data.message);
        action.resetForm();
        setErrorMessage("");

        // Navigate based on role
        if (response.data.roles.includes("Admin")) {
          navigate("/admin-dashboard");
        } else if (response.data.roles.includes("Organizer")) {
          navigate("/organizer-dashboard");
        } else {
          navigate("/user-dashboard");
        }

        window.location.reload();
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Login failed. Please try again."
        );
        console.error("Login failed:", error.response?.data || error.message);
      }
    },
  });

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
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
          Login
        </h2>
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ backgroundColor: "#333", borderColor: "#333" }}
          >
            Login
          </button>
        </form>
        <p className="text-center mt-3" style={{ color: "#555" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#333", textDecoration: "none" }}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
