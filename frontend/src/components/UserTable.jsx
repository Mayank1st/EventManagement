// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function UserTable() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
  
//   // Fetch the user data from local storage and parse it
//   const userData = localStorage.getItem("user"); 
//   const token = userData ? JSON.parse(userData).token : null; 
//   const currentUserId = userData ? JSON.parse(userData)._id : null;

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get("http://localhost:8081/user/users", {
//           headers: {
//             Authorization: `Bearer ${token}`, 
//           },
//         });
//         setUsers(response.data.users);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, [token]); 

//   const handleDelete = async (userId) => {
//     try {
//       await axios.delete(`http://localhost:8081/user/users/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setUsers(users.filter(user => user._id !== userId));
//       navigate("/"); 
//     } catch (err) {
//       console.error("Failed to delete user:", err.message);
//       setError("Failed to delete user");
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="table-container">
//       <table className="custom-table">
//         <thead>
//           <tr>
//             <th scope="col">#</th>
//             <th scope="col">Username</th>
//             <th scope="col">Email</th>
//             <th scope="col">Photo</th>
//             <th scope="col">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.length > 0 ? (
//             users.map((user, index) => (
//               <tr key={user._id}>
//                 <th scope="row">{index + 1}</th>
//                 <td>{user.username}</td>
//                 <td>{user.email}</td>
//                 <td>
//                   {user.photo ? (
//                     <img
//                       src={`http://localhost:8081/${encodeURIComponent(
//                         user.photo.replace(/\\/g, "/")
//                       )}`}
//                       alt={`${user.username}'s profile`}
//                       style={{
//                         width: "50px",
//                         height: "50px",
//                         borderRadius: "50%",
//                       }}
//                     />
//                   ) : (
//                     "No photo"
//                   )}
//                 </td>
//                 <td>
//                   {currentUserId && user._id === currentUserId ? (
//                     <button onClick={() => handleDelete(user._id)}>Delete</button>
//                   ) : (
//                     "No action"
//                   )}
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="5">No users found</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default UserTable;
