import { useState, useEffect } from 'react';

import { fetchUsers, toggleUserStatus, updateUserRole, type UserWithRole } from './api-client';

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');

  const loadUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await fetchUsers(pageNum, 50, filter);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setPage(response.page);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'ban' : 'unban'} this user?`)) {
      return;
    }

    try {
      await toggleUserStatus(userId, !currentStatus);
      await loadUsers(page);
      alert(`User ${userId} ${!currentStatus ? 'activated' : 'banned'}`);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert(`Failed to update user status: ${error}`);
    }
  };

  const handleRoleUpdate = async (userId: number, currentRole: string | null) => {
    const newRole = prompt(
      `Current role: ${currentRole || 'None'}. Enter new role (USER, MODERATOR, ADMIN):`,
      currentRole || 'USER'
    );

    if (!newRole) {
      return;
    }

    const validRoles = ['USER', 'MODERATOR', 'ADMIN'];
    if (!validRoles.includes(newRole.toUpperCase())) {
      alert('Invalid role. Use: USER, MODERATOR, or ADMIN');
      return;
    }

    try {
      await updateUserRole(userId, newRole.toUpperCase(), 1);
      await loadUsers(page);
      alert(`Role ${newRole} assigned to user ${userId}`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert(`Failed to update user role: ${error}`);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.display_name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-white">User Management</h2>

      {/* Search filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-gray-400"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {user.display_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-900 text-purple-200'
                          : user.role === 'MODERATOR'
                            ? 'bg-blue-900 text-blue-200'
                            : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`mr-2 px-3 py-1 text-xs font-semibold rounded-md ${
                        user.is_active
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {user.is_active ? 'Ban' : 'Unban'}
                    </button>
                    <button
                      onClick={() => handleRoleUpdate(user.id, user.role)}
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Set Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => loadUsers(page - 1)}
            disabled={page <= 1 || loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => loadUsers(page + 1)}
            disabled={page >= totalPages || loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
