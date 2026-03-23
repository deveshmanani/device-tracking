"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select-native";
import { changeDeviceStatus, adminAssignDevice } from "@/server";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { DeviceStatus } from "@/types/database";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select as SelectNative } from "@/components/ui/select-native";

interface StatusChangeSelectProps {
  deviceId: string;
  currentStatus: DeviceStatus;
  deviceName: string;
}

const statusLabels: Record<DeviceStatus, string> = {
  available: "Available",
  checked_out: "Booked",
  in_repair: "In Repair",
  retired: "Retired",
  lost: "Lost",
};

const StatusChangeSelect = ({
  deviceId,
  currentStatus,
  deviceName,
}: StatusChangeSelectProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const queryClient = useQueryClient();

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleChange = async (value: string) => {
    if (value === "book_for_user") {
      // Open modal for booking
      setIsBookModalOpen(true);
      setSelectedUserId("");
      setError(null);
      fetchUsers();
      return;
    }

    // Handle status change
    const newStatus = value as DeviceStatus;
    if (newStatus === currentStatus) return;

    // Confirm dangerous status changes
    if (newStatus === "retired" || newStatus === "lost") {
      const confirmed = confirm(
        `Are you sure you want to mark "${deviceName}" as ${statusLabels[newStatus]}? This is a critical status change.`,
      );
      if (!confirmed) return;
    }

    setIsChanging(true);
    setError(null);

    try {
      const result = await changeDeviceStatus(deviceId, newStatus);

      if (result.success) {
        // Invalidate queries to refresh data immediately
        await queryClient.invalidateQueries({
          queryKey: queryKeys.devices.all,
          refetchType: "active",
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.myDevices.all,
          refetchType: "active",
        });
      } else {
        setError(result.message);
        setTimeout(() => setError(null), 5000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to change status");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsChanging(false);
    }
  };

  const handleBookDevice = async () => {
    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    setIsChanging(true);
    setError(null);

    try {
      const result = await adminAssignDevice(deviceId, selectedUserId);

      if (result.success) {
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: queryKeys.devices.all,
          refetchType: "active",
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.myDevices.all,
          refetchType: "active",
        });

        setIsBookModalOpen(false);
        setSelectedUserId("");
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to book device");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="flex items-center gap-2">
          <Select
            value={currentStatus}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isChanging}
            className="text-sm"
          >
            <option value="available">Available</option>
            {currentStatus === "available" && (
              <option value="book_for_user">Book for User</option>
            )}
            <option value="in_repair">In Repair</option>
            <option value="retired">Retired</option>
            <option value="lost">Lost</option>
            {/* checked_out is not selectable - only via assignment */}
            {currentStatus === "checked_out" && (
              <option value="checked_out" disabled>
                Booked (use return flow)
              </option>
            )}
          </Select>
          {isChanging && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {error && (
          <div className="absolute top-full mt-1 text-xs text-destructive whitespace-nowrap z-10 bg-background border border-destructive rounded px-2 py-1">
            {error}
          </div>
        )}
      </div>

      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Device for User</DialogTitle>
            <DialogDescription>
              Select a user to assign <strong>{deviceName}</strong> to.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                <SelectNative
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isChanging}
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </SelectNative>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive mt-2">{error}</div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleBookDevice}
              disabled={isChanging || !selectedUserId || isLoadingUsers}
              className="cursor-pointer"
            >
              {isChanging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Booking...
                </>
              ) : (
                "Book Device"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatusChangeSelect;
