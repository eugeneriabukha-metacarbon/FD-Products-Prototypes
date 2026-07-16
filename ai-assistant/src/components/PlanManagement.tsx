import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  SparkleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { TableCell } from "@financedistrict/apps-ui/table-cell";

import { TableTitle } from "./TableTitle";

interface Invoice {
  id: string;
  date: string;
  total: string;
  status: "paid" | "failed";
}

/** Shared column template so the header labels line up with each row's cells.
 *  The Details column is a FIXED width (not `auto`) so it occupies the same
 *  space in the header (empty) as in the rows — otherwise the fr-columns
 *  distribute differently and the labels drift out of alignment. */
const COLS = "grid-cols-[2fr_1fr_1.4fr_5rem]";

export interface PlanManagementProps {
  planName: string;
  /** Yearly price string like "$10" — drives the mock invoice amounts. */
  priceYearly: string;
  renewsOn: string;
  /** Open the plan grid to change tiers. */
  onUpgrade: () => void;
  /** Open the cancel-confirmation dialog. */
  onCancel: () => void;
}

/**
 * Subscription-management view for a paid plan (in-house design): current-plan
 * card + invoices table (DS TableCell rows) + cancellation section.
 */
export function PlanManagement({
  planName,
  priceYearly,
  renewsOn,
  onUpgrade,
  onCancel,
}: PlanManagementProps) {
  const amount = `${priceYearly.replace("$", "")} USD`;
  const invoices: Invoice[] = [
    { id: "inv-3", date: "Jul 8, 2026", total: amount, status: "paid" },
    { id: "inv-2", date: "Jun 8, 2026", total: amount, status: "paid" },
    { id: "inv-1", date: "May 8, 2026", total: amount, status: "failed" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-10 px-4 pt-4 pb-16">
      {/* current plan card */}
      <div className="bg-card-background border-card-border rounded-md flex items-center justify-between gap-4 border p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <SparkleIcon
              size={24}
              weight="fill"
              className="text-card-foreground"
              aria-hidden="true"
            />
            <span className="display-04 text-card-foreground">{planName}</span>
          </div>
          <p className="body-03 text-card-foreground-muted">
            Auto renews on {renewsOn}.
          </p>
        </div>
        <Button variation="secondary" size="md" onClick={onUpgrade}>
          Change plan
        </Button>
      </div>

      {/* invoices */}
      <section className="flex flex-col gap-4">
        <h2 className="display-04 text-primary-foreground">Invoices</h2>

        <div className="flex flex-col">
          {/* column header — DS `table-title` bar (uppercase caption + divider) */}
          <TableTitle>
            <div className={`grid ${COLS} w-full items-center gap-3`}>
              <span className="caption-03-medium text-card-foreground-muted truncate uppercase">
                Date
              </span>
              <span className="caption-03-medium text-card-foreground-muted truncate uppercase">
                Total
              </span>
              <span className="caption-03-medium text-card-foreground-muted truncate uppercase">
                Status
              </span>
              <span aria-hidden="true" />
            </div>
          </TableTitle>

          {invoices.map((invoice, index) => (
            <TableCell key={invoice.id} last={index === invoices.length - 1}>
              <div className={`grid ${COLS} w-full items-center gap-3`}>
                <span className="body-03 text-card-foreground">
                  {invoice.date}
                </span>
                <span className="body-03 text-card-foreground">
                  {invoice.total}
                </span>
                <span className="flex items-center gap-1.5">
                  {invoice.status === "paid" ? (
                    <CheckCircleIcon
                      size={20}
                      weight="fill"
                      className="text-success-primary-foreground shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircleIcon
                      size={20}
                      weight="fill"
                      className="text-destructive-primary-foreground shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="body-03 text-card-foreground">
                    {invoice.status === "paid" ? "Paid" : "Failed"}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`View invoice details for ${invoice.date}`}
                  className="text-foreground-muted hover:text-foreground focus-visible:outline-focus flex cursor-pointer items-center gap-1 justify-self-end rounded-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                >
                  <span className="body-03">Details</span>
                  <ArrowSquareOutIcon size={14} aria-hidden="true" />
                </button>
              </div>
            </TableCell>
          ))}
        </div>
      </section>

      {/* cancellation */}
      <section className="flex items-center justify-between gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="display-04 text-primary-foreground">Cancellation</h2>
          <p className="body-03 text-primary-foreground-muted">
            You'll keep {planName} until the end of your billing period, then
            move to Free.
          </p>
        </div>
        <Button
          variation="destructive"
          size="sm"
          onClick={onCancel}
          wrapperClassName="shrink-0"
          className="whitespace-nowrap"
        >
          Cancel plan
        </Button>
      </section>
    </div>
  );
}
