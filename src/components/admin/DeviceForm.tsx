'use client';

import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { createDevice, type CreateDeviceInput } from '@/server';
import { deviceSchema, type DeviceFormData } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const DeviceForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      brand: '',
      model: '',
      platform: 'iOS' as const,
      os_version: '',
      serial_number: '',
      imei: '',
      asset_tag: '',
      location_name: '',
      purchase_date: new Date().toISOString().split('T')[0],
      warranty_expiry: '',
      image_url: '',
      condition_note: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSubmitting(true);

      try {
        // Validate with centralized Zod schema
        const validated = deviceSchema.parse(value);
        
        // Clean up empty strings to undefined
        const input: CreateDeviceInput = {
          name: validated.name,
          brand: validated.brand,
          model: validated.model,
          platform: validated.platform,
          asset_tag: validated.asset_tag,
          serial_number: validated.serial_number || undefined,
          purchase_date: validated.purchase_date || undefined,
          warranty_expiry: validated.warranty_expiry || undefined,
          image_url: validated.image_url || undefined,
          condition_note: validated.notes || undefined,
        };

        const result = await createDevice(input);
        router.push(`/devices/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create device');
        setIsSubmitting(false);
      }
    },
  });

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
                    onBlur={field.handleBlur}
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
                      onBlur={field.handleBlur}
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
                      onBlur={field.handleBlur}
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
                      onChange={(e) => field.handleChange(e.target.value as any)}
                      onBlur={field.handleBlur}
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

            <form.Field name="asset_tag">
              {(field) => (
                <div>
                  <Label htmlFor="asset_tag">Asset Tag *</Label>
                  <Input
                    id="asset_tag"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., ASSET-001"
                  />
                </div>
              )}
            </form.Field>
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
              Create Device
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeviceForm;
