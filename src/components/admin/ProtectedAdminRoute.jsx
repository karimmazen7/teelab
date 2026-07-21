import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { getCurrentAdmin } from "../../services/adminService";

export default function ProtectedAdminRoute({ roles }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, admin: null });

  useEffect(() => {
    getCurrentAdmin()
      .then((admin) => setState({ loading: false, admin }))
      .catch(() => setState({ loading: false, admin: null }));
  }, []);

  if (state.loading) return <div className="flex min-h-screen items-center justify-center">Checking access...</div>;
  if (!state.admin) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(state.admin.role)) return <Navigate to="/admin" replace />;

  return <Outlet context={{ admin: state.admin }} />;
}
