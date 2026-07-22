import { Link } from "react-router";

const footerLinks = [
  {
    label: "FAQs",
    to: "/faqs",
  },
  {
    label: "Contact Us",
    to: "/contact",
  },
  {
    label: "Privacy Policy",
    to: "/privacy-policy",
  },
  {
    label: "Returns & Exchanges",
    to: "/returns-exchanges",
  },
];

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 8h3V4.5c-.7-.1-1.8-.2-3-.2-3 0-5 1.8-5 5.2V12H6v4h3v8h4v-8h3.3l.7-4H13V9.8C13 8.6 13.4 8 14 8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#EAEAEA] bg-white">
      <div className="mx-auto flex min-h-[400px] max-w-[1600px] flex-col px-5 pb-10 pt-[55px] sm:px-8 lg:px-[60px]">
        {/* Navigation */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-col items-start gap-[14px]">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="group relative inline-block text-[14px] font-normal leading-[1.5] tracking-normal text-[#222] transition-opacity duration-300 hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black sm:text-[15px]"
                >
                  {link.label}

                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social icons */}
        <div className="mt-12 flex items-center justify-start gap-[18px] text-[#666]">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit TeeLab on Facebook"
            className="transition-all duration-[250ms] ease-in-out hover:scale-[1.08] hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            <FacebookIcon />
          </a>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit TeeLab on Instagram"
            className="transition-all duration-[250ms] ease-in-out hover:scale-[1.08] hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            <InstagramIcon />
          </a>
        </div>

        {/* Copyright and hidden admin entrance */}
        <p className="mt-auto pt-14 text-left text-[13px] font-normal uppercase tracking-[0.28em] text-[#444]">
          <span>© 2026 · </span>

          <Link
            to="/admin/login"
            aria-label="TeeLab"
            className="text-inherit no-underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            TEELAB
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
