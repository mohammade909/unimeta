import { useSelector } from "react-redux";
import { Navigate} from "react-router-dom";
import { selectAdmin } from "../../store/slices/authSlice";
import AdminLayout from "../layout/AdminLayout";

export default function AdminPrivateRoute() {
  const admin = useSelector(selectAdmin);
  if (!admin || !admin.role) {
    return <Navigate to="/" replace />;
  }
  return <AdminLayout />;
}
