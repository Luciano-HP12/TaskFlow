import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Tasks from "./pages/Tasks";
import TaskForm from "./pages/TaskForm";
import Categories from "./pages/Categories";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
      
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/tasks" element={<Tasks />} />

          <Route
            path="/tasks/new"
            element={<TaskForm />}
          />

          <Route
            path="/tasks/:id/edit"
            element={<TaskForm />}
          />

          <Route
            path="/categories"
            element={<Categories />}
          />
        </Route>     

      </Routes>
    </BrowserRouter>
  );
}

export default App;