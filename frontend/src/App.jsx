import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import TransactionDetail from "./pages/TransactionDetail";
import Security from "./pages/Security";
import AddressBook from "./pages/AddressBook";
import Alerts from "./pages/Alerts";

function PrivateRoute({ children }) {
  return localStorage.getItem("nexus_user") ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/send"         element={<PrivateRoute><Send /></PrivateRoute>} />
          <Route path="/receive"      element={<PrivateRoute><Receive /></PrivateRoute>} />
          <Route path="/transaction/:id" element={<PrivateRoute><TransactionDetail /></PrivateRoute>} />
          <Route path="/security"     element={<PrivateRoute><Security /></PrivateRoute>} />
          <Route path="/address-book" element={<PrivateRoute><AddressBook /></PrivateRoute>} />
          <Route path="/alerts"       element={<PrivateRoute><Alerts /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
