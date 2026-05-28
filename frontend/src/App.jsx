import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Feed from './pages/Feed';
import SinglePost from './pages/SinglePost';
import SearchResults from './pages/SearchResults';
import Register from './pages/Register';
import Login from './pages/Login';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import UserProfile from './pages/UserProfile';
import OAuthCallback from './pages/OAuthCallback';

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/posts/:id" element={<SinglePost />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/posts/new" element={
            <ProtectedRoute><CreatePost /></ProtectedRoute>
          } />
          <Route path="/posts/:id/edit" element={
            <ProtectedRoute><EditPost /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
}
