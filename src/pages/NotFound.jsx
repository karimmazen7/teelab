import { Link } from "react-router";

function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
        Error 404
      </p>

      <h1 className="mt-4 text-5xl font-black">Page not found</h1>

      <Link to="/" className="mt-8 bg-black px-7 py-4 font-semibold text-white">
        Return home
      </Link>
    </section>
  );
}

export default NotFound;
