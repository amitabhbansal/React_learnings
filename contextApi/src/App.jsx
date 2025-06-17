// src/App.tsx
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { UserProvider } from "./context/UserContext";
import AddUserForm from "./components/AddUserForm";
import ShowUsersCard from "./components/ShowUsersCard";

export default function App() {
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem("users");
    return storedUsers ? JSON.parse(storedUsers) : [];
  });
  const addUser = (user) => {
    setUsers((prevUsers) => [...prevUsers, user]);
  };
  const updateUser = (id, user) => {
    setUsers((prevUsers) => prevUsers.map((u) => (u.id === id ? user : u)));
  };
  const deleteUser = (id) => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
  };
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
    console.log("Saved users:", users);
  }, [users]);

  return (
    <UserProvider value={{ users, addUser, updateUser, deleteUser }}>
      <AddUserForm />
      <ShowUsersCard />
    </UserProvider>
  );
}
