import { NavLink, Outlet, useNavigate } from "react-router";
import { signOutAdmin } from "../../services/adminService";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/orders", "Orders"],
  ["/admin/customers", "Customers"],
  ["/admin/designs", "Designs"],
];

export default function AdminLayout() {
  const navigate = useNavigate();

  async function logout() {
    await signOutAdmin();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-100 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="no-print border-r border-neutral-200 bg-black p-6 text-white">
        <p className="text-2xl font-black">TeeLab Admin</p>
        <nav className="mt-8 space-y-2">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `block px-4 py-3 ${isActive ? "bg-white text-black" : "text-neutral-300 hover:bg-neutral-900"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-8 w-full border border-neutral-700 px-4 py-3">Sign out</button>
      </aside>
      <main className="min-w-0 p-5 sm:p-8"><Outlet /></main>
    </div>
  );
}
