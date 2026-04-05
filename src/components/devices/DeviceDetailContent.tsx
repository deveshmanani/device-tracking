"use client";

import { useDevice } from "@/hooks/useDevices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import QRCodePreview from "@/components/shared/QRCodePreview";
import DeviceHistory from "./DeviceHistory";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar, User, Package } from "lucide-react";

interface DeviceDetailContentProps {
  deviceId: string;
  userRole?: "admin" | "user";
}

const DeviceDetailContent = ({
  deviceId,
  userRole,
}: DeviceDetailContentProps) => {
  const { data: device, isLoading, error } = useDevice(deviceId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (error || !device) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading device</AlertTitle>
        <AlertDescription>
          {error?.message || "Device not found"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button */}
        <div>
          <Link href="/devices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold break-words">{device.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground break-words">
              {device.brand} {device.model}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {device.status === "checked_out" && device.current_holder ? (
              <Tooltip>
                <TooltipTrigger className="cursor-pointer">
                  <StatusBadge status={device.status} />
                </TooltipTrigger>
                <TooltipContent className="p-4 max-w-xs">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Current Assignment</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {device.current_holder.full_name ||
                              device.current_holder.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {device.current_holder.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Checked out:{" "}
                          {new Date(
                            device.current_holder.assigned_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <StatusBadge status={device.status} />
            )}
            {userRole === "admin" && (
              <Link href={`/devices/${device.id}/edit`}>
                <Button variant="outline" size="sm" className="md:size-default">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Asset Tag
                  </p>
                  <p className="font-mono text-sm mt-1 break-all">{device.asset_tag}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Platform
                  </p>
                  <p className="mt-1 break-words">{device.platform}</p>
                </div>
                {device.category && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p className="mt-1 break-words">{device.category}</p>
                  </div>
                )}
                {device.os_version && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      OS Version
                    </p>
                    <p className="mt-1 break-words">{device.os_version}</p>
                  </div>
                )}
                {device.serial_number && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      Serial Number
                    </p>
                    <p className="font-mono text-sm mt-1 break-all">
                      {device.serial_number}
                    </p>
                  </div>
                )}
                {device.imei && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      IMEI
                    </p>
                    <p className="font-mono text-sm mt-1 break-all">{device.imei}</p>
                  </div>
                )}
                {device.location_name && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-1 break-words">{device.location_name}</p>
                  </div>
                )}
              </div>

              {device.condition_note && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Condition Notes
                  </p>
                  <p className="text-sm break-words">{device.condition_note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <QRCodePreview
            deviceId={device.id}
            deviceName={device.name}
            assetTag={device.asset_tag}
            showDownload
            showPrint
          />

          {/* Device Image */}
          {device.image_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={device.image_url}
                    alt={device.name}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created
                </p>
                <p className="text-sm mt-1">
                  {new Date(device.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {device.creator && (
                  <p className="text-xs text-muted-foreground">
                    by {device.creator.full_name || device.creator.email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p className="text-sm mt-1">
                  {new Date(device.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Device History */}
      {userRole === 'admin' && <DeviceHistory deviceId={device.id} />}
    </div>
  );
};

export default DeviceDetailContent;
