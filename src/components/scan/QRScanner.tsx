'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loading } from '@/components/ui/loading';
import { parseQRPayload } from '@/lib/qr';
import { getDeviceById, assignDeviceToMe, returnDevice } from '@/server';
import { Camera, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import type { DeviceDetail } from '@/server/devices';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ScanState = 'idle' | 'initializing' | 'scanning' | 'processing' | 'result';
type PermissionState = 'granted' | 'denied' | 'unsupported' | 'unknown';

const QRScanner = () => {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [state, setState] = useState<ScanState>('idle');
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);

  const startScanner = async () => {
    setState('initializing');
    setError(null);
    setActionResult(null);

    // Wait for DOM to update before initializing scanner
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('unsupported');
        setError('Camera access is not supported in this browser');
        setState('idle');
        return;
      }

      // Check if element exists
      const element = document.getElementById('qr-reader');
      if (!element) {
        setError('Scanner element not found. Please try again.');
        setState('idle');
        return;
      }

      console.log('Starting scanner with element:', element);

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
        },
        async (decodedText) => {
          console.log('QR Code detected:', decodedText);
          // Stop scanner and process result
          await stopScanner();
          await handleScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (happens frequently)
        }
      );

      console.log('Scanner started successfully');
      setPermissionState('granted');
      setState('scanning');
    } catch (err: any) {
      console.error('Scanner start error:', err);
      
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setPermissionState('denied');
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device');
      } else {
        setError('Failed to start camera: ' + (err.message || 'Unknown error'));
      }
      
      setState('idle');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
    }
    scannerRef.current = null;
    setState('idle');
  };

  const handleScan = async (scannedText: string) => {
    setState('processing');
    setError(null);
    setDevice(null);
    setActionResult(null);

    try {
      // Parse QR payload
      const deviceId = parseQRPayload(scannedText);
      
      if (!deviceId) {
        setError('Invalid QR code. Please scan a valid device QR code.');
        setState('idle');
        return;
      }

      // Fetch device details
      const deviceData = await getDeviceById(deviceId);
      
      if (!deviceData) {
        setError('Device not found');
        setState('idle');
        return;
      }

      setDevice(deviceData);
      setState('result');
    } catch (err: any) {
      console.error('Scan processing error:', err);
      
      // Check if it's a permission error
      if (err.message?.includes("don't have permission")) {
        setError("You don't have permission to access this device (Android, iOS, and iPadOS devices only)");
      } else {
        setError(err.message || 'Failed to process QR code');
      }
      
      setState('idle');
    }
  };

  const handleAssign = async () => {
    if (!device) return;

    setState('processing');
    setActionResult(null);

    try {
      const result = await assignDeviceToMe(device.id);
      setActionResult(result);
      
      if (result.success) {
        // Refresh device data
        const updated = await getDeviceById(device.id);
        setDevice(updated);
      }
    } catch (err: any) {
      setActionResult({
        success: false,
        message: err.message || 'Failed to assign device',
      });
    }

    setState('result');
  };

  const handleReturn = async () => {
    if (!device) return;

    setState('processing');
    setActionResult(null);

    try {
      const result = await returnDevice(device.id);
      setActionResult(result);
      
      if (result.success) {
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          router.push('/devices');
        }, 1500);
      }
    } catch (err: any) {
      setActionResult({
        success: false,
        message: err.message || 'Failed to return device',
      });
      setState('result');
    }
  };

  const resetScanner = () => {
    setState('idle');
    setDevice(null);
    setError(null);
    setActionResult(null);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Camera View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Scanner container - always render to prevent DOM issues */}
            <div 
              id="qr-reader" 
              className={state !== 'scanning' ? 'hidden' : ''}
              style={{ 
                width: '100%',
                minHeight: state === 'scanning' ? '400px' : '0'
              }}
            />
            
            {state === 'idle' && (
              <>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Tap "Start Scanning" to begin
                    </p>
                  </div>
                </div>
                <Button onClick={startScanner} className="w-full" size="lg">
                  Start Scanning
                </Button>
                
                {permissionState === 'denied' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                      Please enable camera permissions in your browser settings and try again.
                    </AlertDescription>
                  </Alert>
                )}
                
                {permissionState === 'unsupported' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Supported</AlertTitle>
                    <AlertDescription>
                      Camera access is not supported in this browser. Please try a modern browser like Chrome, Safari, or Edge.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {state === 'initializing' && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loading />
                  <p className="text-sm text-muted-foreground mt-3">
                    Initializing camera...
                  </p>
                </div>
              </div>
            )}

            {state === 'scanning' && (
              <Button onClick={stopScanner} variant="outline" className="w-full">
                Stop Scanning
              </Button>
            )}

            {state === 'processing' && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loading />
                  <p className="text-sm text-muted-foreground mt-3">
                    Processing...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Result */}
      {state === 'result' && device && (
        <Card>
          <CardHeader>
            <CardTitle>Scanned Device</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{device.name}</h3>
                <StatusBadge status={device.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {device.brand} {device.model}
              </p>
              <p className="text-sm font-mono">Asset Tag: {device.asset_tag}</p>
            </div>

            {/* Current Holder */}
            {device.current_holder && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Currently Assigned To:</p>
                <p className="text-sm">
                  {device.current_holder.full_name || device.current_holder.email}
                </p>
              </div>
            )}

            {/* Action Result */}
            {actionResult && (
              <Alert variant={actionResult.success ? 'default' : 'destructive'}>
                {actionResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{actionResult.message}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {device.status === 'available' && (
                <Button onClick={handleAssign} className="w-full" size="lg">
                  Assign to Me
                </Button>
              )}

              {device.status === 'checked_out' && device.current_holder && (
                <Button
                  onClick={handleReturn}
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  Return Device
                </Button>
              )}

              {(device.status === 'in_repair' || device.status === 'retired' || device.status === 'lost') && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This device is currently {device.status.replace('_', ' ')} and cannot be assigned.
                  </AlertDescription>
                </Alert>
              )}

              <Link href={`/devices/${device.id}`}>
                <Button variant="outline" className="w-full">
                  View Device Details
                </Button>
              </Link>

              <Button variant="ghost" onClick={resetScanner} className="w-full">
                Scan Another Device
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;
