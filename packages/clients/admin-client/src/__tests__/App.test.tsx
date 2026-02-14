/**
 * Admin Client Tests
 *
 * Tests for Admin Dashboard component and functionality
 */

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import App from '../App';

describe('Admin Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('App Component', () => {
    it('should render admin dashboard', () => {
      render(<App />);

      expect(screen.getByText('GraphWiz-XR Admin')).toBeInTheDocument();
      expect(screen.getByText('System Administration Dashboard')).toBeInTheDocument();
    });

    it('should render service status section', () => {
      render(<App />);

      expect(screen.getByText('Service Status')).toBeInTheDocument();
    });

    it('should render system statistics section', () => {
      render(<App />);

      expect(screen.getByText('System Statistics')).toBeInTheDocument();
    });

    it('should render quick actions section', () => {
      render(<App />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('View Logs')).toBeInTheDocument();
      expect(screen.getByText('Restart Services')).toBeInTheDocument();
      expect(screen.getByText('Emergency Shutdown')).toBeInTheDocument();
    });

    it('should render all expected services', () => {
      render(<App />);

      expect(screen.getByText('Auth')).toBeInTheDocument();
      expect(screen.getByText('Hub')).toBeInTheDocument();
      expect(screen.getByText('Presence')).toBeInTheDocument();
      expect(screen.getByText('SFU')).toBeInTheDocument();
    });
  });

  describe('Service Health Checking', () => {
    it('should check service health on mount', () => {
      mockFetch.mockResolvedValue({
        ok: true
      });

      render(<App />);

      expect(mockFetch).toHaveBeenCalled();
      // Multiple services and stats are fetched
      expect(mockFetch.mock.calls.length).toBeGreaterThan(0);
    });

    it('should periodically check service health', () => {
      mockFetch.mockResolvedValue({
        ok: true
      });

      render(<App />);

      const initialCallCount = mockFetch.mock.calls.length;
      expect(initialCallCount).toBeGreaterThan(0);

      vi.advanceTimersByTime(10000);

      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('StatusIndicator Component', () => {
    it('should render service status indicators', () => {
      render(<App />);

      // Check that service names are displayed
      expect(screen.getByText('Auth')).toBeInTheDocument();
      expect(screen.getByText('Hub')).toBeInTheDocument();
    });
  });

  describe('System Statistics', () => {
    it('should display loading state initially', () => {
      render(<App />);

      expect(screen.getByText('System Statistics')).toBeInTheDocument();
      expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
    });

    it('should have statistics section header', () => {
      render(<App />);

      expect(screen.getByText('System Statistics')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render view logs button', () => {
      render(<App />);

      const viewLogsButton = screen.getByText('View Logs');
      expect(viewLogsButton).toBeInTheDocument();
    });

    it('should render restart services button', () => {
      render(<App />);

      const restartButton = screen.getByText('Restart Services');
      expect(restartButton).toBeInTheDocument();
    });

    it('should render emergency shutdown button', () => {
      render(<App />);

      const shutdownButton = screen.getByText('Emergency Shutdown');
      expect(shutdownButton).toBeInTheDocument();
    });

    it('should render buttons in grid layout', () => {
      render(<App />);

      // Quick Actions section should have the 3 action buttons
      const viewLogsButton = screen.getByText('View Logs');
      const restartButton = screen.getByText('Restart Services');
      const shutdownButton = screen.getByText('Emergency Shutdown');

      expect(viewLogsButton).toBeInTheDocument();
      expect(restartButton).toBeInTheDocument();
      expect(shutdownButton).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      mockFetch.mockResolvedValue({ ok: true });

      const { unmount } = render(<App />);

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
