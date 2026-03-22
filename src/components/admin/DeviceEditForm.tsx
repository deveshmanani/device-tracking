'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { updateDevice, type UpdateDeviceInput } from '@/server';
import { useDevice } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { DeviceStatus } from '@/types/database';

interface DeviceEditFormProps {
  deviceId: string;
}

const DeviceEditForm = ({ deviceId }: DeviceEditFormProps) => {
  const router = useRouter();
  const { data: device, isLoading, error: loadError } = useDevice(deviceId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      brand: '',
      model: '',
      platform: '',
      os_version: '',
      serial_number: '',
      imei: '',
      asset_tag: '',
      status: 'available' as DeviceStatus,
      condition_note: '',
      location_name: '',
      image_url: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const input: UpdateDeviceInput = {
          name: value.name,
          brand: value.brand,
          model: value.model,
          platform: value.platform,
          asset_tag: value.asset_tag,
          status: value.status,
          os_version: value.os_version || undefined,
          serial_number: value.serial_number || undefined,
          imei: value.imei || undefined,
          condition_note: value.condition_note || undefined,
          location_name: value.location_name || undefined,
          image_url: value.image_url || undefined,
        };

        await updateDevice(deviceId, input);
        router.push(`/devices/${deviceId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update device');
        setIsSubmitting(false);
      }
    },
  });

  // Update form when device data loads
  useEffect(() => {
    if (device) {
      form.setFieldValue('name', device.name);
      form.setFieldValue('brand', device.brand);
      form.setFieldValue('model', device.model);
      form.setFieldValue('platform', device.platform);
      form.setFieldValue('os_version', device.os_version || '');
      form.setFieldValue('serial_number', device.serial_number || '');
      form.setFieldValue('imei', device.imei || '');
      form.setFieldValue('asset_tag', device.asset_tag);
      form.setFieldValue('status', device.status);
      form.setFieldValue('condition_note', device.condition_note || '');
      form.setFieldValue('location_name', device.location_name || '');
      form.setFieldValue('image_url', device.image_url || '');
    }
  }, [device, form]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (loadError || !device) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {loadError?.message || 'Device not found'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <form.Field name="name">
              {(field) => (
                <div>
                  <Label htmlFor="name">Device Name *</Label>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., iPhone 15 Pro"
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="brand">
                {(field) => (
                  <div>
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Apple"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="model">
                {(field) => (
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., iPhone 15 Pro"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="platform">
                {(field) => (
                  <div>
                    <Label htmlFor="platform">Platform *</Label>
                    <Select
                      id="platform"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    >
                      <option value="iOS">iOS</option>
                      <option value="iPadOS">iPadOS</option>
                      <option value="Android">Android</option>
                      <option value="macOS">macOS</option>
                      <option value="Windows">Windows</option>
                      <option value="Linux">Linux</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field name="os_version">
                {(field) => (
                  <div>
                    <Label htmlFor="os_version">OS Version</Label>
                    <Input
                      id="os_version"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., 17.4"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="asset_tag">
                {(field) => (
                  <div>
                    <Label htmlFor="asset_tag">Asset Tag *</Label>
                    <Input
                      id="asset_tag"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., ASSET-001"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="status">
                {(field) => (
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      id="status"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as DeviceStatus)}
                    >
                      <option value="available">Available</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="in_repair">In Repair</option>
                      <option value="retired">Retired</option>
                      <option value="lost">Lost</option>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Technical Details</h3>

            <form.Field name="serial_number">
              {(field) => (
                <div>
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="imei">
              {(field) => (
                <div>
                  <Label htmlFor="imei">IMEI (for mobile devices)</Label>
                  <Input
                    id="imei"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Additional Info */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Additional Information</h3>

            <form.Field name="location_name">
              {(field) => (
                <div>
                  <Label htmlFor="location_name">Location</Label>
                  <Input
                    id="location_name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Office - IT Desk"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="image_url">
              {(field) => (
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    External URL to device image
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="condition_note">
              {(field) => (
                <div>
                  <Label htmlFor="condition_note">Condition Notes</Label>
                  <Textarea
                    id="condition_note"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Describe the device condition..."
                    rows={3}
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeviceEditForm;
