import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const UserWallet = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // 🔥 Fetch filtered users from backend
  const fetchUsers = async (keyword = "") => {
    try {
      const res = await api.get(`/admin/wallet/users?search=${keyword}`);
      setUsers(res.data.users);
    } catch (err) {
      console.error("Fetch wallet users error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchUsers(""); // initial load
  }, []);

  // 🔥 Trigger search instantly as user types (backend search)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(search);
    }, 300); // debounce
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Wallet Details</h1>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 text-gray-400 -translate-y-1/2" />
          <input
            className="pl-10 pr-3 py-2 border rounded-md"
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b">
            <th className="p-3">Sl No</th>
            <th className="p-3">Name</th>
            <th className="p-3">User ID</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Email</th>
            <th className="p-3">Wallet Balance</th>
            <th className="p-3">View</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.phone}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3 font-semibold">₹ {(u.balance).toFixed(2)}</td>
              <td className="p-3">
                <Link
                  to={`/wallet/users/${u.id}/history`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserWallet;
