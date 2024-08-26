import React, { useEffect, useState } from "react";
import axios from "axios";

function TopEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTopEvents = async () => {
      try {
        const response = await axios.get("https://eventmanagement-1-a7zk.onrender.com/user/top-events");
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch top events:", error);
      }
    };

    fetchTopEvents();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Top 5 Most Popular Events</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Event Title</th>
            <th>Location</th>
            <th>Starting Date</th>
            <th>End Date</th>
            <th>Max Participants</th>
            <th>Attendees</th>
            <th>Average Rating</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event._id}>
              <td>{event.title}</td>
              <td>{event.location}</td>
              <td>{new Date(event.startingdate).toLocaleDateString()}</td>
              <td>{new Date(event.enddate).toLocaleDateString()}</td>
              <td>{event.maxpeoples}</td>
              <td>{event.attendees}</td>
              <td>{event.averageRating.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopEvents;
