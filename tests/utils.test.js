import { describe, test, expect } from 'vitest';

describe('Time Formatting Utilities', () => {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  test('formats zero seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00:00');
  });

  test('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:00:45');
  });

  test('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('00:02:05');
  });

  test('formats hours, minutes, and seconds', () => {
    expect(formatTime(3661)).toBe('01:01:01');
    expect(formatTime(7384)).toBe('02:03:04');
  });

  test('handles large values', () => {
    expect(formatTime(86400)).toBe('24:00:00'); // 24 hours
    expect(formatTime(359999)).toBe('99:59:59'); // Max reasonable value
  });
});

describe('Badge Text Formatting', () => {
  const formatBadgeText = (seconds) => {
    if (seconds >= 3600) {
      return `${Math.floor(seconds / 3600)}h`;
    } else if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}m`;
    } else {
      return `${Math.ceil(seconds)}s`;
    }
  };

  test('formats seconds', () => {
    expect(formatBadgeText(1)).toBe('1s');
    expect(formatBadgeText(30)).toBe('30s');
    expect(formatBadgeText(59)).toBe('59s');
  });

  test('formats minutes', () => {
    expect(formatBadgeText(60)).toBe('1m');
    expect(formatBadgeText(120)).toBe('2m');
    expect(formatBadgeText(3599)).toBe('59m');
  });

  test('formats hours', () => {
    expect(formatBadgeText(3600)).toBe('1h');
    expect(formatBadgeText(7200)).toBe('2h');
    expect(formatBadgeText(86400)).toBe('24h');
  });

  test('uses ceil for seconds to avoid showing 0s prematurely', () => {
    expect(formatBadgeText(0.1)).toBe('1s');
    expect(formatBadgeText(0.9)).toBe('1s');
  });
});

describe('Time Calculation Utilities', () => {
  test('Math.ceil works as expected for countdown', () => {
    expect(Math.ceil(10.1)).toBe(11);
    expect(Math.ceil(10.9)).toBe(11);
    expect(Math.ceil(10.0)).toBe(10);
    expect(Math.ceil(0.1)).toBe(1);
  });

  test('remaining time calculation', () => {
    const now = Date.now();
    const futureTime = now + 5000; // 5 seconds in the future
    const remaining = Math.max(0, Math.ceil((futureTime - now) / 1000));
    expect(remaining).toBe(5);
  });

  test('prevents negative remaining time', () => {
    const now = Date.now();
    const pastTime = now - 5000; // 5 seconds in the past
    const remaining = Math.max(0, Math.ceil((pastTime - now) / 1000));
    expect(remaining).toBe(0);
  });
});
