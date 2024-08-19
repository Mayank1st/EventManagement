import React from "react";
import { Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../components/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import Profile from "../components/Profile";
import CreateEvent from "../components/CreateEvent";
import EventLog from "../components/EventLog";

function UserRoutes() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/createevent" element={<CreateEvent />} />
        <Route path="/eventlog" element={<EventLog />} />
      </Routes>
    </div>
  );
}

export default UserRoutes;
