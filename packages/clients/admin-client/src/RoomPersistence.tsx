import { useState } from 'react';

import {
  fetchRoomState,
  saveRoomState as saveRoomStateApi,
  type RoomState,
  type SaveRoomRequest,
  type LoadRoomResponse
} from './api-client';

export default function RoomPersistence() {
  const [roomId, setRoomId] = useState<string>('');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const loadRoomState = async () => {
    if (!roomId) {
      setMessage('Please enter a room ID first');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetchRoomState(roomId);
      const data: LoadRoomResponse = await response.json();

      if (data.success) {
        setRoomState(data.room_state || null);
        setMessage('Room state loaded successfully');
      } else {
        setMessage(data.message || 'Failed to load room state');
      }
    } catch (error) {
      console.error('Failed to load room:', error);
      setMessage('Error loading room state');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoomState = async () => {
    if (!roomId || !roomState) {
      setMessage('No room state to save');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const saveRequest: SaveRoomRequest = {};

      if (newName.trim()) {
        saveRequest.name = newName;
      }

      if (newDescription.trim()) {
        saveRequest.description = newDescription;
      }

      const response = await saveRoomStateApi(roomId, saveRequest);
      const data = await response.json();

      if (data.success) {
        setRoomState((prevState) => ({
          ...prevState!,
          name: newName || prevState?.name || '',
          description: newDescription || prevState?.description
        }));
        setMessage('Room state saved successfully');
      } else {
        setMessage(data.message || 'Failed to save room state');
      }
    } catch (error) {
      console.error('Failed to save room:', error);
      setMessage('Error saving room state');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-white">Room Persistence</h2>

      {/* Room ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Room ID</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID to save/load..."
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={loadRoomState}
          disabled={!roomId || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Load Room State'}
        </button>
      </div>

      {/* Save Current State */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={roomState?.name || 'Current room name'}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder={roomState?.description || 'Enter room description'}
          rows={3}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSaveRoomState}
          disabled={!roomId || isSaving || !roomState}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Room State'}
        </button>
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!roomId || isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes('success')
              ? 'bg-green-900 text-green-200'
              : message.includes('Error')
                ? 'bg-red-900 text-red-200'
                : 'bg-blue-900 text-blue-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg max-w-md w-full mx-auto my-8">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Confirm Clear All</h3>
                <p className="text-gray-300 mb-4">
                  Are you sure you want to clear all room state? This cannot be undone.
                </p>
                <p className="text-gray-300 mb-4">
                  This will reset the room name and description to defaults, and clear the saved
                  state.
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setRoomState(null);
                      setNewName('');
                      setNewDescription('');
                      setShowConfirmDialog(false);
                      setMessage('Room state cleared');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
