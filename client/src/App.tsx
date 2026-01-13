import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Ride Share</Link>
            <div className="space-x-4">
              <Link to="/register" className="hover:underline">Register</Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto p-4 text-center">
              <h1 className="text-3xl font-bold mb-4">Welcome to Ride Share</h1>
              <p className="text-gray-600 mb-4">Share rides, save money, help the environment.</p>
              <Link to="/register" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          } />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
