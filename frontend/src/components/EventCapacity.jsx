import React, { useEffect, useState } from "react";
import axios from "axios";

function EventCapacity() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEventCapacity = async () => {
      try {
        const response = await axios.get("http://localhost:8081/user/event-capacity");
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch event capacity:", error);
      }
    };

    fetchEventCapacity();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Event Capacity</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Event Title</th>
            <th>Location</th>
            <th>Starting Date</th>
            <th>End Date</th>
            <th>Max Participants</th>
            <th>Attendees</th>
            <th>Capacity Filled (%)</th>
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
              <td>{event.percentageFilled}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventCapacity;
