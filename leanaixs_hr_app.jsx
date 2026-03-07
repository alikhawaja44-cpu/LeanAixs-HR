import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Users, FileText, TrendingUp, Settings, LogOut, Menu, X, Check, AlertCircle, Download, Eye, EyeOff, Edit2, Trash2, Plus, Calendar, Search, Filter, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HRApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [location, setLocation] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  // Mock data initialization
  useEffect(() => {
    const mockEmployees = [
      { id: 1, name: 'Ahmed Khan', email: 'ahmed@leanaixs.com', department: 'Engineering', salary: 85000, joinDate: '2023-01-15', status: 'active' },
      { id: 2, name: 'Fatima Ali', email: 'fatima@leanaixs.com', department: 'HR', salary: 65000, joinDate: '2022-06-20', status: 'active' },
      { id: 3, name: 'Usman Malik', email: 'usman@leanaixs.com', department: 'Sales', salary: 75000, joinDate: '2023-03-10', status: 'active' },
      { id: 4, name: 'Zainab Hassan', email: 'zainab@leanaixs.com', department: 'Marketing', salary: 70000, joinDate: '2023-02-01', status: 'inactive' },
      { id: 5, name: 'Ali Raza', email: 'ali@leanaixs.com', department: 'Engineering', salary: 90000, joinDate: '2022-11-05', status: 'active' },
    ];

    const mockAttendance = [
      { id: 1, employeeId: 1, date: new Date().toISOString().slice(0, 10), checkIn: '09:15 AM', checkOut: '05:30 PM', location: 'Office - Lahore', status: 'present' },
      { id: 2, employeeId: 2, date: new Date().toISOString().slice(0, 10), checkIn: '09:00 AM', checkOut: '05:00 PM', location: 'Office - Lahore', status: 'present' },
      { id: 3, employeeId: 1, date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), checkIn: '09:30 AM', checkOut: '05:15 PM', location: 'Remote - Home', status: 'present' },
      { id: 4, employeeId: 3, date: new Date(Date.now() - 172800000).toISOString().slice(0, 10), checkIn: null, checkOut: null, location: null, status: 'absent' },
    ];

    setEmployees(mockEmployees);
    setAttendanceData(mockAttendance);
  }, []);

  // Get live location
  useEffect(() => {
    if (navigator.geolocation && (currentPage === 'attendance' || currentPage === 'dashboard')) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy.toFixed(0)
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  }, [currentPage]);

  // Update live time
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (userType) => {
    setCurrentUser({
      id: userType === 'admin' ? 0 : 1,
      name: userType === 'admin' ? 'Admin User' : 'Ahmed Khan',
      email: userType === 'admin' ? 'admin@leanaixs.com' : 'ahmed@leanaixs.com',
      role: userType,
      department: userType === 'admin' ? 'Administration' : 'Engineering'
    });
    setCurrentPage('dashboard');
  };

  const handleAttendanceCheckIn = () => {
    const today = new Date().toISOString().slice(0, 10);
    const existingRecord = attendanceData.find(a => a.employeeId === currentUser.id && a.date === today);
    
    if (!existingRecord) {
      const newRecord = {
        id: attendanceData.length + 1,
        employeeId: currentUser.id,
        date: today,
        checkIn: liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        checkOut: null,
        location: `Office - Lahore (Lat: ${location?.lat.toFixed(4)}, Lng: ${location?.lng.toFixed(4)})`,
        status: 'present'
      };
      setAttendanceData([...attendanceData, newRecord]);
    }
  };

  const handleAttendanceCheckOut = () => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = attendanceData.map(a => 
      a.employeeId === currentUser.id && a.date === today
        ? { ...a, checkOut: liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
        : a
    );
    setAttendanceData(updated);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // Filter attendance data
  const filteredAttendance = attendanceData.filter(record => {
    const attendeeEmployee = employees.find(e => e.id === record.employeeId);
    const matchesSearch = attendeeEmployee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = record.date.startsWith(filterMonth);
    return matchesSearch && matchesMonth;
  });

  // Calculate dashboard stats
  const todayAttendance = attendanceData.filter(a => a.date === new Date().toISOString().slice(0, 10));
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const totalEmployees = employees.filter(e => e.status === 'active').length;
  const attendanceRate = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : 0;

  // Attendance trend data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000);
    const dateStr = date.toISOString().slice(0, 10);
    const count = attendanceData.filter(a => a.date === dateStr && a.status === 'present').length;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present: count
    };
  });

  // Department distribution
  const departmentStats = employees.reduce((acc, emp) => {
    const existing = acc.find(d => d.name === emp.department);
    if (existing) existing.value++;
    else acc.push({ name: emp.department, value: 1 });
    return acc;
  }, []);

  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'];

  // Login Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
          
          * { font-family: 'Inter', sans-serif; }
          .font-display { font-family: 'Playfair Display', serif; }
          .font-mono { font-family: 'Space Mono', monospace; }
        `}</style>
        
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-indigo-500/30 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-4xl font-bold text-white mb-2">LeanAixs</h1>
              <p className="text-indigo-300 text-sm font-mono">HR Management System</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleLogin('employee')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Login as Employee
              </button>
              
              <button
                onClick={() => handleLogin('admin')}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 border border-slate-600"
              >
                <Settings className="w-5 h-5" />
                Login as Admin
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-xs text-center mb-4 font-mono">Demo Credentials</p>
              <div className="space-y-2 text-xs text-slate-400">
                <p><span className="text-indigo-300">Employee:</span> Ahmed Khan</p>
                <p><span className="text-indigo-300">Admin:</span> Full Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 4px; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-indigo-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5 text-indigo-400" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-white">LeanAixs</h1>
                <p className="text-xs text-indigo-300 font-mono">HR Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-mono text-slate-300">
                {liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-indigo-300 capitalize">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-700 rounded-lg transition text-indigo-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} lg:w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-indigo-500/20 transition-all duration-300 overflow-hidden`}>
          <nav className="p-6 space-y-2">
            {currentUser.role === 'admin' ? (
              <>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'dashboard' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setCurrentPage('attendance')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'attendance' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <Clock className="w-5 h-5" />
                  <span>Attendance</span>
                </button>
                <button
                  onClick={() => setCurrentPage('employees')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'employees' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <Users className="w-5 h-5" />
                  <span>Employees</span>
                </button>
                <button
                  onClick={() => setCurrentPage('payroll')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'payroll' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Payroll</span>
                </button>
                <button
                  onClick={() => setCurrentPage('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'reports' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Reports</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'dashboard' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setCurrentPage('attendance')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'attendance' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <Clock className="w-5 h-5" />
                  <span>My Attendance</span>
                </button>
                <button
                  onClick={() => setCurrentPage('payroll')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === 'payroll' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Payroll</span>
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            {/* Dashboard */}
            {currentPage === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome back, {currentUser.name}</h2>
                    <p className="text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                  {location && (
                    <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-3 rounded-lg border border-emerald-500/30">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-slate-300 font-mono">
                        {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}° (±{location.accuracy}m)
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-mono text-slate-400">Today</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{presentToday}</p>
                    <p className="text-sm text-slate-400">Present Today</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-emerald-500/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-mono text-slate-400">Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{attendanceRate}%</p>
                    <p className="text-sm text-slate-400">Attendance Rate</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-purple-500/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-mono text-slate-400">Active</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{totalEmployees}</p>
                    <p className="text-sm text-slate-400">Total Employees</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-pink-500/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-5 h-5 text-pink-400" />
                      <span className="text-xs font-mono text-slate-400">Current</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-slate-400">Current Time</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">7-Day Attendance Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={last7Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #4f46e5', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Department Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={departmentStats} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {departmentStats.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #4f46e5' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance */}
            {currentPage === 'attendance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-3xl font-bold text-white mb-2">Attendance Management</h2>
                  <p className="text-slate-400">Track and manage your attendance records</p>
                </div>

                {currentUser.role === 'employee' && (
                  <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold mb-1">Clock In / Out</p>
                        <p className="text-sm text-indigo-200">
                          {liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAttendanceCheckIn}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Check In
                        </button>
                        <button
                          onClick={handleAttendanceCheckOut}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2"
                        >
                          <Clock className="w-5 h-5" />
                          Check Out
                        </button>
                      </div>
                    </div>
                    {location && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-indigo-200">
                        <MapPin className="w-4 h-4" />
                        <span className="font-mono">Lat: {location.lat.toFixed(4)}°, Lng: {location.lng.toFixed(4)}° (±{location.accuracy}m)</span>
                      </div>
                    )}
                  </div>
                )}

                {currentUser.role === 'admin' && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search employee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500"
                      />
                    </div>
                    <input
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                )}

                {/* Attendance Records Table */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/50 border-b border-slate-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Date</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Employee</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Check In</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Check Out</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Location</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {(currentUser.role === 'admin' ? filteredAttendance : attendanceData.filter(a => a.employeeId === currentUser.id)).map((record) => {
                          const employee = employees.find(e => e.id === record.employeeId);
                          return (
                            <tr key={record.id} className="hover:bg-slate-700/30 transition">
                              <td className="px-6 py-4 text-slate-300">{record.date}</td>
                              <td className="px-6 py-4 text-slate-300">{employee?.name}</td>
                              <td className="px-6 py-4 text-emerald-400">{record.checkIn || '-'}</td>
                              <td className="px-6 py-4 text-red-400">{record.checkOut || '-'}</td>
                              <td className="px-6 py-4 text-slate-300 text-xs max-w-xs overflow-hidden text-ellipsis">{record.location || '-'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'present' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                  {record.status === 'present' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                  {record.status === 'present' ? 'Present' : 'Absent'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Employees Management */}
            {currentPage === 'employees' && currentUser.role === 'admin' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-bold text-white mb-2">Employee Directory</h2>
                    <p className="text-slate-400">Manage all employee information</p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Employee
                  </button>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/50 border-b border-slate-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Name</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Email</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Department</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Salary</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Join Date</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-slate-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-slate-700/30 transition">
                            <td className="px-6 py-4 text-slate-300 font-semibold">{employee.name}</td>
                            <td className="px-6 py-4 text-slate-400 text-sm">{employee.email}</td>
                            <td className="px-6 py-4 text-slate-300">{employee.department}</td>
                            <td className="px-6 py-4 text-slate-300 font-mono">Rs. {employee.salary.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-400 text-sm">{employee.joinDate}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}`}>
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition text-indigo-400">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Payroll */}
            {currentPage === 'payroll' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-3xl font-bold text-white mb-2">Payroll Management</h2>
                  <p className="text-slate-400">{currentUser.role === 'admin' ? 'Manage payroll for all employees' : 'View your payroll information'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-emerald-500/20 p-6">
                    <p className="text-slate-400 text-sm mb-2">Current Month</p>
                    <p className="text-2xl font-bold text-emerald-400">Rs. 85,000</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-blue-500/20 p-6">
                    <p className="text-slate-400 text-sm mb-2">YTD Salary</p>
                    <p className="text-2xl font-bold text-blue-400">Rs. 255,000</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-purple-500/20 p-6">
                    <p className="text-slate-400 text-sm mb-2">Deductions</p>
                    <p className="text-2xl font-bold text-purple-400">Rs. 5,000</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Payroll History</h3>
                  <div className="space-y-3">
                    {['March 2024', 'February 2024', 'January 2024'].map((month) => (
                      <div key={month} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-indigo-500/30 transition">
                        <span className="text-white font-semibold">{month}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-300">Rs. 85,000</span>
                          <button className="p-2 hover:bg-slate-700 rounded-lg transition text-indigo-400">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reports (Admin Only) */}
            {currentPage === 'reports' && currentUser.role === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-3xl font-bold text-white mb-2">HR Reports</h2>
                  <p className="text-slate-400">Generate and view comprehensive HR analytics</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Monthly Attendance Report</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={last7Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #4f46e5' }} />
                        <Bar dataKey="present" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Department Breakdown</h3>
                    <div className="space-y-3">
                      {departmentStats.map((dept, idx) => (
                        <div key={dept.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                            <span className="text-slate-300">{dept.name}</span>
                          </div>
                          <span className="text-white font-semibold">{dept.value} employees</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Full Report
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
