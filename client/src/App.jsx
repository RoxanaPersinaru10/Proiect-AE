import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Navbar from "./components/Navbar";
import useCheckToken from "./hooks/useCheckToken";
import Profile from "./pages/Profile";
import { useSelector } from "react-redux";
import Cart from "./components/Cart";
import AuthPage from "./pages/AuthPage";
import UserManager from "./pages/UserManager";
import SearchBar from "./components/SearchBar"; 
import FlightManager from "./components/FlightManager";
import CartManager from "./pages/CartManager";
import BookingManager from "./pages/BookingManager";



function App() {
  const {checkTokenLoading, loggedIn} = useSelector((state) => state.global);

  useCheckToken();

  return (
    <Router>
      <Navbar />
      <Routes>
        {checkTokenLoading ? (
          <Route path="*" element={<div>Spinner</div>} />
        ) : (
          <>
            <Route path="/" element={<Homepage />} />
            
  
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/flights" element={<SearchBar />} />
             <Route path="/flights-manager" element={<FlightManager />} />
             <Route path="/cart" element={<CartManager />} />
             <Route path="/bookings" element={<BookingManager />} />

            <Route
              path="/profile"
              element={loggedIn ? <Profile /> : <Navigate to="/login" />}
            />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;