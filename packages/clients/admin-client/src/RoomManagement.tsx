import { useState, useEffect } from 'react';

import { fetchRooms, updateRoomConfig, closeRoom, deleteRoom, type RoomInfo } from './api-client';

export default function RoomManagement() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRoom, setEditingRoom] = useState<RoomInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const loadRooms = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await fetchRooms(pageNum, 50);
      setRooms(response.rooms);
      setTotalPages(response.totalPages);
      setPage(response.page);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleEdit = async (room: RoomInfo) => {
    const name = prompt('Room name:', room.name) || room.name;
    const description = prompt('Room description:', room.description || '') || room.description;
    const maxPlayers = prompt('Max players:', String(room.max_players));
    const isPrivate = confirm('Make room private?');

    if (!name) {
      return;
    }

    try {
      await updateRoomConfig(room.id, {
        name,
        description,
        max_players: Number(maxPlayers),
        is_private: isPrivate
      });
      await loadRooms(page);
      alert(`Room ${room.name} updated successfully`);
      setEditingRoom(null);
    } catch (error) {
      console.error('Failed to update room:', error);
      alert(`Failed to update room: ${error}`);
    }
  };

  const handleClose = async (roomId: number, roomName: string) => {
    if (
      !confirm(`Are you sure you want to close room "${roomName}"? Users will be disconnected.`)
    ) {
      return;
    }

    try {
      await closeRoom(roomId);
      await loadRooms(page);
      alert(`Room ${roomName} closed successfully`);
    } catch (error) {
      console.error('Failed to close room:', error);
      alert(`Failed to close room: ${error}`);
    }
  };

  const handleDelete = async (roomId: number, roomName: string) => {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY DELETE room "${roomName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteRoom(roomId);
      await loadRooms(page);
      alert(`Room ${roomName} deleted successfully`);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert(`Failed to delete room: ${error}`);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-white">Room Management</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-gray-400"></div>
          <p className="mt-4 text-gray-400">Loading rooms...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Room ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Players
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{room.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                      {room.room_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {room.max_players}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          room.is_private
                            ? 'bg-purple-900 text-purple-200'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {room.is_private ? 'Private' : 'Public'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {room.created_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(room.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          room.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                        }`}
                      >
                        {room.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingRoom(room)}
                        className="mr-2 px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleClose(room.id, room.name)}
                        disabled={!room.is_active}
                        className="mr-2 px-3 py-1 text-xs font-semibold rounded-md bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(room.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-md bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => loadRooms(page - 1)}
                disabled={page <= 1 || loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => loadRooms(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg max-w-md w-full mx-auto my-8">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">Edit Room</h3>
                <button
                  onClick={() => setEditingRoom(null)}
                  className="float-right text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                  <input
                    type="text"
                    defaultValue={editingRoom.name}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    defaultValue={editingRoom.description || ''}
                    rows={3}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Players
                  </label>
                  <input
                    type="number"
                    defaultValue={String(editingRoom.max_players)}
                    min={1}
                    max={100}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={editingRoom.is_private}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    disabled
                  />
                  <label className="ml-2 text-sm text-gray-300">Private Room</label>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleEdit(editingRoom)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingRoom(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg max-w-md w-full mx-auto my-8">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to permanently delete room "
                  {rooms.find((r) => r.id === showDeleteConfirm)?.name}"? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() =>
                      handleDelete(
                        showDeleteConfirm,
                        rooms.find((r) => r.id === showDeleteConfirm)?.name || ''
                      )
                    }
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
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
