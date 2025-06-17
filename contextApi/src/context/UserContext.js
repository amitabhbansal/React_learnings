import { createContext, useContext } from "react";
export const UserContext = createContext({
  users: [
    {
      id: 1,
      name: "Amitabh Bansal",
      age: 23,
      gender: "male",
      isAdmin: false,
    },
  ],
  addUser: (user) => {},
  updateUser: (id, user) => {},
  deleteUser: (id) => {},
});

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = UserContext.Provider;
