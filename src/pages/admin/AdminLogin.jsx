import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { signInAdmin, getCurrentAdmin } from "../../services/adminService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInAdmin(form.email, form.password);
      const admin = await getCurrentAdmin();
      if (!admin) throw new Error("This account is not an active TeeLab administrator.");
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-8">
        <h1 className="text-3xl font-black">Admin Login</h1>
        <div className="mt-7 space-y-4">
          <input type="email" required placeholder="Email" className="w-full border p-4" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" required placeholder="Password" className="w-full border p-4" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="mt-6 w-full bg-black p-4 font-semibold text-white disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
