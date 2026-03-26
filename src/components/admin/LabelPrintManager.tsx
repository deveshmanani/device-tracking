'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useDevices } from '@/hooks/useDevices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Search } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import type { DeviceListItem } from '@/server/devices';
import QRCode from 'qrcode';
import { generateQRPayload } from '@/lib/qr';

const LabelPrintManager = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isPrinting, setIsPrinting] = useState(false);

  const { data, isLoading, error } = useDevices({});

  const columns = useMemo<ColumnDef<DeviceListItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'name',
        header: 'Device Name',
      },
      {
        accessorKey: 'asset_tag',
        header: 'Asset Tag',
      },
      {
        accessorKey: 'brand',
        header: 'Brand',
      },
      {
        accessorKey: 'model',
        header: 'Model',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      rowSelection,
      globalFilter,
    },
    globalFilterFn: 'includesString',
  });

  const selectedDevices = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const handlePrint = async () => {
    if (selectedDevices.length === 0) return;

    setIsPrinting(true);

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print labels');
        setIsPrinting(false);
        return;
      }

      const qrCodes = await Promise.all(
        selectedDevices.map(async (device) => {
          const payload = generateQRPayload(device.id);
          const dataUrl = await QRCode.toDataURL(payload, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'M',
          });
          return {
            device,
            dataUrl,
          };
        })
      );

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Device Labels</title>
            <style>
              @media print {
                @page {
                  size: 4in 2in;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                .label {
                  page-break-after: always;
                }
                .label:last-child {
                  page-break-after: auto;
                }
              }
              * {
                box-sizing: border-box;
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 0;
              }
              .label {
                width: 4in;
                height: 2in;
                padding: 0.25in;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
              }
              .label-content {
                width: 100%;
              }
              .qr-image {
                width: 1.5in;
                height: 1.5in;
                margin: 0 auto 0.25rem;
              }
              .device-name {
                font-size: 12pt;
                font-weight: bold;
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            </style>
          </head>
          <body>
            ${qrCodes
              .map(
                ({ device, dataUrl }) => `
              <div class="label">
                <div class="label-content">
                  <img src="${dataUrl}" alt="QR Code" class="qr-image" />
                  <p class="device-name">${device.name}</p>
                </div>
              </div>
            `
              )
              .join('')}
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Print error:', err);
      alert('Failed to generate labels for printing');
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load devices: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Devices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handlePrint}
              disabled={selectedDevices.length === 0 || isPrinting}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print {selectedDevices.length > 0 && `(${selectedDevices.length})`}
            </Button>
          </div>

          {selectedDevices.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedDevices.length} device{selectedDevices.length !== 1 ? 's' : ''}{' '}
              selected for printing
            </p>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No devices found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-border hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelPrintManager;
