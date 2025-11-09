"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminTabs from "./admin-tabs";

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminDialog({ open, onOpenChange }: AdminDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Administración</DialogTitle>
          <DialogDescription>
            Gestiona roles, equipo y compañías
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <AdminTabs />
        </div>
      </DialogContent>
    </Dialog>
  );
}
