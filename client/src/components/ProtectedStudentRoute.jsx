import { Navigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';

const ProtectedStudentRoute = ({ children }) => {
    const { student, loading } = useStudentAuth();

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    if (!student) {
        return <Navigate to="/student/login" replace />;
    }

    return children;
};

export default ProtectedStudentRoute;
