import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute/GuestRoute";
import AssignmentList from "@/pages/AssignmentList/AssignmentList";
import AssignmentDetail from "@/pages/AssignmentDetail/AssignmentDetail";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<AssignmentList />} />
          <Route path="/assignment/:id" element={<AssignmentDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
