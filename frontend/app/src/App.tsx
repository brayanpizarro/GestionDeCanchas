import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx'; 
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminGuard from './guards/AdminGuard';
import ReservationPage from './pages/ReservationPageNew';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from "./pages/admin-dashboard";
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider> 
                <div className="app-container min-h-screen flex flex-col">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/reservation" element={<ReservationPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route 
                            path="/admin" 
                            element={
                                <AdminGuard>
                                    <AdminDashboard/>
                                </AdminGuard>
                            } 
                        />
                    </Routes>
                    
                    {/* Toaster para las notificaciones */}
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                style: {
                                    background: '#10b981',
                                },
                            },
                            error: {
                                duration: 4000,
                                style: {
                                    background: '#ef4444',
                                },
                            },
                        }}
                    />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;