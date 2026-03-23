"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select-native";
import { changeDeviceStatus } from "@/server";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { DeviceStatus } from "@/types/database";
import { Loader2 } from "lucide-react";

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
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: DeviceStatus) => {
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
          refetchType: 'active' // Force immediate refetch of active queries
        });
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.myDevices.all,
          refetchType: 'active'
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

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value as DeviceStatus)}
          disabled={isChanging}
          className="text-sm"
        >
          <option value="available">Available</option>
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
  );
};

export default StatusChangeSelect;
