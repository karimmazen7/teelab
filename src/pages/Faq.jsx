import { useState } from "react";
import { Link } from "react-router";

const faqSections = [
  {
    title: "Order Details",
    items: [
      {
        question: "How can I place an order?",
        answer:
          "Placing an order is simple. Explore our TeeLab collections, choose your preferred product, select the available color and size, add it to your cart, and complete your information through our secure checkout page.",
      },
      {
        question: "How can I know my size?",
        answer:
          "Each TeeLab product page includes a size guide designed for the specific fit of the product. Please review the size chart before completing your order to choose the most suitable size.",
      },
      {
        question: "Can I know when a product is restocked?",
        answer:
          "When a product or size is unavailable, you can contact TeeLab through our Contact Us page or social media accounts. Our team will let you know when the item becomes available again.",
      },
      {
        question: "Can I cancel or modify my order?",
        answer:
          "Orders are processed shortly after they are placed. Contact TeeLab as soon as possible if you need to change or cancel an order. We cannot guarantee changes once the order has been prepared or shipped.",
      },
    ],
  },
  {
    title: "Shipping Info",
    items: [
      {
        question: "Which locations does TeeLab deliver to?",
        answer:
          "TeeLab currently delivers across Egypt. Available delivery locations and shipping fees are confirmed during checkout.",
      },
      {
        question: "What is the shipping cost?",
        answer:
          "Standard shipping costs EGP 85 unless a different fee is displayed during checkout. Shipping fees may vary depending on the delivery location or current promotional offers.",
      },
      {
        question: "How long does it take to receive my TeeLab order?",
        answer:
          "Orders are normally delivered within 3 to 7 business days. Delivery may require additional time during weekends, public holidays, sales, or periods of high demand.",
      },
      {
        question: "What should I do if I haven’t received my order?",
        answer:
          "If your order has not arrived within the expected delivery period, please contact TeeLab through the Contact Us page and provide your name, phone number, and order number so our team can assist you.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        question: "Which payment methods does TeeLab accept?",
        answer:
          "TeeLab currently accepts Cash on Delivery only. You will pay the full order amount to the courier when your order arrives.",
      },
      {
        question: "Is Cash on Delivery available for every order?",
        answer:
          "Cash on Delivery is available for eligible orders delivered inside Egypt. TeeLab may contact you to confirm the order before preparing or shipping it.",
      },
      {
        question: "Why was my order not confirmed?",
        answer:
          "An order may remain unconfirmed if the contact information is incomplete, the phone number is incorrect, or our team cannot reach the customer. Make sure all checkout information is accurate.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What is TeeLab’s return policy?",
        answer:
          "Products may be returned within 14 days from the delivery date, provided they are unused, unworn, unwashed, undamaged, and returned with the original labels and packaging.",
      },
      {
        question: "What is TeeLab’s exchange policy?",
        answer:
          "Products may be exchanged within 14 days from the delivery date if they remain unused, unworn, unwashed, and in their original condition. The requested replacement size or product must be available.",
      },
      {
        question: "How can I return a product?",
        answer: (
          <>
            To request a return, open the TeeLab{" "}
            <Link
              to="/returns-exchanges"
              className="border-b border-current transition-opacity duration-300 hover:opacity-60"
            >
              Returns &amp; Exchanges page
            </Link>{" "}
            and submit the required form. Include your order details and the
            reason for the return.
          </>
        ),
      },
      {
        question: "How can I exchange a product?",
        answer: (
          <>
            Submit an exchange request through the TeeLab{" "}
            <Link
              to="/returns-exchanges"
              className="border-b border-current transition-opacity duration-300 hover:opacity-60"
            >
              Returns &amp; Exchanges page
            </Link>
            . Specify the original product, current size, and requested
            replacement size.
          </>
        ),
      },
      {
        question: "When will I hear back about my return or exchange request?",
        answer:
          "The TeeLab support team will normally respond within 1 to 3 business days after receiving your request.",
      },
      {
        question: "Do I need to pay if I want to return my order?",
        answer:
          "The original shipping fee is non-refundable. Any additional courier or return shipping charges should be clearly communicated to the customer before processing the return.",
      },
      {
        question: "Do I need to pay if I want to exchange my order?",
        answer:
          "An additional shipping fee may apply when exchanging a product. The customer should be informed of the exact amount before the exchange is processed.",
      },
      {
        question:
          "What should I do if I receive a defective or incorrect product?",
        answer: (
          <>
            Contact TeeLab immediately through the{" "}
            <Link
              to="/returns-exchanges"
              className="border-b border-current transition-opacity duration-300 hover:opacity-60"
            >
              Returns &amp; Exchanges page
            </Link>
            . Include your order number and clear photos of the received
            product. Our team will review the request and arrange a suitable
            solution.
          </>
        ),
      },
    ],
  },
  {
    title: "Refund",
    items: [
      {
        question: "How can I get refunded if I paid cash?",
        answer:
          "For Cash on Delivery orders, the TeeLab team will contact you after the returned item is received and inspected to arrange the available refund method.",
      },
      {
        question: "How soon will I get my refund?",
        answer:
          "After TeeLab receives and inspects the returned product, you will be informed whether the refund request has been approved. Approved refunds should normally be processed within 7 to 14 business days.",
      },
      {
        question: "Will the original shipping cost be refunded?",
        answer:
          "No. The original delivery charge is non-refundable unless the customer received an incorrect or defective product caused by TeeLab.",
      },
    ],
  },
];

function FaqItem({ id, question, answer, isOpen, onToggle }) {
  const answerId = `faq-answer-${id}`;

  return (
    <div className="border-b border-[#DEDEDE]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="flex w-full items-center justify-between gap-6 py-7 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <span className="min-w-0 pr-2 text-[16px] font-semibold leading-[1.5] text-[#111] md:text-[18px]">
          {question}
        </span>

        <span
          aria-hidden="true"
          className="w-6 shrink-0 text-center text-[22px] font-light leading-none text-[#555]"
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div
        id={answerId}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-[26px] pr-[35px] text-[14px] font-normal leading-[1.7] text-[#222] md:text-[16px] md:leading-[1.75]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (id) => {
    setOpenItems((currentItems) =>
      currentItems.includes(id)
        ? currentItems.filter((itemId) => itemId !== id)
        : [...currentItems, id],
    );
  };

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[820px] px-5 pb-[100px] pt-9 md:px-6 md:pt-[50px]">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-[#111]">
            Need Help?
          </p>

          <h1 className="mx-auto mb-[70px] mt-8 max-w-[760px] text-[24px] font-semibold uppercase leading-[1.3] tracking-[0.14em] text-[#111] md:text-[30px] md:tracking-[0.18em] lg:text-[34px] lg:tracking-[0.22em]">
            Frequently Asked Questions
          </h1>
        </header>

        <div>
          {faqSections.map((section, sectionIndex) => (
            <section
              key={section.title}
              className={sectionIndex === 0 ? "" : "mt-[62px]"}
            >
              <h2 className="border-b border-[#DEDEDE] pb-[26px] text-[18px] font-semibold uppercase tracking-[0.14em] text-[#111] md:text-[22px] md:tracking-[0.2em]">
                {section.title}
              </h2>

              <div>
                {section.items.map((item, itemIndex) => {
                  const id = `${sectionIndex}-${itemIndex}`;

                  return (
                    <FaqItem
                      key={id}
                      id={id}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.includes(id)}
                      onToggle={() => toggleItem(id)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Faq;
