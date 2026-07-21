import { Link, NavLink } from "react-router";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const { cartCount } = useCart();

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-black font-semibold"
      : "text-neutral-600 hover:text-black transition";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="text-2xl font-black tracking-tight">
          TeeLab
        </Link>

        <div className="flex items-center gap-7 text-sm">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>

          <NavLink to="/cart" className={linkClass}>
            Cart ({cartCount})
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
