import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../components/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import Profile from "../components/Profile";
import EventLog from "../components/EventLog";
import User from "../components/Dashboards/User";
import Admin from "../components/Dashboards/Admin";
import Organizer from "../components/Dashboards/Organizer";
import CreateEvent from "../components/CreateEvent";
import ManageUsers from "../components/Logs/admin/ManageUsers";

function UserRoutes() {
  const location = useLocation();

  // Determine if Navbar should be displayed
  const showNavbar = !(
    location.pathname === "/user-dashboard" ||
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/organizer-dashboard"
  );

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        {/* <Route path="/organizer/manage-events" element={<CreateEvent />} /> */}
        <Route path="/eventlog" element={<EventLog />} />
        <Route path="/user-dashboard" element={<User />} />
        <Route path="/admin-dashboard" element={<Admin />} />
        <Route path="/organizer-dashboard" element={<Organizer />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
      </Routes>
    </div>
  );
}

export default UserRoutes;
