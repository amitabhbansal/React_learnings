Here’s a clean and professional `README.md` for your **Task Manager App**:

---

```markdown
# 📝 Task Manager App

A simple and elegant Task Management application built using **React**, **TypeScript**, **Context API**, **Bulma CSS**, and **Dnd-kit**. This app allows users to add, edit, delete, and organize tasks across different statuses using drag and drop.

---

## ✨ Features

- ➕ Add new tasks with title, description, and status
- ✅ Form validation with inline error handling
- ✏️ Edit existing tasks with live input updates
- 🗑️ Delete tasks with confirmation
- 📦 LocalStorage support to persist tasks across refresh
- 🔍 Real-time search to filter tasks by title or description
- 🧱 Drag and drop tasks between columns (`todo`, `in-progress`, `done`)
- 🎨 Dynamic card color based on task status
- 🧭 UI built with **Bulma** for clean, responsive styling

---

## 📁 Project Structure

```

src/
│
├── components/
│   ├── Navbar.tsx             # Navigation bar with search
│   ├── TaskForm.tsx           # Add/Edit task form
│   ├── TaskCard.tsx           # Main task board with DnD
│   ├── DraggableTask.tsx      # Draggable task wrapper
│   └── DroppableColumn.tsx    # Droppable column container
│
├── context/
│   └── TaskContext.tsx        # Global state using React Context
│
├── types/
│   └── Task.ts                # Type definitions (Task interface, enums)
│
├── styles/
│   └── taskform.css           # Additional form styling
│
└── App.tsx                    # Main app component

````

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/task-manager.git
cd task-manager
````

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🛠 Technologies Used

* **React** (w/ TypeScript)
* **Bulma CSS**
* **Dnd-kit** (for drag-and-drop)
* **React Context API**
* **Vite** (for fast dev build)

---

## 💡 Future Improvements

* Add due dates & reminders
* Task priority levels
* Responsive design for mobile
* Backend integration (Firebase, Supabase)

---

## 📸 Screenshots

> *(Add screenshots of the UI here)*

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

* [Bulma](https://bulma.io/)
* [Dnd-kit](https://dndkit.com/)
* [React](https://react.dev/)

```


```
