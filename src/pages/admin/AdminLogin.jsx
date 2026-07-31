import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { getCurrentAdmin, signInAdmin } from "../../services/adminService";

function Icon({ type, className = "h-4 w-4" }) {
  const paths = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8" />
        <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6a10 10 0 0 0 4.1-.9" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    back: <path d="m15 18-6-6 6-6" />,
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.7 2.9 8.7 7 10 4.1-1.3 7-5.3 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
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

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) setError("");
  };

  async function submit(event) {
    event.preventDefault();

    const email = form.email.trim();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInAdmin(email, form.password);

      const admin = await getCurrentAdmin();

      if (!admin) {
        throw new Error("This account is not an active TeeLab administrator.");
      }

      const requestedPath = location.state?.from?.pathname;
      const requestedSearch = location.state?.from?.search || "";

      const destination =
        requestedPath?.startsWith("/admin") && requestedPath !== "/admin/login"
          ? `${requestedPath}${requestedSearch}`
          : "/admin";

      navigate(destination, { replace: true });
    } catch (loginError) {
      console.error("Admin login error:", loginError);

      setError(
        loginError?.message || "Sign in failed. Check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f6f7] px-5 py-10">
      <div className="absolute inset-x-0 top-0 h-1 bg-neutral-900" />

      <Link
        to="/"
        className="absolute left-5 top-6 inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 sm:left-8 sm:top-8"
      >
        <Icon type="back" />
        Back to home
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            to="/"
            aria-label="TeeLab home"
            className="inline-block text-2xl font-black tracking-[-0.06em] text-neutral-900"
          >
            TEELAB
          </Link>

          <p className="mt-2 text-xs text-neutral-500">Administration portal</p>
        </div>

        <form
          onSubmit={submit}
          className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
        >
          <header className="border-b border-neutral-200 px-6 py-6 sm:px-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Icon type="shield" className="h-5 w-5" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-neutral-900">
              Admin sign in
            </h1>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Enter your administrator account details to access the TeeLab
              dashboard.
            </p>
          </header>

          <div className="px-6 py-6 sm:px-8">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-700">
                  Email address
                </span>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                    <Icon type="mail" />
                  </span>

                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    autoFocus
                    placeholder="admin@teelab.com"
                    value={form.email}
                    disabled={loading}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white pl-10 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-700">
                  Password
                </span>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                    <Icon type="lock" />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    disabled={loading}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white pl-10 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-100"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 transition hover:text-neutral-800 disabled:cursor-not-allowed"
                  >
                    <Icon type={showPassword ? "eyeOff" : "eye"} />
                  </button>
                </div>
              </label>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 sm:px-8">
            <p className="flex items-center justify-center gap-2 text-center text-[10px] text-neutral-500">
              <Icon type="lock" className="h-3.5 w-3.5" />
              Restricted to authorized TeeLab administrators
            </p>
          </footer>
        </form>

        <p className="mt-5 text-center text-[10px] text-neutral-400">
          © {new Date().getFullYear()} TeeLab. All rights reserved.
        </p>
      </div>
    </main>
  );
}
