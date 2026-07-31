import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";

import { signOutAdmin } from "../../services/adminService";

const links = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: "dashboard",
    end: true,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: "orders",
  },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: "customers",
  },
  {
    to: "/admin/designs",
    label: "Designs",
    icon: "designs",
  },
  {
    to: "/admin/contact",
    label: "Contact messages",
    icon: "messages",
  },
];

function Icon({ type, className = "h-5 w-5" }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    orders: (
      <>
        <path d="M6 7.5h12l1 13H5l1-13Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    customers: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21a7 7 0 0 1 14 0" />
        <path d="M16 4.5a4 4 0 0 1 0 7" />
        <path d="M17 15a6 6 0 0 1 5 6" />
      </>
    ),
    designs: (
      <>
        <path d="M12 3 4 7l8 4 8-4-8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 17 8 4 8-4" />
      </>
    ),
    messages: (
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    ),
    store: (
      <>
        <path d="M4 10v10h16V10" />
        <path d="M3 4h18l-2 6a3 3 0 0 1-5 1 3 3 0 0 1-4 0 3 3 0 0 1-5-1L3 4Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17 15 12 10 7" />
        <path d="M15 12H3" />
        <path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    collapse: (
      <>
        <path d="m14 18-6-6 6-6" />
        <path d="M20 5v14" />
      </>
    ),
    expand: (
      <>
        <path d="m10 6 6 6-6 6" />
        <path d="M4 5v14" />
      </>
    ),
    external: (
      <>
        <path d="M14 5h5v5" />
        <path d="m19 5-8 8" />
        <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function AdminLogo({ collapsed = false }) {
  return (
    <Link
      to="/admin"
      className={`flex min-w-0 items-center ${
        collapsed ? "justify-center" : "gap-3"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-neutral-900">
        T
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight text-white">
            TeeLab
          </p>

          <p className="text-[10px] font-medium text-neutral-500">
            Administration
          </p>
        </div>
      )}
    </Link>
  );
}

function Navigation({ collapsed = false, onNavigate }) {
  return (
    <nav className="space-y-1">
      {links.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={collapsed ? label : undefined}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group relative flex h-10 items-center rounded-md text-xs font-medium transition ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } ${
              isActive
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                type={icon}
                className={`h-[18px] w-[18px] shrink-0 ${
                  isActive
                    ? "text-neutral-900"
                    : "text-neutral-500 group-hover:text-white"
                }`}
              />

              {!collapsed && <span className="truncate">{label}</span>}

              {collapsed && isActive && (
                <span className="absolute -right-1 h-4 w-1 rounded-full bg-white" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarContent({
  collapsed = false,
  loggingOut,
  logoutError,
  onLogout,
  onNavigate,
  onCollapse,
  mobile = false,
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex h-16 items-center border-b border-neutral-800 ${
          collapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        <AdminLogo collapsed={collapsed} />

        {mobile && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onNavigate}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            <Icon type="close" />
          </button>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto py-5 ${collapsed ? "px-2" : "px-3"}`}
      >
        {!collapsed && (
          <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Store management
          </p>
        )}

        <Navigation collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <div
        className={`border-t border-neutral-800 py-4 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          title={collapsed ? "View store" : undefined}
          className={`flex h-10 items-center rounded-md text-xs font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-white ${
            collapsed ? "justify-center px-2" : "gap-3 px-3"
          }`}
        >
          <Icon type="store" className="h-[18px] w-[18px]" />

          {!collapsed && (
            <>
              <span className="flex-1">View store</span>
              <Icon type="external" className="h-3.5 w-3.5" />
            </>
          )}
        </Link>

        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          title={collapsed ? "Sign out" : undefined}
          className={`mt-1 flex h-10 w-full items-center rounded-md text-xs font-medium text-neutral-400 transition hover:bg-red-950/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 ${
            collapsed ? "justify-center px-2" : "gap-3 px-3"
          }`}
        >
          {loggingOut ? (
            <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
          ) : (
            <Icon type="logout" className="h-[18px] w-[18px]" />
          )}

          {!collapsed && (
            <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
          )}
        </button>

        {logoutError && !collapsed && (
          <p className="mt-2 px-3 text-[10px] leading-4 text-red-400">
            {logoutError}
          </p>
        )}

        {!mobile && (
          <button
            type="button"
            onClick={onCollapse}
            className={`mt-3 flex h-9 w-full items-center rounded-md border border-neutral-800 text-[10px] font-medium text-neutral-500 transition hover:border-neutral-700 hover:bg-neutral-800 hover:text-white ${
              collapsed ? "justify-center" : "gap-3 px-3"
            }`}
          >
            <Icon
              type={collapsed ? "expand" : "collapse"}
              className="h-4 w-4"
            />

            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return (
        window.localStorage.getItem("teelab_admin_sidebar") === "collapsed"
      );
    } catch {
      return false;
    }
  });

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const nextValue = !current;

      try {
        window.localStorage.setItem(
          "teelab_admin_sidebar",
          nextValue ? "collapsed" : "expanded",
        );
      } catch {
        // The sidebar still works if localStorage is unavailable.
      }

      return nextValue;
    });
  };

  async function logout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await signOutAdmin();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Admin logout error:", error);
      setLogoutError(error?.message || "Could not sign out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 hidden bg-[#111111] transition-[width] duration-300 lg:block ${
          sidebarCollapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          loggingOut={loggingOut}
          logoutError={logoutError}
          onLogout={logout}
          onCollapse={toggleSidebar}
        />
      </aside>

      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative h-full w-[280px] max-w-[85vw] bg-[#111111] shadow-2xl">
            <SidebarContent
              loggingOut={loggingOut}
              logoutError={logoutError}
              onLogout={logout}
              onNavigate={() => setMobileMenuOpen(false)}
              mobile
            />
          </aside>
        </div>
      )}

      <div
        className={`min-w-0 transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[240px]"
        }`}
      >
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
            >
              <Icon type="menu" />
            </button>

            <Link
              to="/admin"
              className="text-base font-black tracking-[-0.05em] text-neutral-900"
            >
              TEELAB
            </Link>
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-200 px-3 text-[11px] font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
          >
            <Icon type="store" className="h-4 w-4" />
            Store
          </Link>
        </header>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
