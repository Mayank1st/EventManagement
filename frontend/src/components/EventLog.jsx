import axios from "axios";
import { useEffect, useState } from "react";

function EventLog() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState("");
  const [creatorMap, setCreatorMap] = useState({});
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedEvents, setAppliedEvents] = useState(new Set());
  const [editEvent, setEditEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    maxpeoples: "",
    startingdate: "",
    enddate: "",
  });
  const [userRole, setUserRole] = useState(""); 
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://eventmanagement-1-a7zk.onrender.com/user/event-capacity"
        );
        setEvents(Array.isArray(response.data) ? response.data : []);

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUserId(storedUser.userId);
          setUserRole(storedUser.role); 
          setAppliedEvents(new Set(storedUser.appliedEvents || []));
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await axios.get("https://eventmanagement-1-a7zk.onrender.com/user/users");
        const creators = Array.isArray(response.data) ? response.data : [];

        const creatorMap = creators.reduce((map, user) => {
          if (user._id && user.username) {
            map[user._id] = user.username;
          }
          return map;
        }, {});

        setCreatorMap(creatorMap);
      } catch (error) {
        console.error("Error fetching creators:", error);
      }
    };

    fetchCreators();
  }, []);

  useEffect(() => {
    const fetchTopEvents = async () => {
      try {
        const response = await axios.get(
          "https://eventmanagement-1-a7zk.onrender.com/user/top-events"
        );
        setTopEvents(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching top events:", error);
      }
    };

    fetchTopEvents();
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (userId) {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const response = await axios.get(
            "https://eventmanagement-1-a7zk.onrender.com/user/myevents",
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          console.log("User events response:", response.data.events);
          setFilteredEvents(
            Array.isArray(response.data.events) ? response.data.events : []
          );
        } catch (error) {
          console.error(
            "Failed to fetch user events:",
            error.response?.data || error.message
          );
        }
      }
    };

    fetchUserEvents();
  }, [userId]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleEditClick = (event) => {
    setEditEvent(event);
    setFormData({
      title: event.title,
      location: event.location,
      maxpeoples: event.maxpeoples,
      startingdate: event.startingdate,
      enddate: event.enddate,
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdateEvent = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await axios.put(
        `https://eventmanagement-1-a7zk.onrender.com/user/updateevent/${editEvent._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.data.status === "success") {
        const updatedEvents = filteredEvents.map((event) =>
          event._id === editEvent._id ? response.data.event : event
        );
        setFilteredEvents(updatedEvents);
        setEditEvent(null);
      }
    } catch (error) {
      console.error(
        "Error updating event:",
        error.response?.data || error.message
      );
    }
  };

  const getCapacityFilledPercentage = (event) => {
    if (event.maxpeoples > 0) {
      const percentage = (event.attendees.length / event.maxpeoples) * 100;
      return isFinite(percentage) ? percentage.toFixed(2) : "N/A";
    }
    return "N/A";
  };

  // Group events by creator
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    if (!acc[event.creator]) {
      acc[event.creator] = [];
    }
    acc[event.creator].push(event);
    return acc;
  }, {});

  return (
    <div className="container-fluid main-div">
      <div className="container mt-5">
        <div className="form-group mb-4">
          <label htmlFor="eventFilter" className="form-label">
            Filter Events
          </label>
          <select
            id="eventFilter"
            className="form-select"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="all">All Events</option>
            <option value="user">My Events</option>
          </select>
        </div>

        <h2>Event Capacity</h2>
        <div className="event-table-main-div mt-4">
          {filteredEvents.length > 0 ? (
            userRole === "user" ? (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Location</th>
                    <th>Starting Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event._id}>
                      <td>{event.title}</td>
                      <td>{event.location}</td>
                      <td>
                        {new Date(event.startingdate).toLocaleDateString()}
                      </td>
                      <td>{new Date(event.enddate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              Object.entries(groupedEvents).map(([creatorId, events]) => (
                <div key={creatorId}>
                  <h3>Events by {creatorMap[creatorId] || "Unknown"}</h3>
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
                        {creatorId === userId && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event._id}>
                          <td>{event.title}</td>
                          <td>{event.location}</td>
                          <td>
                            {new Date(event.startingdate).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(event.enddate).toLocaleDateString()}
                          </td>
                          <td>{event.maxpeoples}</td>
                          <td>{event.attendees.length}</td>
                          <td>{getCapacityFilledPercentage(event)}%</td>
                          {creatorId === userId && (
                            <td>
                              <button
                                className="btn btn-primary"
                                onClick={() => handleEditClick(event)}
                              >
                                Update
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )
          ) : (
            <p>No events found</p>
          )}
        </div>

        {editEvent && (
          <div className="mt-5">
            <h3>Update Event</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="maxpeoples" className="form-label">
                  Max Participants
                </label>
                <input
                  type="number"
                  id="maxpeoples"
                  name="maxpeoples"
                  className="form-control"
                  value={formData.maxpeoples}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="startingdate" className="form-label">
                  Starting Date
                </label>
                <input
                  type="date"
                  id="startingdate"
                  name="startingdate"
                  className="form-control"
                  value={formData.startingdate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="enddate" className="form-label">
                  End Date
                </label>
                <input
                  type="date"
                  id="enddate"
                  name="enddate"
                  className="form-control"
                  value={formData.enddate}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleUpdateEvent}
              >
                Update Event
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => setEditEvent(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <h2 className="mt-5">Top 5 Most Popular Events</h2>
        <div className="event-table-main-div mt-4">
          {topEvents.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Location</th>
                  <th>Starting Date</th>
                  <th>End Date</th>
                  <th>Attendees</th>
                </tr>
              </thead>
              <tbody>
                {topEvents.map((event) => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{event.location}</td>
                    <td>{new Date(event.startingdate).toLocaleDateString()}</td>
                    <td>{new Date(event.enddate).toLocaleDateString()}</td>
                    <td>{event.attendees.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No top events found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventLog;
