import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import { AuthProvider, useAuth } from './contexts/AuthContext';
// @ts-ignore
import Login from './pages/Login';
// @ts-ignore
import Register from './pages/Register';
// @ts-ignore
import Dashboard from './pages/Dashboard';
// @ts-ignore
import ProjectDetails from './pages/ProjectDetails';
// @ts-ignore
import NewProject from './pages/NewProject';
// @ts-ignore
import NewTask from './pages/NewTask';
// @ts-ignore
import EditProject from './pages/EditProject';
// @ts-ignore
import ManageTeam from './pages/ManageTeam';
// @ts-ignore
import Layout from './components/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <PrivateRoute>
                <Layout>
                  <NewProject />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <PrivateRoute>
                <Layout>
                  <ProjectDetails />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId/edit"
            element={
              <PrivateRoute>
                <Layout>
                  <EditProject />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId/tasks/new"
            element={
              <PrivateRoute>
                <Layout>
                  <NewTask />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId/team"
            element={
              <PrivateRoute>
                <Layout>
                  <ManageTeam />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 