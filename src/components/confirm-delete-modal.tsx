import React from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
            <Trash2 className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              Xác nhận xoá bài viết?
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn xoá bài viết <strong className="text-foreground">"{title}"</strong> không? Hành động này sẽ gỡ bài viết vĩnh viễn khỏi cộng đồng.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/70 pt-4">
          <Button variant="quiet" size="sm" onClick={onClose}>
            Không xoá
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Đồng ý xoá
          </Button>
        </div>
      </div>
    </div>
  );
}
