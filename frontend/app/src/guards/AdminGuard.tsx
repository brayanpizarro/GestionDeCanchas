import { FC, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminGuardProps {
    children: ReactNode;
}

const AdminGuard: FC<AdminGuardProps> = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/auth');
            } else if (user?.role !== 'admin') {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, loading, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return <>{children}</>;
};

export default AdminGuard;
