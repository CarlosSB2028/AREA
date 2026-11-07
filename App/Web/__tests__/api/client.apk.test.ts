import { GET } from '@/app/api/client.apk/route';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Mock dependencies
jest.mock('next/server', () => ({
  NextResponse: jest.fn(),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('/api/client.apk', () => {
  const mockNextResponse = NextResponse as jest.MockedClass<typeof NextResponse>;
  const mockReadFileSync = fs.readFileSync as jest.Mock;
  const mockPathJoin = path.join as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('serves APK file successfully', async () => {
    const mockApkPath = '/mock/path/client.apk';
    const mockFileBuffer = Buffer.from('mock apk content');
    const mockResponse = { status: 200 };

    mockPathJoin.mockReturnValue(mockApkPath);
    mockReadFileSync.mockReturnValue(mockFileBuffer);
    mockNextResponse.mockReturnValue(mockResponse as any);

    const response = await GET();

    expect(mockPathJoin).toHaveBeenCalledWith(process.cwd(), 'apk', 'client.apk');
    expect(mockReadFileSync).toHaveBeenCalledWith(mockApkPath);
    expect(mockNextResponse).toHaveBeenCalledWith(mockFileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="client.apk"',
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('returns 404 when APK file is not found', async () => {
    const mockApkPath = '/mock/path/client.apk';
    const mockError = new Error('File not found');
    const mockResponse = { status: 404 };

    mockPathJoin.mockReturnValue(mockApkPath);
    mockReadFileSync.mockImplementation(() => {
      throw mockError;
    });
    mockNextResponse.mockReturnValue(mockResponse as any);

    // Mock console.error to avoid console output during test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET();

    expect(mockPathJoin).toHaveBeenCalledWith(process.cwd(), 'apk', 'client.apk');
    expect(mockReadFileSync).toHaveBeenCalledWith(mockApkPath);
    expect(consoleSpy).toHaveBeenCalledWith('Error serving APK:', mockError);
    expect(mockNextResponse).toHaveBeenCalledWith('APK not found', { status: 404 });
    expect(response).toEqual(mockResponse);

    consoleSpy.mockRestore();
  });

  it('sets correct headers for APK download', async () => {
    const mockApkPath = '/mock/path/client.apk';
    const mockFileBuffer = Buffer.from('mock apk content');
    const mockResponse = { status: 200 };

    mockPathJoin.mockReturnValue(mockApkPath);
    mockReadFileSync.mockReturnValue(mockFileBuffer);
    mockNextResponse.mockReturnValue(mockResponse as any);

    await GET();

    expect(mockNextResponse).toHaveBeenCalledWith(mockFileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="client.apk"',
      },
    });
  });

  it('uses correct APK file path', async () => {
    const mockApkPath = '/mock/path/client.apk';
    const mockFileBuffer = Buffer.from('mock apk content');
    const mockResponse = { status: 200 };

    mockPathJoin.mockReturnValue(mockApkPath);
    mockReadFileSync.mockReturnValue(mockFileBuffer);
    mockNextResponse.mockReturnValue(mockResponse as any);

    await GET();

    expect(mockPathJoin).toHaveBeenCalledWith(process.cwd(), 'apk', 'client.apk');
  });

  it('reads file synchronously', async () => {
    const mockApkPath = '/mock/path/client.apk';
    const mockFileBuffer = Buffer.from('mock apk content');
    const mockResponse = { status: 200 };

    mockPathJoin.mockReturnValue(mockApkPath);
    mockReadFileSync.mockReturnValue(mockFileBuffer);
    mockNextResponse.mockReturnValue(mockResponse as any);

    await GET();

    expect(mockReadFileSync).toHaveBeenCalledWith(mockApkPath);
  });
});