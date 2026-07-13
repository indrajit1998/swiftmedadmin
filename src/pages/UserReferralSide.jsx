import api from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

// 🎯 Tier Configuration (Matched with Backend: NEW -> BRONZE -> SILVER -> PLATINUM -> DIAMOND)
const TIER_CONFIG = [
  { name: "BRONZE", min: 15, badge: "🥉", color: "bg-orange-200 text-orange-800", reward: "₹5 per valid referral" },
  { name: "SILVER", min: 30, badge: "🥈", color: "bg-gray-200 text-gray-700", reward: "₹15 per ride" },
  { name: "PLATINUM", min: 45, badge: "💎", color: "bg-indigo-200 text-indigo-700", reward: "₹25 per ride" },
  { name: "DIAMOND", min: 60, badge: "💎", color: "bg-blue-200 text-blue-700", reward: "VIP Benefits" },
];

// 🧠 Determine Tier based on total referrals (Approximation for display)
const getTier = (referrals) => {
  if (referrals >= 60) return TIER_CONFIG[3]; // Diamond
  if (referrals >= 45) return TIER_CONFIG[2]; // Platinum
  if (referrals >= 30) return TIER_CONFIG[1]; // Silver
  if (referrals >= 15) return TIER_CONFIG[0]; // Bronze
  return null;
};

// 🧠 Progress to Next Tier
const nextTierDetails = (referrals) => {
  if (referrals < 15) return { nextTier: "BRONZE", remaining: 15 - referrals };
  if (referrals < 30) return { nextTier: "SILVER", remaining: 30 - referrals };
  if (referrals < 45) return { nextTier: "PLATINUM", remaining: 45 - referrals };
  if (referrals < 60) return { nextTier: "DIAMOND", remaining: 60 - referrals };
  return { nextTier: "MAX", remaining: 0 };
};

const UserReferralTier = () => {
  const [users, setUsers] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]); // New state for leaderboard
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [leaderTab, setLeaderTab] = useState("weekly");

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Fetch Data (Combined load for list and leaderboard to keep it simple, or separate)
  const fetchReferralData = async () => {
    try {
      // 1. Fetch Users List with Pagination & Search
      const queryParams = new URLSearchParams({
        page: page,
        limit: pageSize,
        search: search // Backend supports search
      });

      const listRes = await api.get(`/admin/referral/users?${queryParams}`);
      const listData = listRes.data;

      if (listData.users) {
        const mappedUsers = listData.users.map(u => ({
          userName: u.name,
          referralId: u.referral?.referralCode || 'N/A',
          totalReferred: u.referral?.totalSuccessfulReferrals || 0,
          earnings: u.wallet?.referralBalance || 0,
          tier: u.referral?.tier || 'NEW'
        }));
        setUsers(mappedUsers);
        setFiltered(mappedUsers); // In this implementation, 'users' and 'filtered' are same because backend handles filtering
        // We might need to store 'total' for pagination if we want real server-side pagination in UI buttons
      }

      // 2. Fetch Leaderboard (Top Referrers)
      const topRes = await api.get('/admin/referral/top?limit=5');
      const topData = topRes.data;
      if (Array.isArray(topData)) {
          const mappedTop = topData.map(u => ({
              userName: u.name,
              referralId: u.referral?.referralCode || 'N/A',
              totalReferred: u.referral?.totalSuccessfulReferrals || 0,
              earnings: u.wallet?.referralBalance || 0  
          }));
          setTopPerformers(mappedTop);
      }
      
    } catch (error) {
      console.error("Error fetching user referral data:", error);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [page, search]); // Re-fetch when page or search changes

  const handleExport = () => alert("CSV export is ready once backend is attached.");

  // Pagination computed rows
  const totalPages = Math.ceil(filtered.length / pageSize);
  const tableRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">User Referral</h2>
      
      </div>

      {/* Search + Export */}
      <div className="bg-white shadow p-4 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            placeholder="Search name or referral ID..."
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <ArrowDownTrayIcon className="h-5 w-5" /> Export CSV
        </button>
      </div>

      {/* ==== Leaderboard ==== */}
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrophyIcon className="h-6 w-6" /> Leaderboard
          </h3>
          <div className="flex gap-2">
            {["daily", "weekly", "monthly"].map((tab) => (
              <button
                key={tab}
                onClick={() => setLeaderTab(tab)}
                className={`px-4 py-1 rounded-md text-sm font-semibold ${
                  leaderTab === tab ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {[...topPerformers]
          .map((u, i) => (
            <div key={u.referralId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {i + 1}
                </span>
                <p className="font-semibold">{u.userName}</p>
              </div>
              <p className="font-bold text-indigo-700">{u.totalReferred} referrals</p>
            </div>
          ))}
      </div>

      {/* ==== Full User List With Pagination ==== */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-gray-600 text-xs">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Referral ID</th>
              <th className="px-6 py-3 text-center">Referrals</th>
              <th className="px-6 py-3 text-left">Tier</th>
              <th className="px-6 py-3 text-left">Rewards</th>
              <th className="px-6 py-3 text-center">Progress</th>
            </tr>
          </thead>

          <tbody>
            {tableRows.map((u) => {
              const tier = getTier(u.totalReferred);
              const nxt = nextTierDetails(u.totalReferred);
              return (
                <tr key={u.referralId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{u.userName}</td>
                  <td className="px-6 py-4 font-mono text-sm">{u.referralId}</td>
                  <td className="px-6 py-4 text-center font-semibold">{u.totalReferred}</td>

                  <td className="px-6 py-4">
                    {tier ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tier.color}`}>
                        {tier.badge} {tier.name}
                      </span>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                        🎯 No Tier Yet
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {tier ? tier.reward : "Refer 5 users to unlock Silver"}
                  </td>

                  <td className="px-6 py-4 text-center text-xs text-gray-600">
                    {nxt.remaining === 0 ? (
                      <span className="text-green-600 font-semibold">MAX TIER</span>
                    ) : (
                      <>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-2 bg-indigo-600"
                            style={{ width: `${Math.min((u.totalReferred / (nxt.remaining + u.totalReferred)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        {nxt.remaining} more to reach {nxt.nextTier}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
          >
            Prev
          </button>

          <p className="text-sm font-medium text-gray-700">
            Page {page} of {totalPages}
          </p>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserReferralTier;