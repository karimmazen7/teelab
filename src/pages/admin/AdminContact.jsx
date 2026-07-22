import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMessages(data ?? []);
    } catch (error) {
      console.error("Contact messages fetch error:", error);
      setErrorMessage("Could not load contact messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (messageId) => {
    setUpdatingId(messageId);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .update({
          status: "read",
        })
        .eq("id", messageId)
        .select()
        .single();

      if (error) throw error;

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId ? data : message,
        ),
      );
    } catch (error) {
      console.error("Contact status update error:", error);
      setErrorMessage("Could not update the message status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteMessage = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) return;

    setDeletingId(messageId);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== messageId),
      );
    } catch (error) {
      console.error("Contact message delete error:", error);
      setErrorMessage("Could not delete the contact message.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-neutral-500">Loading contact messages...</p>
      </section>
    );
  }

  return (
    <section className="p-5 sm:p-8">
      {/* Page heading */}
      <div className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            TeeLab Admin
          </p>

          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Contact Messages
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMessages}
          className="h-11 border border-black px-5 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-300 hover:bg-black hover:text-white"
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {errorMessage && (
        <p
          role="alert"
          className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {/* Empty state */}
      {messages.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-neutral-500">No contact messages yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-8 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-300">
                  <th className="px-3 py-4 text-xs font-semibold uppercase tracking-[0.12em]">
                    Name
                  </th>

                  <th className="px-3 py-4 text-xs font-semibold uppercase tracking-[0.12em]">
                    Email
                  </th>

                  <th className="px-3 py-4 text-xs font-semibold uppercase tracking-[0.12em]">
                    Message
                  </th>

                  <th className="px-3 py-4 text-xs font-semibold uppercase tracking-[0.12em]">
                    Date
                  </th>

                  <th className="px-3 py-4 text-xs font-semibold uppercase tracking-[0.12em]">
                    Status
                  </th>

                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className="border-b border-neutral-200 align-top"
                  >
                    <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                      {message.name}
                    </td>

                    <td className="px-3 py-5 text-sm">
                      <a
                        href={`mailto:${message.email}`}
                        className="border-b border-neutral-400 transition-colors hover:border-black"
                      >
                        {message.email}
                      </a>
                    </td>

                    <td className="max-w-[360px] px-3 py-5 text-sm leading-6 text-neutral-600">
                      <p className="whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-3 py-5 text-sm text-neutral-500">
                      {formatDate(message.created_at)}
                    </td>

                    <td className="px-3 py-5">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] ${
                          message.status === "read"
                            ? "bg-neutral-100 text-neutral-600"
                            : "bg-black text-white"
                        }`}
                      >
                        {message.status}
                      </span>
                    </td>

                    <td className="px-3 py-5">
                      <div className="flex justify-end gap-2">
                        {message.status !== "read" && (
                          <button
                            type="button"
                            onClick={() => markAsRead(message.id)}
                            disabled={updatingId === message.id}
                            className="border border-neutral-300 px-3 py-2 text-xs transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === message.id
                              ? "Updating..."
                              : "Mark as Read"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteMessage(message.id)}
                          disabled={deletingId === message.id}
                          className="border border-red-300 px-3 py-2 text-xs text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === message.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile and tablet */}
          <div className="mt-8 space-y-4 lg:hidden">
            {messages.map((message) => (
              <article
                key={message.id}
                className="border border-neutral-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold">{message.name}</h2>

                    <a
                      href={`mailto:${message.email}`}
                      className="mt-1 block break-all text-sm text-neutral-600 underline"
                    >
                      {message.email}
                    </a>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${
                      message.status === "read"
                        ? "bg-neutral-100 text-neutral-600"
                        : "bg-black text-white"
                    }`}
                  >
                    {message.status}
                  </span>
                </div>

                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">
                  {message.message}
                </p>

                <p className="mt-5 text-xs text-neutral-500">
                  {formatDate(message.created_at)}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {message.status !== "read" && (
                    <button
                      type="button"
                      onClick={() => markAsRead(message.id)}
                      disabled={updatingId === message.id}
                      className="border border-neutral-300 px-4 py-2 text-xs transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === message.id
                        ? "Updating..."
                        : "Mark as Read"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteMessage(message.id)}
                    disabled={deletingId === message.id}
                    className="border border-red-300 px-4 py-2 text-xs text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === message.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default AdminContact;
