import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const apkPath = path.join(process.cwd(), 'apk', 'client.apk');

  try {
    const fileBuffer = fs.readFileSync(apkPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="client.apk"',
      },
    });
  } catch (error) {
    console.error('Error serving APK:', error);
    return new NextResponse('APK not found', { status: 404 });
  }
}