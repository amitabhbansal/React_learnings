import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  Checkbox,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";

const ShowUsersCard = () => {
  const { users, updateUser, deleteUser } = useUser();
  const [search, setSearch] = useState("");
  const [editedUser, setEditedUser] = useState(null);
  // Filter users based on search input
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort users based on selected column and direction
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const handleSort = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        setSortConfig({ key, direction: "desc" });
      } else if (sortConfig.direction === "desc") {
        // Reset to original unsorted
        setSortConfig({ key: null, direction: "asc" });
      }
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  const sortedUsers = [...filteredUsers];

  if (sortConfig.key) {
    sortedUsers.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (typeof valueA === "string") {
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
    });
  }

  // Pagination state
  const usersPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="overflow-x-auto">
      <TextInput
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name{" "}
              {sortConfig.key === "name"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : "▲▼"}
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer"
              onClick={() => handleSort("age")}
            >
              Age{" "}
              {sortConfig.key === "age"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : "▲▼"}
            </TableHeadCell>
            <TableHeadCell
              className="cursor-pointer"
              onClick={() => handleSort("gender")}
            >
              Gender{" "}
              {sortConfig.key === "gender"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : "▲▼"}
            </TableHeadCell>

            <TableHeadCell>IsAdmin</TableHeadCell>
            <TableHeadCell>
              <span className="sr-only">Edit</span>
            </TableHeadCell>
            <TableHeadCell>
              <span className="sr-only">Delete</span>
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {paginatedUsers.map((user) => (
            <TableRow
              key={user.id}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {user.id === editedUser?.id ? (
                  <TextInput
                    value={editedUser.name}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, name: e.target.value })
                    }
                  />
                ) : (
                  user.name
                )}
              </TableCell>
              <TableCell>
                {" "}
                {user.id === editedUser?.id ? (
                  <TextInput
                    value={editedUser.age}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        age: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  user.age
                )}
              </TableCell>
              <TableCell>
                {" "}
                {user.id === editedUser?.id ? (
                  <TextInput
                    value={editedUser.gender}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, gender: e.target.value })
                    }
                  />
                ) : (
                  user.gender
                )}
              </TableCell>
              <TableCell>
                {user.id === editedUser?.id ? (
                  <Checkbox
                    checked={editedUser.isAdmin}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        isAdmin: e.target.checked,
                      })
                    }
                  />
                ) : (
                  <Checkbox checked={user.isAdmin} disabled />
                )}
              </TableCell>
              <TableCell>
                {user.id === editedUser?.id ? (
                  <>
                    <a
                      href="#"
                      className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                      onClick={() => {
                        if (
                          !editedUser.name ||
                          !editedUser.age ||
                          !editedUser.gender
                        ) {
                          alert("Please fill in all fields before saving.");
                          return;
                        }
                        +updateUser(editedUser.id, editedUser);
                        setEditedUser(null);
                      }}
                    >
                      Save
                    </a>
                    {""}
                    <a
                      href="#"
                      className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                      onClick={() => setEditedUser(null)}
                    >
                      Cancel
                    </a>
                  </>
                ) : (
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                    onClick={() => setEditedUser({ ...user })}
                  >
                    Edit
                  </a>
                )}
              </TableCell>
              <TableCell>
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this user?"
                      )
                    ) {
                      deleteUser(user.id);
                    }
                  }}
                >
                  Delete
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex overflow-x-auto sm:justify-center mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ShowUsersCard;
