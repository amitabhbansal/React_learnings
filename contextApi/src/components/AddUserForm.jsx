// src/components/AddUserForm.jsx
import { Card, Label, TextInput, Select, Button } from "flowbite-react";
import { useUser } from "../context/UserContext";
import { useState } from "react";

function AddUserForm() {
  const { addUser } = useUser();

  const [user, setUser] = useState({
    name: "",
    age: "",
    gender: "",
    isAdmin: false,
  });

  const handleChange = (key, value) => {
    setUser((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user.name || !user.age || !user.gender) {
      return alert("Please fill in all fields");
    }

    const age = parseInt(user.age, 10);
    if (isNaN(age) || age <= 0) {
      return alert("Please enter a valid age");
    }

    addUser({
      ...user,
      id: Date.now(),
      age, // store as number, not string
    });

    setUser({
      name: "",
      age: "",
      gender: "",
      isAdmin: false,
    });
  };

  return (
    <Card className="max-w-md mx-auto mt-6 shadow">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold text-center">Add User</h2>

        <div>
          <Label htmlFor="name" value="Name" />
          <TextInput
            id="name"
            placeholder="Enter name"
            required
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="age" value="Age" />
          <TextInput
            id="age"
            type="number"
            placeholder="Enter age"
            required
            value={user.age}
            onChange={(e) => handleChange("age", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="gender" value="Gender" />
          <Select
            id="gender"
            required
            value={user.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="isAdmin" value="Is Admin?" />
          <Select
            id="isAdmin"
            value={String(user.isAdmin)}
            onChange={(e) => handleChange("isAdmin", e.target.value === "true")}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </Select>
        </div>

        <Button type="submit">Add User</Button>
      </form>
    </Card>
  );
}

export default AddUserForm;
