//! E2E tests for room persistence

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.HUB_CLIENT_URL || 'http://localhost:5173';

test.describe('Room Persistence', () => {
  test.beforeAll(async ({ request }) => {
    // Create a test room
    const response = await request.post(`${BASE_URL}/rooms`, {
      data: {
        name: 'E2E Test Room',
        description: 'Room for E2E testing'
      }
    });

    expect(response.ok()).toBeTruthy();
  });

  test('should save room state', async ({ request }) => {
    const listResponse = await request.get(`${BASE_URL}/rooms`);

    expect(listResponse.ok()).toBeTruthy();
    const rooms = await listResponse.json();
    expect(rooms.length).toBeGreaterThan(0);

    const roomId = rooms[0].room_id;

    // Save room state
    const saveResponse = await request.post(`${BASE_URL}/rooms/${roomId}/save`, {
      data: {
        name: 'E2E Updated Room',
        description: 'Updated by E2E test'
      }
    });

    expect(saveResponse.ok()).toBeTruthy();
    const result = await saveResponse.json();
    expect(result.success).toBe(true);
  });

  test('should load saved room state', async ({ request }) => {
    const listResponse = await request.get(`${BASE_URL}/rooms`);

    expect(listResponse.ok()).toBeTruthy();
    const rooms = await listResponse.json();
    expect(rooms.length).toBeGreaterThan(0);

    const roomId = rooms[0].room_id;

    // Load room state
    const loadResponse = await request.get(`${BASE_URL}/rooms/${roomId}/load`);

    expect(loadResponse.ok()).toBeTruthy();
    const result = await loadResponse.json();
    expect(result.success).toBe(true);
    expect(result.room_state).toBeDefined();
  });

  test('should get room templates', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/rooms/templates`);

    expect(response.ok()).toBeTruthy();
    const templates = await response.json();
    expect(Array.isArray(templates.templates)).toBe(true);
    expect(templates.templates.length).toBeGreaterThan(0);
  });

  test('should create room from template', async ({ request }) => {
    const templatesResponse = await request.get(`${BASE_URL}/rooms/templates`);

    expect(templatesResponse.ok()).toBeTruthy();
    const templates = await templatesResponse.json();
    const template = templates.templates[0];

    // Create room from template
    const createResponse = await request.post(`${BASE_URL}/rooms/from-template`, {
      data: {
        source_room_id: template.id,
        new_name: 'E2E Cloned Room'
      }
    });

    expect(createResponse.ok()).toBeTruthy();
    const result = await createResponse.json();
    expect(result.success).toBe(true);
    expect(result.room_id).toBeDefined();
    expect(result.room_name).toBeDefined();
  });

  test('should clone existing room', async ({ request }) => {
    const listResponse = await request.get(`${BASE_URL}/rooms`);

    expect(listResponse.ok()).toBeTruthy();
    const rooms = await listResponse.json();
    expect(rooms.length).toBeGreaterThan(0);

    const sourceRoomId = rooms[0].room_id;

    // Clone room
    const cloneResponse = await request.post(`${BASE_URL}/rooms/${sourceRoomId}/clone`);

    expect(cloneResponse.ok()).toBeTruthy();
    const result = await cloneResponse.json();
    expect(result.success).toBe(true);
    expect(result.room_id).toBeDefined();
    expect(result.room_id).not.toBe(sourceRoomId);
  });

  test('should handle invalid room ID', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/rooms/invalid-room-id/load`);

    expect(response.status()).toBe(404);
  });
});

test.describe('Room Persistence - Sequential Operations', () => {
  test('should handle save and load sequentially', async ({ request }) => {
    const listResponse = await request.get(`${BASE_URL}/rooms`);

    expect(listResponse.ok()).toBeTruthy();
    const rooms = await listResponse.json();
    const roomId = rooms[0].room_id;

    // Save multiple states
    await request.post(`${BASE_URL}/rooms/${roomId}/save`, {
      data: {
        name: 'First Save',
        description: 'Initial save'
      }
    });

    await request.post(`${BASE_URL}/rooms/${roomId}/save`, {
      data: {
        name: 'Second Save',
        description: 'Updated save'
      }
    });

    await request.post(`${BASE_URL}/rooms/${roomId}/save`, {
      data: {
        name: 'Third Save',
        description: 'Final save'
      }
    });

    // Load should return latest state
    const loadResponse = await request.get(`${BASE_URL}/rooms/${roomId}/load`);

    expect(loadResponse.ok()).toBeTruthy();
    const result = await loadResponse.json();
    expect(result.room_state.name).toBe('Third Save');
  });
});
