import { Link } from "react-router";

function PolicySection({ title, children, className = "" }) {
  return (
    <section className={className}>
      <h2 className="mb-[30px] text-[20px] font-semibold leading-[1.4] text-[#111] md:text-[24px]">
        {title}
      </h2>

      {children}
    </section>
  );
}

function PolicyList({ children }) {
  return (
    <ul className="mt-5 list-disc space-y-[18px] pl-7 text-[15px] font-normal leading-[1.9] text-[#222] md:text-[17px] md:leading-[2]">
      {children}
    </ul>
  );
}

function ContactPageLink() {
  return (
    <Link
      to="/contact"
      className="text-[#111] underline underline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
    >
      Contact Us page
    </Link>
  );
}

function ReturnsExchanges() {
  return (
    <main className="bg-white text-[#111]">
      <article className="mx-auto max-w-[1350px] px-5 pb-20 pt-10 sm:px-8 md:px-10 md:pb-[120px] md:pt-[60px]">
        <header>
          <h1 className="mb-16 text-center text-[30px] font-normal uppercase leading-[1.35] tracking-[0.18em] text-[#111] md:mb-20 md:text-[44px] md:tracking-[0.28em]">
            Returns &amp; Exchanges
          </h1>
        </header>

        {/* Return policy */}
        <PolicySection title="Return policy">
          <PolicyList>
            <li>
              All products may be returned within 14 days from the delivery
              date, provided they are in their original condition — unworn,
              unwashed, with all labels, accessories, and packaging intact. All
              returns are complimentary; however, original shipping fees are
              non-refundable.
            </li>

            <li>
              To initiate a return, please contact us through the{" "}
              <ContactPageLink />.
            </li>

            <li>
              After submitting your message, the TeeLab support team will
              contact you within 3 business days to assist you with the next
              steps.
            </li>
          </PolicyList>
        </PolicySection>

        {/* Exchange policy */}
        <PolicySection title="Exchange policy" className="mt-20">
          <PolicyList>
            <li>
              Exchanges are accepted within 14 days from the delivery date under
              the same conditions: the product must be unused, unwashed, and
              returned with all original labels, accessories, and packaging. The
              requested item must also be available on the TeeLab website at the
              time of the exchange request.
            </li>

            <li>
              Exchanges are subject to an additional shipping fee, which will be
              charged during the exchange process.
            </li>

            <li>
              To request an exchange, please contact us through the{" "}
              <ContactPageLink />.
            </li>

            <li>
              After submitting your message, the TeeLab support team will
              contact you within 3 business days to assist you with the next
              steps.
            </li>
          </PolicyList>
        </PolicySection>
      </article>
    </main>
  );
}

export default ReturnsExchanges;
