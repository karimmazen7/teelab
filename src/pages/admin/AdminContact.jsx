import { useCallback, useEffect, useMemo, useState } from "react";
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

function Icon({ type, className = "h-4 w-4" }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    message: (
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    ),
    unread: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    read: (
      <>
        <path d="M20 6 9 17l-5-5" />
        <path d="m15 6-6 6-2-2" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M6.1 9a7 7 0 0 1 11.6-2L20 12" />
        <path d="m4 12 2.3 5a7 7 0 0 0 11.6-2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="m6 7 1 14h10l1-14" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
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

function SummaryCard({ label, value, icon, color }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          <Icon type={icon} className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const isRead = status === "read";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
        isRead ? "bg-neutral-100 text-neutral-600" : "bg-blue-100 text-blue-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isRead ? "bg-neutral-400" : "bg-blue-500"
        }`}
      />

      {isRead ? "Read" : "Unread"}
    </span>
  );
}

function CustomerAvatar({ name }) {
  const initials = (name || "Customer")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
      {initials || "C"}
    </div>
  );
}

function LoadingRows() {
  return Array.from({ length: 6 }).map((_, rowIndex) => (
    <tr key={rowIndex} className="animate-pulse border-b border-neutral-100">
      {Array.from({ length: 6 }).map((__, cellIndex) => (
        <td key={cellIndex} className="px-4 py-5">
          <div
            className={`h-3 rounded bg-neutral-100 ${
              cellIndex === 2 ? "w-56" : "w-24"
            }`}
          />
        </td>
      ))}
    </tr>
  ));
}

function EmptyMessages({ hasFilters, onClear }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <Icon type="message" className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-sm font-semibold text-neutral-900">
        {hasFilters ? "No matching messages" : "No contact messages yet"}
      </h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-500">
        {hasFilters
          ? "Try changing your search or message status."
          : "Messages sent from the contact page will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function MessageModal({
  message,
  updating,
  deleting,
  onClose,
  onMarkAsRead,
  onDelete,
}) {
  useEffect(() => {
    if (!message) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contact message"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <CustomerAvatar name={message.name} />

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-neutral-900">
                {message.name || "Unknown customer"}
              </h2>

              <p className="mt-1 text-[11px] text-neutral-500">
                {formatDate(message.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close message"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          >
            <Icon type="close" />
          </button>
        </header>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href={`mailto:${message.email}`}
              className="inline-flex items-center gap-2 text-xs font-medium text-cyan-700 hover:underline"
            >
              <Icon type="mail" />
              {message.email}
            </a>

            <StatusBadge status={message.status} />
          </div>

          <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-neutral-700">
              {message.message}
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-4">
          <button
            type="button"
            onClick={() => onDelete(message.id)}
            disabled={deleting}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Icon type="trash" />
            {deleting ? "Deleting..." : "Delete"}
          </button>

          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${message.email}`}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              <Icon type="external" />
              Reply by email
            </a>

            {message.status !== "read" && (
              <button
                type="button"
                onClick={() => onMarkAsRead(message.id)}
                disabled={updating}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-neutral-900 px-4 text-xs font-semibold text-white transition hover:bg-black disabled:bg-neutral-300"
              >
                <Icon type="read" />
                {updating ? "Updating..." : "Mark as read"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const showSuccess = (message) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  const markAsRead = async (messageId) => {
    setUpdatingId(messageId);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", messageId)
        .select()
        .single();

      if (error) throw error;

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId ? data : message,
        ),
      );

      setSelectedMessage((current) =>
        current?.id === messageId ? data : current,
      );

      showSuccess("Message marked as read.");
    } catch (error) {
      console.error("Contact status update error:", error);
      setErrorMessage("Could not update the message status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteMessage = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message? This cannot be undone.",
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

      setSelectedMessage((current) =>
        current?.id === messageId ? null : current,
      );

      showSuccess("Contact message deleted.");
    } catch (error) {
      console.error("Contact message delete error:", error);
      setErrorMessage("Could not delete the contact message.");
    } finally {
      setDeletingId(null);
    }
  };

  const summary = useMemo(() => {
    const unread = messages.filter(
      (message) => message.status !== "read",
    ).length;

    const read = messages.length - unread;

    const today = messages.filter((message) => {
      if (!message.created_at) return false;

      const messageDate = new Date(message.created_at);
      const currentDate = new Date();

      return (
        messageDate.getFullYear() === currentDate.getFullYear() &&
        messageDate.getMonth() === currentDate.getMonth() &&
        messageDate.getDate() === currentDate.getDate()
      );
    }).length;

    return { unread, read, today };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return messages.filter((message) => {
      const isRead = message.status === "read";

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "read" && isRead) ||
        (statusFilter === "unread" && !isRead);

      const matchesSearch =
        !normalizedSearch ||
        [message.name, message.email, message.message].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      return matchesStatus && matchesSearch;
    });
  }, [messages, search, statusFilter]);

  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 pb-12 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">
              TeeLab Administration
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              Contact messages
            </h1>

            <p className="mt-1 text-xs text-neutral-500">
              Read and manage messages sent through your contact page.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMessages}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
          >
            <Icon
              type="refresh"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </header>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total messages"
            value={messages.length.toLocaleString("en-EG")}
            icon="message"
            color="bg-violet-100 text-violet-700"
          />

          <SummaryCard
            label="Unread messages"
            value={summary.unread.toLocaleString("en-EG")}
            icon="unread"
            color="bg-blue-100 text-blue-700"
          />

          <SummaryCard
            label="Read messages"
            value={summary.read.toLocaleString("en-EG")}
            icon="read"
            color="bg-emerald-100 text-emerald-700"
          />

          <SummaryCard
            label="Received today"
            value={summary.today.toLocaleString("en-EG")}
            icon="mail"
            color="bg-amber-100 text-amber-700"
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 flex items-center justify-between gap-4 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700"
          >
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700"
          >
            {successMessage}
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 p-3">
            <div className="relative min-w-60 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Icon type="search" />
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or message"
                className="h-9 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-9 text-xs text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-3 text-sm text-neutral-400 hover:text-black"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-600 outline-none focus:border-neutral-600"
            >
              <option value="all">All messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#fafafa]">
                  {["Customer", "Message", "Received", "Status", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-neutral-500"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {loading && <LoadingRows />}

                {!loading &&
                  filteredMessages.map((message) => (
                    <tr
                      key={message.id}
                      className={`border-b border-neutral-100 transition last:border-b-0 hover:bg-[#fafafa] ${
                        message.status !== "read" ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar name={message.name} />

                          <div className="min-w-0">
                            <p className="max-w-44 truncate text-xs font-semibold text-neutral-900">
                              {message.name || "Unknown customer"}
                            </p>

                            <a
                              href={`mailto:${message.email}`}
                              className="mt-1 block max-w-52 truncate text-[10px] text-neutral-500 hover:underline"
                            >
                              {message.email || "No email"}
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(message)}
                          className="block max-w-lg text-left"
                        >
                          <p className="line-clamp-2 text-xs leading-5 text-neutral-600 hover:text-neutral-900">
                            {message.message || "No message content"}
                          </p>
                        </button>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-xs text-neutral-500">
                        {formatDate(message.created_at)}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={message.status} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            aria-label="Open message"
                            onClick={() => setSelectedMessage(message)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-400 hover:text-black"
                          >
                            <Icon type="eye" />
                          </button>

                          {message.status !== "read" && (
                            <button
                              type="button"
                              aria-label="Mark as read"
                              onClick={() => markAsRead(message.id)}
                              disabled={updatingId === message.id}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
                            >
                              <Icon type="read" />
                            </button>
                          )}

                          <button
                            type="button"
                            aria-label="Delete message"
                            onClick={() => deleteMessage(message.id)}
                            disabled={deletingId === message.id}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                          >
                            <Icon type="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!loading && !filteredMessages.length && (
              <EmptyMessages
                hasFilters={Boolean(search.trim() || statusFilter !== "all")}
                onClear={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              />
            )}
          </div>

          {!loading && filteredMessages.length > 0 && (
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3">
              <p className="text-[11px] text-neutral-500">
                Showing {filteredMessages.length.toLocaleString("en-EG")} of{" "}
                {messages.length.toLocaleString("en-EG")} messages
              </p>

              <p className="text-[11px] text-neutral-400">
                {summary.unread.toLocaleString("en-EG")} unread
              </p>
            </footer>
          )}
        </div>
      </div>

      <MessageModal
        message={selectedMessage}
        updating={updatingId === selectedMessage?.id}
        deleting={deletingId === selectedMessage?.id}
        onClose={() => setSelectedMessage(null)}
        onMarkAsRead={markAsRead}
        onDelete={deleteMessage}
      />
    </section>
  );
}

export default AdminContact;
