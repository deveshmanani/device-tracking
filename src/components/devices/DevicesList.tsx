'use client';

import { useMemo } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import { useDevices, useDevicePlatforms, useDeviceBrands } from '@/hooks/useDevices';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import type { DeviceListItem } from '@/server/devices';
import type { DeviceStatus } from '@/types/database';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import StatusBadge from '@/components/shared/StatusBadge';
import Loading from '@/components/ui/Loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';

const DevicesList = () => {
  // URL state management with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(''),
    status: parseAsString.withDefault(''),
    platform: parseAsString.withDefault(''),
    brand: parseAsString.withDefault(''),
  });

  // Fetch data
  const { data: devices, isLoading, error } = useDevices({
    search: filters.search || undefined,
    status: (filters.status as DeviceStatus) || undefined,
    platform: filters.platform || undefined,
    brand: filters.brand || undefined,
  });

  const { data: platforms } = useDevicePlatforms();
  const { data: brands } = useDeviceBrands();

  // Table columns
  const columns = useMemo<ColumnDef<DeviceListItem>[]>(
    () => [
      {
        accessorKey: 'asset_tag',
        header: 'Asset Tag',
        cell: ({ row }) => (
          <Link 
            href={`/devices/${row.original.id}`}
            className="font-mono text-sm text-primary hover:underline"
          >
            {row.original.asset_tag}
          </Link>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <Link 
              href={`/devices/${row.original.id}`}
              className="font-medium hover:text-primary"
            >
              {row.original.name}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'brand',
        header: 'Brand/Model',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.brand}</div>
            <div className="text-muted-foreground">{row.original.model}</div>
          </div>
        ),
      },
      {
        accessorKey: 'platform',
        header: 'Platform',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'current_holder',
        header: 'Current Holder',
        cell: ({ row }) => {
          const holder = row.original.current_holder;
          return holder ? (
            <div className="text-sm">
              {holder.full_name || holder.email}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: devices || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading devices</AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search devices..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
              />
            </div>
            <div>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="checked_out">Checked Out</option>
                <option value="in_repair">In Repair</option>
                <option value="retired">Retired</option>
                <option value="lost">Lost</option>
              </Select>
            </div>
            <div>
              <Select
                value={filters.platform}
                onChange={(e) => setFilters({ platform: e.target.value })}
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
                onChange={(e) => setFilters({ brand: e.target.value })}
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
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Loading />
          </CardContent>
        </Card>
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
                          header.getContext()
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
                    className="border-t border-border hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
              <Link key={device.id} href={`/devices/${device.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
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
                        Asset: <span className="font-mono">{device.asset_tag}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Platform: {device.platform}
                      </p>
                      {device.current_holder && (
                        <p className="text-primary">
                          Holder: {device.current_holder.full_name || device.current_holder.email}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Showing {devices.length} device{devices.length !== 1 ? 's' : ''}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No devices found matching your filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DevicesList;
