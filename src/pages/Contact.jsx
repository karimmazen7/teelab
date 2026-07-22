import { useState } from "react";
import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setSuccessMessage("");
    setSubmitError("");
  };

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Please enter your message.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) return;

    setIsSending(true);

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        message: form.message.trim(),
        status: "new",
      });

      if (error) throw error;

      setForm(initialForm);
      setErrors({});
      setSuccessMessage("Your message has been sent.");
    } catch (error) {
      console.error("Contact message error:", error);

      setSubmitError(
        error?.message ||
          "We could not send your message. Please try again shortly.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="bg-white text-[#111]">
      {/* Hero */}
      <section className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-[#222] md:h-[420px]">
        <img
          src="/images/contact-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 px-5 text-center text-white">
          <h1 className="mx-auto max-w-[1100px] text-[30px] font-medium uppercase leading-[1.35] tracking-[0.14em] sm:tracking-[0.18em] md:text-[48px] md:tracking-[0.22em]">
            Get in Touch With Us
          </h1>

          {/* <a
            href="mailto:contact@teelab.com"
            className="mt-7 inline-block text-[13px] font-medium uppercase tracking-[0.14em] text-white transition-opacity duration-300 hover:opacity-75 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white md:text-[18px] md:tracking-[0.18em]"
          >
            contact@teelab.com
          </a> */}
        </div>
      </section>

      {/* Contact form */}
      <section className="mx-auto max-w-[850px] px-5 pb-24 pt-14 sm:px-6 md:pb-[120px] md:pt-20">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="contact-name" className="sr-only">
                Name
              </label>

              <input
                id="contact-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "contact-name-error" : undefined
                }
                className={`h-[58px] w-full border bg-white px-[18px] text-[16px] font-normal text-[#111] outline-none transition-colors duration-300 placeholder:text-[#777] ${
                  errors.name
                    ? "border-red-600"
                    : "border-[#DADADA] focus:border-black"
                }`}
              />

              {errors.name && (
                <p
                  id="contact-name-error"
                  role="alert"
                  className="mt-2 text-[13px] text-red-600"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="sr-only">
                E-mail
              </label>

              <input
                id="contact-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="E-mail"
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
                className={`h-[58px] w-full border bg-white px-[18px] text-[16px] font-normal text-[#111] outline-none transition-colors duration-300 placeholder:text-[#777] ${
                  errors.email
                    ? "border-red-600"
                    : "border-[#DADADA] focus:border-black"
                }`}
              />

              {errors.email && (
                <p
                  id="contact-email-error"
                  role="alert"
                  className="mt-2 text-[13px] text-red-600"
                >
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mt-5">
            <label htmlFor="contact-message" className="sr-only">
              Message
            </label>

            <textarea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              required
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
              className={`h-[180px] w-full resize-y border bg-white p-[18px] text-[16px] font-normal text-[#111] outline-none transition-colors duration-300 placeholder:text-[#777] ${
                errors.message
                  ? "border-red-600"
                  : "border-[#DADADA] focus:border-black"
              }`}
            />

            {errors.message && (
              <p
                id="contact-message-error"
                role="alert"
                className="mt-2 text-[13px] text-red-600"
              >
                {errors.message}
              </p>
            )}
          </div>

          {/* Success message */}
          {successMessage && (
            <p
              role="status"
              className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-[14px] leading-6 text-green-800"
            >
              {successMessage}
            </p>
          )}

          {/* Submission error */}
          {submitError && (
            <p
              role="alert"
              className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-[14px] leading-6 text-red-700"
            >
              {submitError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSending}
            className="mt-5 h-[60px] w-full bg-[#1F1F1F] px-6 text-[15px] font-medium uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 md:text-[18px] md:tracking-[0.18em]"
          >
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Contact;
