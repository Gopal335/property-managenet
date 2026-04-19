import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PropertyDetails from "./pages/PropertyDetails";
import AdminLogin from "./pages/AdminLogin";
import AddProperty from "./pages/AddProperty";
import AdminInterests from "./pages/AdminInterests";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/add-property" element={<AddProperty />} />
          <Route path="/admin/interests" element={<AdminInterests />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
