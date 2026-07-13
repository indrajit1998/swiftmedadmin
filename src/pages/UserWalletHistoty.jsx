import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';

const UserWalletHistory = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await api.get(`/admin/wallet/users/${userId}`);
        setUser(userRes.data);

        const historyRes = await api.get(`/admin/wallet/users/${userId}/history`);
        setTransactions(historyRes.data.history || []);
      } catch (err) {
        console.error("Wallet history error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  if (loading) return <p className="p-6 text-center font-semibold">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/wallet/users"           // 🔥 FIXED BACK BUTTON PATH
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Wallet History</h1>
      </div>

      {user && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-gray-600 text-sm">{user.id}</p>
              <p className="text-gray-600 text-sm">{user.phone}</p>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Available Wallet Balance</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{user.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Transaction Records</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3">Sl No</th>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date & Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{t.txnId}</td>
                  <td className="p-3 font-semibold">
                    {t.type === "ADD"
                      ? <span className="text-green-600">Money Added</span>
                      : <span className="text-red-600">Ride Payment</span>}
                  </td>
                  <td className="p-3 font-bold">
                    {t.amount > 0
                      ? <span className="text-green-600">+ ₹{t.amount}</span>
                      : <span className="text-red-600">₹{t.amount}</span>}
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(t.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="py-6 text-center text-gray-500">
              No transaction history available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWalletHistory;
