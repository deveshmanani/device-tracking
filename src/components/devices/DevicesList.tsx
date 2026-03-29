"use client";

import { useMemo, useState, useEffect } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { useRouter } from "next/navigation";
import {
  useDevices,
  useDevicePlatforms,
  useDeviceBrands,
} from "@/hooks/useDevices";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { DeviceListItem } from "@/server/devices";
import type { DeviceStatus } from "@/types/database";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select-native";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusChangeSelect from "@/components/admin/StatusChangeSelect";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { DeviceListSkeleton } from "@/components/shared/Skeletons";
import { NoDevicesFound, ErrorState } from "@/components/shared/EmptyStates";
import { ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface DevicesListProps {
  userRole?: "admin" | "user";
}

const DevicesList = ({ userRole }: DevicesListProps) => {
  const router = useRouter();
  
  // URL state management with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    platform: parseAsString.withDefault(""),
    brand: parseAsString.withDefault(""),
  });

  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = useState(filters.search);

  // Local state for mobile filter collapse
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search input (500ms delay)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Sync local search input when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Fetch data
  const {
    data: devices,
    isLoading,
    error,
  } = useDevices({
    search: filters.search || undefined,
    status: (filters.status as DeviceStatus) || undefined,
    platform: filters.platform || undefined,
    brand: filters.brand || undefined,
  });

  const { data: platforms } = useDevicePlatforms();
  const { data: brands } = useDeviceBrands();

  // Table columns
  const columns = useMemo<ColumnDef<DeviceListItem>[]>(() => {
    const baseColumns: ColumnDef<DeviceListItem>[] = [
      {
        accessorKey: "image_url",
        header: "Image",
        cell: ({ row }) => (
          <div className="w-16 h-16 relative rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {row.original.image_url ? (
              <img
                src={row.original.image_url}
                alt={row.original.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No image</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "asset_tag",
        header: "Asset Tag",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-primary">
            {row.original.asset_tag}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "brand",
        header: "Brand/Model",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.brand}</div>
            <div className="text-muted-foreground">{row.original.model}</div>
          </div>
        ),
      },
      {
        accessorKey: "platform",
        header: "Platform",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "current_holder",
        header: "Current Holder",
        cell: ({ row }) => {
          const holder = row.original.current_holder;
          return holder ? (
            <div className="text-sm">{holder.full_name || holder.email}</div>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          );
        },
      },
    ];

    // Add Actions column for admins
    if (userRole === "admin") {
      baseColumns.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <StatusChangeSelect
            deviceId={row.original.id}
            currentStatus={row.original.status}
            deviceName={row.original.name}
          />
        ),
      });
    }

    return baseColumns;
  }, [userRole]);

  const table = useReactTable({
    data: devices || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const hasActiveFilters =
    filters.search || filters.status || filters.platform || filters.brand;

  const hasActiveNonSearchFilters =
    filters.status || filters.platform || filters.brand;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="py-0">
        <CardContent className="p-2">
          {/* Desktop: Original layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-4">
            <div className="pt-2 pb-2">
              <Input
                placeholder="Search devices..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div>
              <Select
                value={filters.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFilters({ status: e.target.value })
                }
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="checked_out">Booked</option>
                <option value="in_repair">In Repair</option>
                <option value="retired">Retired</option>
                <option value="lost">Lost</option>
              </Select>
            </div>
            <div>
              <Select
                value={filters.platform}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFilters({ platform: e.target.value })
                }
              >
                <option value="">All Platforms</option>
                {platforms?.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Select
                value={filters.brand}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFilters({ brand: e.target.value })
                }
              >
                <option value="">All Brands</option>
                {brands?.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Mobile: Search + Collapsible Filters */}
          <div className="md:hidden space-y-3">
            {/* Search Input with Filter Icon */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search devices..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="relative"
              >
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                {hasActiveNonSearchFilters && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                    {
                      [filters.status, filters.platform, filters.brand].filter(
                        Boolean,
                      ).length
                    }
                  </span>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Section */}
            {isFilterOpen && (
              <div className="space-y-3 pt-1">
                <div>
                  <Select
                    value={filters.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFilters({ status: e.target.value })
                    }
                  >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="checked_out">Booked</option>
                    <option value="in_repair">In Repair</option>
                    <option value="retired">Retired</option>
                    <option value="lost">Lost</option>
                  </Select>
                </div>
                <div>
                  <Select
                    value={filters.platform}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFilters({ platform: e.target.value })
                    }
                  >
                    <option value="">All Platforms</option>
                    {platforms?.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    value={filters.brand}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFilters({ brand: e.target.value })
                    }
                  >
                    <option value="">All Brands</option>
                    {brands?.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table - Show loading, error, or data states */}
      {error ? (
        <ErrorState
          title="Failed to load devices"
          description={
            error.message ||
            "An unexpected error occurred while loading devices."
          }
          onRetry={() => window.location.reload()}
        />
      ) : isLoading ? (
        <DeviceListSkeleton />
      ) : devices && devices.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-background">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/devices/${row.original.id}`)}
                    className="border-t border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td 
                        key={cell.id} 
                        className="px-4 py-3"
                        onClick={(e) => {
                          if (cell.column.id === 'actions') {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {devices.map((device) => (
              <Card
                key={device.id}
                className="hover:border-primary/50 transition-colors py-0"
              >
                <CardContent className="p-4">
                  <Link href={`/devices/${device.id}`}>
                    <div className="flex gap-3">
                      {/* Device Image Thumbnail */}
                      <div className="w-20 h-20 relative rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        {device.image_url ? (
                          <img
                            src={device.image_url}
                            alt={device.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground text-center px-1">
                            No image
                          </span>
                        )}
                      </div>
                      
                      {/* Device Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{device.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {device.brand} {device.model}
                            </p>
                          </div>
                          <StatusBadge status={device.status} />
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            Asset:{" "}
                            <span className="font-mono">{device.asset_tag}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Platform: {device.platform}
                          </p>
                          {device.current_holder && (
                            <p className="text-primary">
                              Holder:{" "}
                              {device.current_holder.full_name ||
                                device.current_holder.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {userRole === "admin" && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Admin Actions:
                      </div>
                      <StatusChangeSelect
                        deviceId={device.id}
                        currentStatus={device.status}
                        deviceName={device.name}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Showing {devices.length} device{devices.length !== 1 ? "s" : ""}
          </div>
        </>
      ) : (
        <NoDevicesFound
          hasFilters={!!hasActiveFilters}
          onClearFilters={() =>
            setFilters({ search: "", status: "", platform: "", brand: "" })
          }
        />
      )}
    </div>
  );
};

export default DevicesList;
