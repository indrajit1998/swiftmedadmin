// import React, { useState, useEffect, useMemo } from 'react';
// import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// // --- MOCK DATA ---
// const userTickets = [
//     {
//         id: '#1234',
//         subject: 'Payment Integration Issue',
//         snippet: 'Unable to process payments through the new gateway implementation. Requires immediate attention.',
//         sender: 'John Smith',
//         company: 'Tech Corp Inc.',
//         timestamp: '2h ago',
//         status: 'Open',
//         conversation: [
//             { sender: 'John Smith', role: 'Tech Corp Inc.', message: "We're experiencing issues with the payment gateway integration. Transactions are failing and customers are unable to complete purchases. This is causing significant revenue loss. Please help resolve this ASAP.", avatar: 'https://placehold.co/100x100/e2e8f0/64748b?text=JS' },
//             { sender: 'Sarah Johnson', role: 'Support Team', message: "I'm looking into this issue right now. Could you please provide the following information:\n1. Error messages received\n2. Transaction IDs of failed payments\n3. Browser and device details", avatar: 'https://placehold.co/100x100/f0abfc/701a75?text=SJ' },
//         ]
//     },
//     { id: '#1236', subject: 'API Rate Limit Exceeded', snippet: 'Our application is frequently hitting the API rate limit...', sender: 'Emily White', company: 'Innovate LLC', timestamp: '8h ago', status: 'Pending' },
//     { id: '#1237', subject: 'Feature Request: Dark Mode', snippet: 'We would love to see a dark mode option in the dashboard.', sender: 'Michael Brown', company: 'Creative Solutions', timestamp: '1d ago', status: 'Pending' },
//     { id: '#1235', subject: 'Dashboard Loading Slow', snippet: 'Dashboard performance issues reported across multiple regions.', sender: 'David Green', company: 'Global Solutions Ltd.', timestamp: '4h ago', status: 'Resolved' },
// ];

// const driverTickets = [
//     {
//         id: '#D-5567',
//         subject: 'Payout Not Received',
//         snippet: "My weekly payout for last week hasn't been credited to my account yet.",
//         sender: 'Alex Ray',
//         company: 'Driver Partner',
//         timestamp: '1h ago',
//         status: 'Open',
//         conversation: [
//              { sender: 'Alex Ray', role: 'Driver Partner', message: "Hi, my weekly payout for last week hasn't been credited to my account yet. My driver ID is DRV-789. Can you please check?", avatar: 'https://placehold.co/100x100/e2e8f0/64748b?text=AR' },
//              { sender: 'Support Team', role: 'Support Team', message: "Hi Alex, we're sorry for the delay. We are looking into it and will get back to you shortly.", avatar: 'https://placehold.co/100x100/f0abfc/701a75?text=ST' },
//         ]
//     },
//     { id: '#D-5568', subject: 'App Crashing on Trip Start', snippet: 'The driver app crashes every time I try to start a new trip.', sender: 'Maria Garcia', company: 'Driver Partner', timestamp: '3h ago', status: 'Pending' },
//     { id: 'D-5569', subject: 'Incorrect Fare Calculation', snippet: 'The fare for my last trip seems to be calculated incorrectly.', sender: 'Chen Wei', company: 'Driver Partner', timestamp: '1d ago', status: 'Resolved' },
// ];

// const Support = () => {
//     const [activeMainTab, setActiveMainTab] = useState('user'); // 'user' or 'driver'
//     const [activeSubTab, setActiveSubTab] = useState('Open'); // 'Open', 'Pending', 'Resolved'
//     const [selectedTicket, setSelectedTicket] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');

//     const tickets = activeMainTab === 'user' ? userTickets : driverTickets;

//     // Set a default selected ticket on load or when tabs change
//     useEffect(() => {
//         const defaultTicket = tickets.find(t => t.status === 'Open');
//         setSelectedTicket(defaultTicket || tickets[0] || null);
//         setActiveSubTab('Open'); // Reset to 'Open' when switching main tabs
//     }, [activeMainTab]);

//     const filteredTickets = useMemo(() => {
//         return tickets.filter(ticket =>
//             ticket.status === activeSubTab &&
//             (ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//              ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()))
//         );
//     }, [tickets, activeSubTab, searchTerm]);

//     const handleReply = (e) => {
//         e.preventDefault();
//         const replyText = e.target.elements.reply.value;
//         if (!replyText.trim() || !selectedTicket) return;

//         const newReply = {
//             sender: 'You',
//             role: 'Support Team',
//             message: replyText,
//             avatar: 'https://placehold.co/100x100/f0abfc/701a75?text=ME',
//         };

//         // In a real app, you would send this to the backend.
//         // For now, we update the local state to simulate the new message.
//         setSelectedTicket(prev => ({
//             ...prev,
//             conversation: [...prev.conversation, newReply]
//         }));

//         e.target.reset(); // Clear the textarea
//     };

//     return (
//         <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
//             <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>

//             {/* Main Tabs: User / Driver */}
//             <div className="flex border-b border-gray-200 mb-6">
//                 <button
//                     onClick={() => setActiveMainTab('user')}
//                     className={`px-4 py-2 text-sm font-medium ${activeMainTab === 'user' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
//                 >
//                     User Support
//                 </button>
//                 <button
//                     onClick={() => setActiveMainTab('driver')}
//                     className={`px-4 py-2 text-sm font-medium ${activeMainTab === 'driver' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
//                 >
//                     Driver Support
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Left Column: Ticket List */}
//                 <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
//                     <div className="flex border-b border-gray-200">
//                         {['Open', 'Pending', 'Resolved'].map(tab => (
//                             <button key={tab} onClick={() => setActiveSubTab(tab)} className={`px-3 py-2 text-sm font-medium ${activeSubTab === tab ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
//                                 {tab} ({tickets.filter(t => t.status === tab).length})
//                             </button>
//                         ))}
//                     </div>
//                     <div className="relative mt-4">
//                         <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                         <input type="search" placeholder="Search Ticket id..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-md border-gray-300 pl-10"/>
//                     </div>
//                     <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
//                         {filteredTickets.map(ticket => (
//                             <button
//                                 key={ticket.id}
//                                 onClick={() => setSelectedTicket(ticket)}
//                                 className={`w-full text-left p-4 rounded-lg border ${selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}`}
//                             >
//                                 <div className="flex justify-between items-center text-xs text-gray-500">
//                                     <p className={ticket.status === 'Resolved' ? 'text-green-600 font-semibold' : ''}>{ticket.status}</p>
//                                     <p>{ticket.timestamp}</p>
//                                 </div>
//                                 <h3 className="font-semibold text-gray-800 mt-1">{ticket.id} - {ticket.subject}</h3>
//                                 <p className="text-sm text-gray-600 mt-1 truncate">{ticket.snippet}</p>
//                                 <div className="flex items-center gap-2 mt-2">
//                                     <img src={`https://placehold.co/100x100/e2e8f0/64748b?text=${ticket.sender.charAt(0)}`} alt="" className="h-6 w-6 rounded-full" />
//                                     <p className="text-sm font-medium text-gray-700">{ticket.company}</p>
//                                 </div>
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Right Column: Chat View */}
//                 <div className="lg:col-span-2 bg-white rounded-lg shadow">
//                     {selectedTicket ? (
//                         <div className="flex flex-col h-full">
//                             <div className="p-4 border-b flex justify-between items-center">
//                                 <div>
//                                     <h2 className="font-semibold text-lg">{selectedTicket.subject}</h2>
//                                     <p className="text-sm text-gray-500">Ticket {selectedTicket.id} &bull; Opened {selectedTicket.timestamp} by {selectedTicket.company}</p>
//                                 </div>
//                                 {selectedTicket.status !== 'Resolved' ? (
//                                     <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Mark as Resolved</button>
//                                 ) : (
//                                     <p className="rounded-md bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">Resolved</p>
//                                 )}
//                             </div>
//                             <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[55vh]">
//                                 {selectedTicket.conversation?.map((msg, index) => (
//                                     <div key={index} className="flex items-start gap-4">
//                                         <img src={msg.avatar} alt="" className="h-10 w-10 rounded-full" />
//                                         <div>
//                                             <p className="font-semibold">{msg.sender} <span className="text-xs text-gray-500 font-normal">{msg.role}</span></p>
//                                             <div className="mt-1 text-gray-700 bg-gray-100 p-3 rounded-lg whitespace-pre-wrap">{msg.message}</div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="p-4 border-t bg-gray-50">
//                                 <form onSubmit={handleReply} className="flex items-start gap-4">
//                                     <img src="https://placehold.co/100x100/f0abfc/701a75?text=ME" alt="" className="h-10 w-10 rounded-full" />
//                                     <textarea
//                                         name="reply"
//                                         rows="3"
//                                         placeholder="Type your reply..."
//                                         className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                                     ></textarea>
//                                     <button type="submit" className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Send Reply</button>
//                                 </form>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="flex items-center justify-center h-full text-gray-500">
//                             <p>Select a ticket to view the conversation.</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Support;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MagnifyingGlassIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9004';

// Loader Spinner
const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

const Support = () => {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('driver');
  const [activeSubTab, setActiveSubTab] = useState('Open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allTickets, setAllTickets] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const menuRef = useRef(null);

  const selectedTicketRef = useRef(null);
  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  // 🔹 SOCKET.IO SETUP
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) return;

  //   socketRef.current = io(API_BASE_URL, {
  //     auth: { token },
  //     transports: ['websocket', 'polling'],
  //   });

  //   socketRef.current.on('connect', () => {
  //     console.log('✅ Socket connected (Admin)');
  //     socketRef.current.emit('support:join_admin');
  //   });

  //   // 🔹 New ticket comes in
  //   socketRef.current.on('support:new_ticket', newTicket => {
  //     if (newTicket.requesterModel.toLowerCase() === activeMainTab) {
  //       setAllTickets(prev => [newTicket, ...prev]);
  //     }
  //   });

  //   // 🔹 Ticket status/updates (Resolved/Open)
  //   socketRef.current.on('support:ticket_update', updatedTicket => {
  //     setAllTickets(prev =>
  //       prev.map(t => (t._id === updatedTicket._id ? { ...t, ...updatedTicket } : t)),
  //     );
  //     if (selectedTicket && selectedTicket._id === updatedTicket._id) {
  //       setSelectedTicket(prev => ({ ...prev, ...updatedTicket }));
  //     }
  //   });

  //   // 🔹 New message comes in for current chat
  //   socketRef.current.on('support:new_message', newMessage => {
  //     if (selectedTicket && newMessage.ticketId === selectedTicket._id) {
  //       setConversation(prev => [...prev, newMessage]);
  //     } else {
  //       // Increment unreadCount for that ticket
  //       setAllTickets(prev =>
  //         prev.map(t =>
  //           t._id === newMessage.ticketId ? { ...t, unreadCount: (t.unreadCount || 0) + 1 } : t,
  //         ),
  //       );
  //     }
  //   });

  //   return () => {
  //     console.log('❌ Disconnecting support socket');
  //     socketRef.current.disconnect();
  //   };
  // }, [user, activeMainTab, selectedTicket]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    // ✅ CRITICAL: Register listeners AFTER creating socket but BEFORE connecting
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected (Admin)');
      socketRef.current.emit('support:join_admin');
    });

    socketRef.current.on('support:new_message', newMessage => {
      console.log('📩 Admin received new message:', newMessage);
      const currentSelected = selectedTicketRef.current;

      // ✅ Update conversation if viewing this ticket
      if (currentSelected && newMessage.ticketId === currentSelected._id) {
        setConversation(prev => [...prev, newMessage.message]);

        // Mark as read
        setSelectedTicket(prev => {
          if (prev && prev._id === newMessage.ticketId) {
            return { ...prev, unreadForAdmin: 0 };
          }
          return prev;
        });
      }

      // ✅ Update ticket list unread count
      setAllTickets(prev =>
        prev.map(t =>
          t._id === newMessage.ticketId ? { ...t, unreadForAdmin: (t.unreadForAdmin || 0) + 1 } : t,
        ),
      );
    });

    socketRef.current.emit('debug:rooms');
    socketRef.current.on('debug:rooms', ({ rooms }) => console.log('My rooms:', rooms));

    socketRef.current.on('support:ticket_update', ({ ticket }) => {
      console.log('🎫 Ticket updated:', ticket);

      setAllTickets(prev => prev.map(t => (t._id === ticket._id ? { ...ticket, ...t } : t)));
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // ✅ IMPORTANT: Don't call socketRef.current.connect() - it auto-connects
    // If you need manual control, set autoConnect: false in io() options

    return () => {
      console.log('🧹 Cleaning up socket');
      socketRef.current?.disconnect();
    };
  }, [activeMainTab]); // Remove selectedTicket from deps to avoid re-connecting

  // ✅ Separate effect to handle ticket selection
  useEffect(() => {
    if (!selectedTicket) return;

    console.log('📌 Joining ticket room:', selectedTicket._id);
    socketRef.current?.emit('support:join_ticket', { ticketId: selectedTicket._id });

    return () => {
      console.log('🚪 Leaving ticket room:', selectedTicket._id);
      socketRef.current?.emit('support:leave_ticket', { ticketId: selectedTicket._id });
    };
  }, [selectedTicket?._id]);

  // 🔹 FETCH ALL TICKETS
  useEffect(() => {
    const fetchTickets = async () => {
      setLoadingList(true);
      try {
        const res = await api.get('/admin/dashboard/support/tickets', {
          params: { type: activeMainTab, status: activeSubTab },
        });
        setAllTickets(res.data.tickets || []);
        if (res.data.tickets.length > 0) {
          handleSelectTicket(res.data.tickets[0]);
        } else {
          setSelectedTicket(null);
          setConversation([]);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchTickets();
  }, [activeMainTab, activeSubTab]);

  // 🔹 SELECT TICKET
  const handleSelectTicket = async ticket => {
    if (selectedTicket && selectedTicket._id === ticket._id) return;
    setSelectedTicket(ticket);
    setMenuOpen(false);
    setLoadingChat(true);

    if (socketRef.current) {
      // if (selectedTicket?._id) {
      //   socketRef.current.emit('support:leave_ticket', { ticketId: selectedTicket._id });
      // }
      // socketRef.current.emit('support:join_ticket', { ticketId: ticket._id });

      socketRef.current.emit('support:leave_ticket', { ticketId: selectedTicket?._id });
      socketRef.current.emit('support:join_ticket', { ticketId: ticket._id });
    }

    try {
      const res = await api.get(`/admin/dashboard/support/ticket/${ticket._id}`, {
        params: { type: activeMainTab },
      });
      setConversation(res.data.messages || []);
      // Reset unread count once opened
      setAllTickets(prev => prev.map(t => (t._id === ticket._id ? { ...t, unreadCount: 0 } : t)));
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  // 🔹 FILTER TICKETS
  const filteredTickets = useMemo(() => {
    if (!searchTerm) return allTickets;
    return allTickets.filter(
      ticket =>
        (ticket.ticketId && ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.issueType && ticket.issueType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.sender?.name &&
          ticket.sender.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [allTickets, searchTerm]);

  // 🔹 SEND REPLY
  const handleReply = async e => {
    e.preventDefault();
    const replyText = e.target.elements.reply.value;
    if (!replyText.trim() || !selectedTicket) return;
    setReplyLoading(true);
    try {
      const response = await api.post(
        `/admin/dashboard/support/ticket/${selectedTicket._id}/reply`,
        { message: replyText },
        { params: { type: activeMainTab } },
      );
      const newMessage = {
        ...response.data.message,
        sender: { name: 'Super Admin' },
        senderModel: 'Admin',
      };
      setConversation(prev => [...prev, newMessage]);
      e.target.reset();
    } catch (err) {
      console.error('Error posting reply:', err);
      alert('Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  // 🔹 UPDATE STATUS (Resolved/Open)
  const handleUpdateStatus = async newStatus => {
    if (!selectedTicket || statusLoading) return;
    setStatusLoading(true);
    setMenuOpen(false);
    try {
      const res = await api.put(
        `/admin/dashboard/support/ticket/${selectedTicket._id}/status`,
        { status: newStatus },
        { params: { type: activeMainTab } },
      );

      if (res.data.success) {
        const updatedTicket = res.data.ticket;
        setAllTickets(prev => prev.filter(t => t._id !== updatedTicket._id));
        setSelectedTicket(null);
        setConversation([]);
      } else {
        throw new Error(res.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update ticket status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // 🔹 AUTO SCROLL CHAT
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const getAvatarText = name => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : name.substring(0, 2).toUpperCase();
  };

  // 🔹 Count badges for tabs
  const openCount = allTickets.filter(t => t.status === 'Open' && t.unreadCount > 0).length;
  const pendingCount = allTickets.filter(t => t.status === 'Pending' && t.unreadCount > 0).length;
  const resolvedCount = allTickets.filter(t => t.status === 'Resolved' && t.unreadCount > 0).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>

      {/* 🔹 Main Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['driver', 'user'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveMainTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeMainTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'driver' ? 'Driver Support' : 'User Support'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🔹 Ticket List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <div className="flex border-b border-gray-200">
            {[
              { name: 'Open', count: openCount },
              { name: 'Pending', count: pendingCount },
              { name: 'Resolved', count: resolvedCount },
            ].map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveSubTab(tab.name)}
                className={`relative px-3 py-2 text-sm font-medium ${
                  activeSubTab === tab.name
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-3 -translate-y-1 bg-indigo-500 text-white text-xs px-2 rounded-full">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative mt-4">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by ID, Subject, Name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 pl-10"
            />
          </div>

          <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {loadingList ? (
              <Loader />
            ) : filteredTickets.length === 0 ? (
              <p className="text-gray-500 text-center p-4">No tickets found.</p>
            ) : (
              filteredTickets.map(ticket => (
                <button
                  key={ticket._id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={`w-full text-left p-4 rounded-lg border ${
                    selectedTicket?._id === ticket._id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <p
                      className={`font-semibold ${
                        ticket.status === 'Resolved'
                          ? 'text-green-600'
                          : ticket.status === 'Pending'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {ticket.status}
                    </p>
                    {ticket.unreadCount > 0 && (
                      <span className="bg-indigo-600 text-white text-[11px] font-semibold rounded-full px-2 py-[2px] ml-2">
                        {ticket.unreadCount > 9 ? '9+' : ticket.unreadCount}
                      </span>
                    )}
                    <p>{new Date(ticket.updatedAt).toLocaleString()}</p>
                  </div>
                  <h3 className="font-semibold text-gray-800 mt-1">
                    {ticket.ticketId} - {ticket.issueType || 'General'} {ticket.subject}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">{ticket.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={`https://placehold.co/100x100/e2e8f0/64748b?text=${getAvatarText(
                        ticket.sender?.name,
                      )}`}
                      alt=""
                      className="h-6 w-6 rounded-full"
                    />
                    <p className="text-sm font-medium text-gray-700">
                      {ticket.sender?.name || 'N/A'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 🔹 Chat Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow min-h-[70vh]">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg">{selectedTicket.issueType || 'General'}</h2>
                  <p className="text-sm text-gray-500">
                    Ticket {selectedTicket.ticketId} • From {selectedTicket.sender?.name}
                  </p>
                </div>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {selectedTicket.status !== 'Resolved' ? (
                          <button
                            onClick={() => handleUpdateStatus('Resolved')}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            disabled={statusLoading}
                          >
                            {statusLoading ? 'Updating...' : 'Mark as Resolved'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus('Open')}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            disabled={statusLoading}
                          >
                            {statusLoading ? 'Updating...' : 'Re-open Ticket'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[55vh]">
                {loadingChat ? (
                  <Loader />
                ) : (
                  conversation.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`flex items-start gap-4 ${
                        msg.senderType === 'Admin' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <img
                        src={`https://placehold.co/100x100/${
                          msg.senderType === 'Admin' ? 'f0abfc/701a75' : 'e2e8f0/64748b'
                        }?text=${getAvatarText(msg.sender?.name)}`}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <p
                          className={`font-semibold ${
                            msg.senderType === 'Admin' ? 'text-right' : ''
                          }`}
                        >
                          {msg.sender?.name || 'User'}{' '}
                          <span className="text-xs text-gray-500 font-normal">
                            {msg.senderType}
                          </span>
                        </p>
                        <div
                          className={`mt-1 text-gray-700 p-3 rounded-lg whitespace-pre-wrap ${
                            msg.senderType === 'Admin' ? 'bg-indigo-100' : 'bg-gray-100'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t bg-gray-50">
                <form onSubmit={handleReply} className="flex items-start gap-4">
                  <textarea
                    name="reply"
                    rows="3"
                    placeholder={
                      selectedTicket.status === 'Resolved'
                        ? 'This ticket is resolved. Reply to re-open.'
                        : 'Type your reply...'
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={replyLoading}
                  ></textarea>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    disabled={replyLoading}
                  >
                    {replyLoading ? 'Sending...' : 'Send Reply'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a ticket to view the conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
