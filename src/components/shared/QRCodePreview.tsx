'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import { generateQRPayload } from '@/lib/qr';

interface QRCodePreviewProps {
  deviceId: string;
  deviceName?: string;
  assetTag?: string;
  showDownload?: boolean;
  showPrint?: boolean;
  size?: number;
}

const QRCodePreview = ({
  deviceId,
  deviceName,
  assetTag,
  showDownload = true,
  showPrint = true,
  size = 256,
}: QRCodePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      try {
        const payload = generateQRPayload(deviceId);
        await QRCode.toCanvas(canvasRef.current, payload, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
        setError(null);
      } catch (err) {
        setError('Failed to generate QR code');
        console.error('QR generation error:', err);
      }
    };

    generateQR();
  }, [deviceId, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-${assetTag || deviceId}.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${deviceName || assetTag || deviceId}</title>
          <style>
            @media print {
              @page {
                size: 4in 2in;
                margin: 0.25in;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 1rem;
            }
            .label {
              text-align: center;
              max-width: 3.5in;
            }
            .qr-image {
              width: 2in;
              height: 2in;
              margin: 0 auto 0.5rem;
            }
            .device-name {
              font-size: 14pt;
              font-weight: bold;
              margin: 0 0 0.25rem 0;
            }
            .asset-tag {
              font-size: 12pt;
              margin: 0;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <img src="${dataUrl}" alt="QR Code" class="qr-image" />
            ${deviceName ? `<p class="device-name">${deviceName}</p>` : ''}
            ${assetTag ? `<p class="asset-tag">${assetTag}</p>` : ''}
          </div>
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-center text-destructive p-4">{error}</div>
        ) : (
          <>
            <div className="flex justify-center">
              <canvas ref={canvasRef} className="border border-border rounded" />
            </div>
            
            {(showDownload || showPrint) && (
              <div className="flex gap-2 justify-center">
                {showDownload && (
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
                {showPrint && (
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Label
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodePreview;
