export default function OrderStatusBadge({ status }) {
  const labels = {
    new: "New",
    confirmed: "Confirmed",
    design_review: "Design Review",
    ready_for_print: "Ready for Print",
    printing: "Printing",
    quality_check: "Quality Check",
    packed: "Packed",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <span className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold">
      {labels[status] || status}
    </span>
  );
}
