import { GET } from '@/app/api/health/route';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('/api/health', () => {
  const mockJson = NextResponse.json as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns health status', async () => {
    // Mock the json method to return a mock response
    const mockResponse = {
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      environment: expect.any(String),
    };

    mockJson.mockReturnValue(mockResponse);

    const response = await GET();

    expect(mockJson).toHaveBeenCalledWith(
      {
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
      },
      { status: 200 }
    );

    expect(response).toEqual(mockResponse);
  });

  it('returns correct status code', async () => {
    const mockResponse = { status: 200 };
    mockJson.mockReturnValue(mockResponse);

    await GET();

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
      }),
      { status: 200 }
    );
  });

  it('includes timestamp in response', async () => {
    const mockResponse = { timestamp: 'mock-timestamp' };
    mockJson.mockReturnValue(mockResponse);

    await GET();

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
      }),
      { status: 200 }
    );
  });

  it('includes uptime in response', async () => {
    const mockResponse = { uptime: 123.45 };
    mockJson.mockReturnValue(mockResponse);

    await GET();

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        uptime: expect.any(Number),
      }),
      { status: 200 }
    );
  });

  it('includes environment in response', async () => {
    const mockResponse = { environment: 'test' };
    mockJson.mockReturnValue(mockResponse);

    await GET();

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: expect.any(String),
      }),
      { status: 200 }
    );
  });
});