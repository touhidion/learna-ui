"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A modal dialog built on the native `<dialog>` element — feature UI1.
 *
 * Using the platform element rather than a hand-rolled overlay means focus
 * trapping, inertness of the page behind, Escape-to-close and the top layer
 * are handled by the browser, not by us.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  // showModal/close cannot be expressed as a prop, so the open state is
  // mirrored onto the element imperatively. Calling showModal on an
  // already-open dialog throws, hence the guards.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Escape closes the dialog natively; this keeps React's state in step.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      // The backdrop is styled through the ::backdrop pseudo-element; the
      // dialog itself is reset because UA styles give it a border and margin.
      className={cn(
        "m-auto w-[calc(100vw-2rem)] max-w-lg rounded-lg border border-border bg-card p-0 text-card-foreground shadow-lg",
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        className,
      )}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself, since
        // the content is inside a child. Anything deeper is a real click.
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="space-y-1">
          <h2 id="dialog-title" className="text-base font-semibold">
            {title}
          </h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X aria-hidden="true" />
        </Button>
      </div>

      {children && <div className="p-5">{children}</div>}

      {footer && (
        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 p-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}

/**
 * Confirmation dialog for destructive actions — features AC4, AUM5, AM3.
 *
 * The confirm button carries the destructive variant and the consequence is
 * spelled out in the body, because a cascade delete is not undoable.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  isLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  isLoading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-muted-foreground">{description}</div>
    </Dialog>
  );
}
