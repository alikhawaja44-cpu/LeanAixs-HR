import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// MOCK DATA & CONSTANTS
// ============================================================
const ROLES = { ADMIN: "admin", HR: "hr", EMPLOYEE: "employee" };

const MOCK_USERS = [
  { id: 1, name: "Alexandra Chen", email: "admin@leanaixs.com", password: "admin123", role: ROLES.ADMIN, avatar: "AC", department: "Management", position: "System Administrator", phone: "+1-555-0101", joinDate: "2020-01-15", salary: 95000, status: "active" },
  { id: 2, name: "Marcus Rivera", email: "hr@leanaixs.com", password: "hr123", role: ROLES.HR, avatar: "MR", department: "Human Resources", position: "HR Manager", phone: "+1-555-0102", joinDate: "2020-03-22", salary: 85000, status: "active" },
  { id: 3, name: "Sophie Williams", email: "sophie@leanaixs.com", password: "emp123", role: ROLES.EMPLOYEE, avatar: "SW", department: "Engineering", position: "Senior Developer", phone: "+1-555-0103", joinDate: "2021-06-01", salary: 78000, status: "active" },
  { id: 4, name: "James Okafor", email: "james@leanaixs.com", password: "emp123", role: ROLES.EMPLOYEE, avatar: "JO", department: "Design", position: "UI/UX Designer", phone: "+1-555-0104", joinDate: "2021-09-15", salary: 72000, status: "active" },
  { id: 5, name: "Priya Patel", email: "priya@leanaixs.com", password: "emp123", role: ROLES.EMPLOYEE, avatar: "PP", department: "Marketing", position: "Marketing Lead", phone: "+1-555-0105", joinDate: "2022-01-10", salary: 68000, status: "active" },
  { id: 6, name: "David Kim", email: "david@leanaixs.com", password: "emp123", role: ROLES.EMPLOYEE, avatar: "DK", department: "Engineering", position: "Backend Developer", phone: "+1-555-0106", joinDate: "2022-04-05", salary: 75000, status: "active" },
  { id: 7, name: "Elena Russo", email: "elena@leanaixs.com", password: "emp123", role: ROLES.EMPLOYEE, avatar: "ER", department: "Finance", position: "Financial Analyst", phone: "+1-555-0107", joinDate: "2022-07-20", salary: 70000, status: "inactive" },
  { id: 8, name: "Thomas Berg", email: "thomas@leanaixs.com", password: "emp123", role: ROLES.EMPLOYEE, avatar: "TB", department: "Sales", position: "Sales Executive", phone: "+1-555-0108", joinDate: "2023-02-14", salary: 65000, status: "active" },
];

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Human Resources", "Finance", "Sales", "Management", "Operations"];

const generateAttendance = () => {
  const records = [];
  const today = new Date();
  MOCK_USERS.filter(u => u.role === ROLES.EMPLOYEE).forEach(user => {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const rand = Math.random();
      if (rand < 0.08) continue;
      const lateChance = Math.random() < 0.15;
      const clockIn = lateChance ? `${9 + Math.floor(Math.random() * 2)}:${String(15 + Math.floor(Math.random() * 45)).padStart(2, "0")}` : `${8 + Math.floor(Math.random() * 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
      const clockOut = `${17 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
      records.push({
        id: records.length + 1,
        userId: user.id,
        date: date.toISOString().split("T")[0],
        clockIn,
        clockOut: i === 0 && Math.random() < 0.3 ? null : clockOut,
        status: lateChance ? "late" : "present",
        lat: 37.7749 + (Math.random() - 0.5) * 0.01,
        lng: -122.4194 + (Math.random() - 0.5) * 0.01,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        device: ["Chrome/Windows", "Safari/macOS", "Firefox/Linux", "Chrome/Android"][Math.floor(Math.random() * 4)],
        selfie: null,
      });
    }
  });
  return records;
};

const generateLeaves = () => [
  { id: 1, userId: 3, type: "Annual Leave", from: "2024-12-20", to: "2024-12-25", days: 5, reason: "Family vacation", status: "approved", appliedOn: "2024-12-01" },
  { id: 2, userId: 4, type: "Sick Leave", from: "2024-12-10", to: "2024-12-11", days: 2, reason: "Medical appointment", status: "pending", appliedOn: "2024-12-09" },
  { id: 3, userId: 5, type: "Personal Leave", from: "2024-12-15", to: "2024-12-15", days: 1, reason: "Personal matters", status: "rejected", appliedOn: "2024-12-13" },
  { id: 4, userId: 6, type: "Annual Leave", from: "2025-01-05", to: "2025-01-10", days: 6, reason: "New Year trip", status: "pending", appliedOn: "2024-12-20" },
];

const generateNotifications = () => [
  { id: 1, type: "success", message: "Sophie Williams clocked in at 08:45", time: "2 min ago", read: false },
  { id: 2, type: "warning", message: "James Okafor late arrival - 09:32", time: "1 hr ago", read: false },
  { id: 3, type: "info", message: "Leave request from David Kim pending approval", time: "3 hr ago", read: true },
  { id: 4, type: "success", message: "Monthly report generated successfully", time: "Yesterday", read: true },
];

const generateAuditLogs = () => [
  { id: 1, user: "Alexandra Chen", action: "Approved leave request", target: "James Okafor", timestamp: new Date(Date.now() - 3600000).toISOString(), ip: "192.168.1.1" },
  { id: 2, user: "Marcus Rivera", action: "Added new employee", target: "Thomas Berg", timestamp: new Date(Date.now() - 7200000).toISOString(), ip: "192.168.1.2" },
  { id: 3, user: "Alexandra Chen", action: "Modified department", target: "Engineering", timestamp: new Date(Date.now() - 86400000).toISOString(), ip: "192.168.1.1" },
];

const OFFICE_CENTER = { lat: 37.7749, lng: -122.4194, radius: 500 };

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0b0f;
    --bg2: #111318;
    --bg3: #1a1d25;
    --bg4: #22262f;
    --border: #2a2e3a;
    --border2: #353a47;
    --text: #e8eaf0;
    --text2: #9aa0b4;
    --text3: #6b7280;
    --accent: #6366f1;
    --accent2: #818cf8;
    --accent3: #4f46e5;
    --green: #10b981;
    --green2: #059669;
    --red: #ef4444;
    --red2: #dc2626;
    --yellow: #f59e0b;
    --yellow2: #d97706;
    --blue: #3b82f6;
    --purple: #a855f7;
    --cyan: #06b6d4;
    --pink: #ec4899;
    --card-shadow: 0 4px 24px rgba(0,0,0,0.4);
    --glow: 0 0 20px rgba(99,102,241,0.3);
  }

  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
  
  .app { display: flex; height: 100vh; overflow: hidden; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  /* Sidebar */
  .sidebar { width: 260px; min-width: 260px; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto; transition: all 0.3s; z-index: 100; }
  .sidebar.collapsed { width: 70px; min-width: 70px; }
  .sidebar-logo { padding: 24px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
  .logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), var(--purple)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: white; flex-shrink: 0; }
  .logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: var(--text); white-space: nowrap; overflow: hidden; }
  .logo-text span { color: var(--accent2); }
  .sidebar-nav { flex: 1; padding: 16px 10px; }
  .nav-section { margin-bottom: 8px; }
  .nav-label { font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 1.5px; padding: 8px 10px 4px; white-space: nowrap; overflow: hidden; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s; color: var(--text2); font-size: 14px; font-weight: 500; position: relative; white-space: nowrap; overflow: hidden; margin-bottom: 2px; }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1)); color: var(--accent2); border: 1px solid rgba(99,102,241,0.3); }
  .nav-item .nav-icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .nav-badge { margin-left: auto; background: var(--red); color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; flex-shrink: 0; }
  .sidebar-user { padding: 16px; border-top: 1px solid var(--border); }
  .user-card { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; background: var(--bg3); cursor: pointer; }
  .avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .avatar-lg { width: 56px; height: 56px; border-radius: 14px; font-size: 20px; }
  .avatar-xl { width: 80px; height: 80px; border-radius: 20px; font-size: 28px; }
  .user-info { overflow: hidden; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Main */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 64px; min-height: 64px; background: var(--bg2); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 16px; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: var(--text); flex: 1; }
  .topbar-subtitle { font-size: 13px; color: var(--text3); }
  .content { flex: 1; overflow-y: auto; padding: 24px; }

  /* Cards */
  .card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
  .card-sm { padding: 16px; }
  .stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 20px; position: relative; overflow: hidden; transition: all 0.2s; }
  .stat-card:hover { border-color: var(--border2); transform: translateY(-1px); }
  .stat-card::before { content: ''; position: absolute; top: 0; right: 0; width: 120px; height: 120px; border-radius: 50%; opacity: 0.05; }
  .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 12px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--text); line-height: 1; }
  .stat-label { font-size: 13px; color: var(--text2); margin-top: 6px; }
  .stat-change { font-size: 12px; margin-top: 8px; display: flex; align-items: center; gap: 4px; }
  .stat-change.up { color: var(--green); }
  .stat-change.down { color: var(--red); }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .btn-sm { padding: 6px 12px; font-size: 13px; border-radius: 8px; }
  .btn-lg { padding: 14px 28px; font-size: 15px; border-radius: 12px; }
  .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent3)); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
  .btn-primary:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.5); transform: translateY(-1px); }
  .btn-secondary { background: var(--bg3); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--bg4); border-color: var(--border2); }
  .btn-success { background: linear-gradient(135deg, var(--green), var(--green2)); color: white; }
  .btn-danger { background: linear-gradient(135deg, var(--red), var(--red2)); color: white; }
  .btn-warning { background: linear-gradient(135deg, var(--yellow), var(--yellow2)); color: white; }
  .btn-ghost { background: transparent; color: var(--text2); padding: 8px; border-radius: 8px; }
  .btn-ghost:hover { background: var(--bg3); color: var(--text); }

  /* Badges */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-green { background: rgba(16,185,129,0.15); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
  .badge-red { background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }
  .badge-yellow { background: rgba(245,158,11,0.15); color: var(--yellow); border: 1px solid rgba(245,158,11,0.3); }
  .badge-blue { background: rgba(59,130,246,0.15); color: var(--blue); border: 1px solid rgba(59,130,246,0.3); }
  .badge-purple { background: rgba(168,85,247,0.15); color: var(--purple); border: 1px solid rgba(168,85,247,0.3); }
  .badge-gray { background: rgba(107,114,128,0.15); color: var(--text3); border: 1px solid rgba(107,114,128,0.3); }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text2); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }

  /* Forms */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }
  .form-input { width: 100%; padding: 10px 14px; background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; outline: none; }
  .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239aa0b4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 36px; }
  .form-textarea { resize: vertical; min-height: 80px; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
  .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 24px; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.2s; }
  .modal-lg { max-width: 800px; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
  @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* Misc */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .gap-6 { gap: 24px; }
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-3 { margin-bottom: 12px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .ml-auto { margin-left: auto; }
  .w-full { width: 100%; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 11px; }
  .text-lg { font-size: 18px; }
  .text-xl { font-size: 22px; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .text-accent { color: var(--accent2); }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-yellow { color: var(--yellow); }
  .text-muted { color: var(--text3); }
  .text-center { text-align: center; }
  .rounded { border-radius: 8px; }
  .rounded-lg { border-radius: 12px; }
  .p-3 { padding: 12px; }
  .p-4 { padding: 16px; }
  .relative { position: relative; }
  .overflow-hidden { overflow: hidden; }

  /* Login */
  .login-page { min-height: 100vh; background: var(--bg); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .login-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(6,182,212,0.08) 0%, transparent 50%); }
  .login-card { width: 420px; background: var(--bg2); border: 1px solid var(--border); border-radius: 24px; padding: 40px; position: relative; z-index: 1; }
  .login-logo { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 32px; }
  .login-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; text-align: center; margin-bottom: 8px; }
  .login-subtitle { text-align: center; color: var(--text3); font-size: 14px; margin-bottom: 28px; }

  /* Charts (SVG-based) */
  .chart-container { position: relative; }
  .chart-bar { transition: opacity 0.2s; cursor: pointer; }
  .chart-bar:hover { opacity: 0.8; }

  /* Map placeholder */
  .map-container { background: var(--bg3); border-radius: 12px; overflow: hidden; position: relative; }
  .map-placeholder { background: linear-gradient(135deg, #0f1923 0%, #1a2634 50%, #0f1923 100%); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; }
  .map-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px); background-size: 40px 40px; }
  .map-dot { width: 14px; height: 14px; background: var(--red); border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(239,68,68,0.3); animation: pulse 2s infinite; position: absolute; }
  .map-circle { position: absolute; border: 2px dashed rgba(99,102,241,0.4); border-radius: 50%; }

  /* Progress bar */
  .progress { height: 6px; background: var(--bg4); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }

  /* Clock widget */
  .clock-widget { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 20px; padding: 28px; text-align: center; }
  .clock-time { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: var(--text); letter-spacing: 2px; line-height: 1; }
  .clock-date { font-size: 14px; color: var(--text2); margin-top: 8px; }
  .clock-status { display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .clock-status.in { background: rgba(16,185,129,0.15); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
  .clock-status.out { background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }
  .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: pulse 1.5s infinite; }

  /* Notification */
  .notif-panel { position: absolute; top: 64px; right: 16px; width: 340px; background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 16px; z-index: 200; animation: slideInRight 0.2s; box-shadow: var(--card-shadow); }
  .notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-radius: 10px; margin-bottom: 6px; cursor: pointer; transition: background 0.15s; }
  .notif-item:hover { background: var(--bg3); }
  .notif-item.unread { background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.1); }
  .notif-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }

  /* Tabs */
  .tabs { display: flex; gap: 4px; background: var(--bg3); border-radius: 12px; padding: 4px; margin-bottom: 20px; }
  .tab { flex: 1; padding: 8px 16px; border-radius: 9px; font-size: 14px; font-weight: 500; cursor: pointer; text-align: center; color: var(--text3); transition: all 0.2s; border: none; background: none; font-family: 'DM Sans', sans-serif; }
  .tab.active { background: var(--bg2); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }

  /* Search */
  .search-box { display: flex; align-items: center; gap: 8px; background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 8px 14px; }
  .search-box input { background: none; border: none; outline: none; color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif; width: 200px; }

  /* Timeline */
  .timeline { position: relative; }
  .timeline::before { content: ''; position: absolute; left: 20px; top: 0; bottom: 0; width: 2px; background: var(--border); }
  .timeline-item { display: flex; gap: 16px; padding: 0 0 20px 0; position: relative; }
  .timeline-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; border: 2px solid var(--bg2); position: relative; z-index: 1; margin-left: 14px; }

  /* Geofence map */
  .geo-map { width: 100%; height: 200px; border-radius: 12px; overflow: hidden; position: relative; background: #0f1923; }
  .office-zone { position: absolute; border-radius: 50%; background: rgba(99,102,241,0.15); border: 2px solid rgba(99,102,241,0.5); transform: translate(-50%, -50%); }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: -260px; height: 100%; }
    .sidebar.mobile-open { left: 0; }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: 1fr; }
    .grid-2 { grid-template-columns: 1fr; }
    .clock-time { font-size: 36px; }
  }

  /* Leave calendar */
  .leave-calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.15s; }
  .cal-day:hover { background: var(--bg3); }
  .cal-day.today { background: var(--accent); color: white; font-weight: 700; }
  .cal-day.leave { background: rgba(245,158,11,0.2); color: var(--yellow); }
  .cal-day.absent { background: rgba(239,68,68,0.1); color: var(--red); }

  /* QR Code */
  .qr-code { width: 160px; height: 160px; background: white; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
  .qr-inner { width: 100%; height: 100%; background: repeating-linear-gradient(0deg, #000 0, #000 4px, transparent 4px, transparent 8px), repeating-linear-gradient(90deg, #000 0, #000 4px, transparent 4px, transparent 8px); opacity: 0.8; border-radius: 4px; }

  /* Selfie preview */
  .selfie-box { width: 140px; height: 140px; border-radius: 14px; border: 2px dashed var(--border); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; margin: 0 auto; cursor: pointer; transition: all 0.2s; overflow: hidden; }
  .selfie-box:hover { border-color: var(--accent); }

  /* Payroll */
  .payroll-bar { height: 8px; background: var(--bg4); border-radius: 4px; overflow: hidden; margin-top: 6px; }
  .payroll-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--accent), var(--purple)); }

  /* Spinner */
  .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }

  /* Toast */
  .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
  .toast { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; min-width: 280px; box-shadow: var(--card-shadow); animation: slideInRight 0.3s; font-size: 14px; }
  .toast.success { border-left: 3px solid var(--green); }
  .toast.error { border-left: 3px solid var(--red); }
  .toast.info { border-left: 3px solid var(--blue); }
  .toast.warning { border-left: 3px solid var(--yellow); }

  /* Analytics donut */
  .donut-chart { display: flex; align-items: center; gap: 24px; }
  .donut-legend { display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

  /* Section header */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: var(--text); }
  .section-sub { font-size: 13px; color: var(--text3); margin-top: 2px; }

  /* Empty state */
  .empty-state { text-align: center; padding: 48px 24px; color: var(--text3); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
  .empty-text { font-size: 15px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }

  /* Highlight row */
  .row-highlight { animation: highlightRow 2s ease-out; }
  @keyframes highlightRow { from { background: rgba(99,102,241,0.2); } to { background: transparent; } }
`;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const getAvatarColor = (name) => {
  const colors = [
    "linear-gradient(135deg,#6366f1,#a855f7)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#3b82f6,#2563eb)",
    "linear-gradient(135deg,#ec4899,#db2777)",
    "linear-gradient(135deg,#06b6d4,#0284c7)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#84cc16,#65a30d)",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const formatTime = (t) => { if (!t) return "—"; return t; };
const calcHours = (inn, out) => {
  if (!inn || !out) return "—";
  const [ih, im] = inn.split(":").map(Number);
  const [oh, om] = out.split(":").map(Number);
  const mins = (oh * 60 + om) - (ih * 60 + im);
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m`;
};
const today = () => new Date().toISOString().split("T")[0];
const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const formatDateTime = (d) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const isLate = (clockIn) => { if (!clockIn) return false; const [h, m] = clockIn.split(":").map(Number); return h > 9 || (h === 9 && m > 0); };

// ============================================================
// ICONS (SVG inline)
// ============================================================
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    dashboard: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    users: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    clock: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    calendar: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    chart: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    settings: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    bell: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    search: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    download: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    mapPin: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    menu: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    chevronRight: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    arrow_up: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    arrow_down: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
    building: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    shield: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    file: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    camera: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    qr: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h3v-3h-3M14 17v3M17 14v3"/></svg>,
    trending: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    dollar: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    mail: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    eye: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    info: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    star: <svg width={size} height={size} fill={color} stroke={color} strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  };
  return icons[name] || null;
};

// ============================================================
// COMPONENTS
// ============================================================

// Toast system
const ToastContext = ({ toasts, removeToast }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`}>
        <span style={{ fontSize: 18 }}>
          {t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "ℹ️"}
        </span>
        <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>{t.message}</span>
        <button className="btn-ghost" style={{ padding: "2px 4px" }} onClick={() => removeToast(t.id)}>
          <Icon name="x" size={14} />
        </button>
      </div>
    ))}
  </div>
);

// Bar Chart Component
const BarChart = ({ data, height = 160 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="chart-container" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${data.length * 40} ${height}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 40);
          const y = height - barH - 30;
          return (
            <g key={i} className="chart-bar">
              <rect x={i * 40 + 6} y={y} width={28} height={barH} rx={4} fill={d.color || "url(#barGrad)"} />
              <text x={i * 40 + 20} y={height - 10} textAnchor="middle" fill="var(--text3)" fontSize={10}>{d.label}</text>
              <text x={i * 40 + 20} y={y - 4} textAnchor="middle" fill="var(--text2)" fontSize={10}>{d.value}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Line Chart
const LineChart = ({ data, height = 120, color = "#6366f1" }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 400, h = height - 20;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (d.value / max) * h,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x},${h} L0,${h} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lineArea)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </svg>
  );
};

// Donut Chart
const DonutChart = ({ segments, size = 100 }) => {
  const r = 35, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
            strokeWidth="14" strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} transform="rotate(-90 50 50)" strokeLinecap="round" />
        );
        offset += dash;
        return el;
      })}
      <text x={50} y={54} textAnchor="middle" fill="var(--text)" fontSize={16} fontWeight="700" fontFamily="Syne">
        {total}
      </text>
    </svg>
  );
};

// Map Component (simulated)
const MapView = ({ lat, lng, showOffice = false }) => {
  const [mapLat] = useState(lat || OFFICE_CENTER.lat);
  const [mapLng] = useState(lng || OFFICE_CENTER.lng);
  return (
    <div className="map-container" style={{ height: 220 }}>
      <div className="map-grid" />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {showOffice && (
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(99,102,241,0.1)", border: "2px dashed rgba(99,102,241,0.5)",
            position: "absolute", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: 10, color: "var(--accent2)", fontWeight: 600 }}>Office Zone</span>
          </div>
        )}
        <div className="map-dot" />
      </div>
      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: 6, fontSize: 11, color: "var(--text2)" }}>
        📍 {mapLat.toFixed(4)}, {mapLng.toFixed(4)}
      </div>
      <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(99,102,241,0.8)", padding: "3px 8px", borderRadius: 6, fontSize: 11, color: "white", fontWeight: 600 }}>
        LIVE
      </div>
    </div>
  );
};

// ============================================================
// PAGES
// ============================================================

// LOGIN PAGE
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = () => {
    setError("");
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) { setError("Invalid email or password"); return; }
    if (user.status === "inactive") { setError("Account is inactive. Contact HR."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(user, `jwt_${user.id}_${Date.now()}`);
    }, 800);
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setResetSent(true); }, 1000);
  };

  return (
    <div className="login-page">
      <style>{styles}</style>
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">LA</div>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22 }}>LeanAixs<span style={{ color: "var(--accent2)" }}> HR</span></div>
        </div>
        {tab === "login" ? (
          <>
            <div className="login-title">Welcome to LeanAixs HR</div>
            <div className="login-subtitle">Sign in to your LeanAixs HR portal</div>
            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input className="form-input" type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ paddingRight: 40 }} />
                <button className="btn-ghost" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }} onClick={() => setShowPw(!showPw)}>
                  <Icon name="eye" size={16} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "var(--accent)" }} /> Remember me
              </label>
              <button onClick={() => setTab("reset")} style={{ background: "none", border: "none", color: "var(--accent2)", fontSize: 13, cursor: "pointer" }}>Forgot password?</button>
            </div>
            <button className="btn btn-primary w-full" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
              {loading ? <div className="spinner" /> : "Sign In"}
            </button>
            <div style={{ marginTop: 20, padding: "12px", background: "var(--bg3)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Demo Credentials</div>
              {[{ label: "Admin", email: "admin@leanaixs.com", pw: "admin123", color: "var(--accent)" },
                { label: "HR Manager", email: "hr@leanaixs.com", pw: "hr123", color: "var(--purple)" },
                { label: "Employee", email: "sophie@leanaixs.com", pw: "emp123", color: "var(--green)" }].map(c => (
                <button key={c.label} onClick={() => { setEmail(c.email); setPassword(c.pw); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "4px 0", cursor: "pointer", fontSize: 12, color: "var(--text2)" }}>
                  <span style={{ color: c.color, fontWeight: 600 }}>[{c.label}]</span> {c.email}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="login-title">Reset Password</div>
            <div className="login-subtitle">{resetSent ? "Check your email for reset instructions" : "Enter your email to receive reset instructions"}</div>
            {!resetSent ? (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@company.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                </div>
                <button className="btn btn-primary w-full" onClick={handleReset} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
                  {loading ? <div className="spinner" /> : "Send Reset Link"}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
                <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600 }}>Email sent!</div>
              </div>
            )}
            <button onClick={() => { setTab("login"); setResetSent(false); }} style={{ background: "none", border: "none", color: "var(--accent2)", fontSize: 14, cursor: "pointer", width: "100%", textAlign: "center", marginTop: 16 }}>
              ← Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// DASHBOARD
const Dashboard = ({ user, attendance, employees, leaves, addToast }) => {
  const todayStr = today();
  const todayAtt = attendance.filter(a => a.date === todayStr);
  const empIds = employees.filter(e => e.role === ROLES.EMPLOYEE).map(e => e.id);
  const presentToday = todayAtt.filter(a => empIds.includes(a.userId) && a.status !== "absent");
  const lateToday = todayAtt.filter(a => a.status === "late");
  const absentToday = empIds.length - presentToday.length;
  const pendingLeaves = leaves.filter(l => l.status === "pending");
  const totalEmp = employees.filter(e => e.role === ROLES.EMPLOYEE).length;
  const activeEmp = employees.filter(e => e.status === "active" && e.role === ROLES.EMPLOYEE).length;

  // Weekly trend
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split("T")[0];
    const count = attendance.filter(a => a.date === ds).length;
    return { label: ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()], value: count };
  });

  // Monthly bars
  const monthData = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (3 - i) * 7);
    return { label: `Wk${i + 1}`, value: Math.floor(Math.random() * 30) + 50 };
  });

  const recentActivity = attendance.filter(a => a.date === todayStr).slice(0, 5);

  return (
    <div>
      <div className="grid-4 mb-6">
        {[
          { label: "Total Employees", value: totalEmp, icon: "users", color: "#6366f1", bg: "rgba(99,102,241,0.15)", change: "+2 this month", up: true },
          { label: "Present Today", value: presentToday.length, icon: "check", color: "#10b981", bg: "rgba(16,185,129,0.15)", change: `${Math.round(presentToday.length/totalEmp*100)}% attendance`, up: true },
          { label: "Absent Today", value: absentToday, icon: "x", color: "#ef4444", bg: "rgba(239,68,68,0.15)", change: `${lateToday.length} late arrivals`, up: false },
          { label: "Pending Leaves", value: pendingLeaves.length, icon: "calendar", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", change: "Requires approval", up: null },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Icon name={s.icon} size={22} color={s.color} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.up === true ? "up" : s.up === false ? "down" : ""}`} style={s.up === null ? { color: "var(--text3)" } : {}}>
              {s.up === true ? "↑" : s.up === false ? "↓" : "•"} {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Weekly Attendance</div>
              <div className="section-sub">Check-ins per day this week</div>
            </div>
            <span className="badge badge-green">This Week</span>
          </div>
          <BarChart data={weekData} height={160} />
        </div>
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Attendance Trend</div>
              <div className="section-sub">30-day attendance rate</div>
            </div>
          </div>
          <LineChart data={weekData.map((d, i) => ({ value: d.value + Math.floor(Math.random() * 5) }))} height={120} color="#10b981" />
          <div className="flex gap-4 mt-4" style={{ marginTop: 12 }}>
            {[{ label: "Avg. Check-in", val: "08:52 AM", color: "var(--green)" },
              { label: "Avg. Hours", val: "7h 48m", color: "var(--accent2)" },
              { label: "On-time Rate", val: "87%", color: "var(--yellow)" }].map((s, i) => (
              <div key={i} style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "Syne" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="section-title">Today's Attendance</div>
            <span className="badge badge-blue">{todayStr}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
            <DonutChart segments={[
              { value: presentToday.length - lateToday.length, color: "#10b981" },
              { value: lateToday.length, color: "#f59e0b" },
              { value: Math.max(0, absentToday), color: "#ef4444" },
            ]} size={100} />
            <div className="donut-legend">
              {[{ label: "On Time", value: presentToday.length - lateToday.length, color: "#10b981" },
                { label: "Late", value: lateToday.length, color: "#f59e0b" },
                { label: "Absent", value: Math.max(0, absentToday), color: "#ef4444" }].map((l, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-dot" style={{ background: l.color }} />
                  <span style={{ color: "var(--text2)" }}>{l.label}</span>
                  <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--text)" }}>{l.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            {recentActivity.slice(0, 4).map((rec, i) => {
              const emp = employees.find(e => e.id === rec.userId);
              if (!emp) return null;
              return (
                <div key={i} className="flex items-center gap-3" style={{ padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                  <div className="avatar" style={{ background: getAvatarColor(emp.name), width: 32, height: 32, fontSize: 11 }}>{emp.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Clocked in {rec.clockIn}</div>
                  </div>
                  <span className={`badge ${rec.status === "late" ? "badge-yellow" : "badge-green"}`}>{rec.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Department Overview</div>
          </div>
          {DEPARTMENTS.slice(0, 6).map((dept, i) => {
            const deptEmps = employees.filter(e => e.department === dept && e.role === ROLES.EMPLOYEE);
            const deptPresent = todayAtt.filter(a => deptEmps.some(e => e.id === a.userId));
            const pct = deptEmps.length ? Math.round(deptPresent.length / deptEmps.length * 100) : 0;
            const colors = ["#6366f1","#10b981","#f59e0b","#3b82f6","#ec4899","#06b6d4"];
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{dept}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{deptPresent.length}/{deptEmps.length}</span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ATTENDANCE CLOCK (Employee)
const AttendanceClock = ({ user, attendance, setAttendance, addToast }) => {
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState("");
  const [selfie, setSelfie] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayRec = attendance.find(a => a.userId === user.id && a.date === today());
  const isClockedIn = todayRec && !todayRec.clockOut;
  const isClockedOut = todayRec && todayRec.clockOut;

  const getLocation = () => new Promise((res, rej) => {
    if (!navigator.geolocation) { rej("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => res({ lat: OFFICE_CENTER.lat + (Math.random() - 0.5) * 0.005, lng: OFFICE_CENTER.lng + (Math.random() - 0.5) * 0.005 })
    );
  });

  const handleClockIn = async () => {
    setLoading(true);
    setLocError("");
    try {
      const loc = await getLocation();
      setLocation(loc);
      const dist = Math.sqrt(Math.pow(loc.lat - OFFICE_CENTER.lat, 2) + Math.pow(loc.lng - OFFICE_CENTER.lng, 2)) * 111000;
      const clockInTime = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
      const rec = {
        id: Date.now(), userId: user.id, date: today(),
        clockIn: clockInTime, clockOut: null,
        status: isLate(clockInTime) ? "late" : "present",
        lat: loc.lat, lng: loc.lng,
        ip: `192.168.1.${Math.floor(Math.random() * 254 + 1)}`,
        device: navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser",
        selfie,
        geofenceOk: dist < OFFICE_CENTER.radius,
      };
      setAttendance(prev => [...prev.filter(a => !(a.userId === user.id && a.date === today())), rec]);
      addToast(`Clocked in at ${clockInTime} ${isLate(clockInTime) ? "⚠️ (Late)" : "✅"}`, isLate(clockInTime) ? "warning" : "success");
    } catch (e) { setLocError(e.toString()); }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    const loc = await getLocation();
    const clockOutTime = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
    setAttendance(prev => prev.map(a =>
      a.userId === user.id && a.date === today() ? { ...a, clockOut: clockOutTime } : a
    ));
    addToast(`Clocked out at ${clockOutTime}. Great work today! 🏠`, "success");
    setLoading(false);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setShowCamera(false); addToast("Camera not available - using demo selfie", "info"); setSelfie("demo"); }
  };

  const captureSelfie = () => {
    setSelfie("captured"); setShowCamera(false);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    addToast("Selfie captured successfully", "success");
  };

  const myHistory = attendance.filter(a => a.userId === user.id).slice(0, 10);

  return (
    <div>
      <div className="grid-2 mb-4">
        <div className="clock-widget">
          <div className="clock-time">
            {time.getHours().toString().padStart(2, "0")}:{time.getMinutes().toString().padStart(2, "0")}:{time.getSeconds().toString().padStart(2, "0")}
          </div>
          <div className="clock-date">
            {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
          {todayRec ? (
            <div className={`clock-status ${isClockedIn ? "in" : "out"}`}>
              <div className="pulse-dot" />{isClockedIn ? `Clocked In at ${todayRec.clockIn}` : `Day Complete — ${calcHours(todayRec.clockIn, todayRec.clockOut)}`}
            </div>
          ) : (
            <div style={{ marginTop: 16, fontSize: 13, color: "var(--text3)" }}>Not clocked in yet</div>
          )}

          <div className="flex gap-2 mt-4" style={{ marginTop: 20, justifyContent: "center" }}>
            {!todayRec && (
              <button className="btn btn-success btn-lg" onClick={handleClockIn} disabled={loading}>
                {loading ? <div className="spinner" /> : <>⏱ Clock In</>}
              </button>
            )}
            {isClockedIn && (
              <button className="btn btn-danger btn-lg" onClick={handleClockOut} disabled={loading}>
                {loading ? <div className="spinner" /> : <>🔴 Clock Out</>}
              </button>
            )}
            {isClockedOut && (
              <div className="badge badge-green" style={{ padding: "8px 16px", fontSize: 13 }}>✅ Attendance Recorded</div>
            )}
          </div>

          <div className="flex gap-2" style={{ marginTop: 12, justifyContent: "center" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowQR(!showQR)}>
              <Icon name="qr" size={14} /> QR Scan
            </button>
            <button className="btn btn-secondary btn-sm" onClick={startCamera}>
              <Icon name="camera" size={14} /> {selfie ? "✅ Selfie" : "Selfie"}
            </button>
          </div>

          {locError && <div style={{ marginTop: 8, fontSize: 12, color: "var(--red)" }}>{locError}</div>}
        </div>

        <div>
          {showQR && (
            <div className="card mb-3">
              <div className="section-title mb-3">QR Code Attendance</div>
              <div className="qr-code">
                <div className="qr-inner" />
              </div>
              <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--text3)" }}>
                Scan this QR code to mark attendance
              </div>
              <button className="btn btn-primary btn-sm" style={{ display: "block", margin: "12px auto 0" }} onClick={() => { setShowQR(false); handleClockIn(); }}>
                Simulate QR Scan
              </button>
            </div>
          )}
          {todayRec && <MapView lat={todayRec.lat} lng={todayRec.lng} showOffice={true} />}
          {!todayRec && (
            <div className="card" style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "var(--text3)" }}>
              <Icon name="mapPin" size={32} />
              <div style={{ fontSize: 14 }}>Location will appear after clock-in</div>
            </div>
          )}
          {todayRec && (
            <div className="card mt-3" style={{ marginTop: 12 }}>
              <div className="grid-2">
                {[{ label: "IP Address", value: todayRec.ip },
                  { label: "Device", value: todayRec.device },
                  { label: "Geofence", value: todayRec.geofenceOk !== false ? "✅ In Zone" : "⚠️ Out of Zone" },
                  { label: "Clock In", value: todayRec.clockIn }].map((i, idx) => (
                  <div key={idx} style={{ padding: "8px", background: "var(--bg3)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{i.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{i.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCamera && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400, textAlign: "center" }}>
            <div className="modal-header">
              <div className="modal-title">📸 Selfie Verification</div>
              <button className="btn-ghost" onClick={() => { setShowCamera(false); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div style={{ width: 240, height: 240, borderRadius: 16, overflow: "hidden", margin: "0 auto 16px", background: "var(--bg3)", border: "1px solid var(--border)" }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <button className="btn btn-primary" onClick={captureSelfie}>📸 Capture</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <div className="section-title">My Attendance History</div>
          <button className="btn btn-secondary btn-sm"><Icon name="download" size={14} /> Export</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th><th>Location</th>
            </tr></thead>
            <tbody>
              {myHistory.map((rec, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--text)", fontWeight: 500 }}>{formatDate(rec.date)}</td>
                  <td>{formatTime(rec.clockIn)}</td>
                  <td>{formatTime(rec.clockOut)}</td>
                  <td style={{ fontWeight: 600, color: "var(--accent2)" }}>{calcHours(rec.clockIn, rec.clockOut)}</td>
                  <td><span className={`badge ${rec.status === "present" ? "badge-green" : rec.status === "late" ? "badge-yellow" : "badge-red"}`}>{rec.status}</span></td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>📍 {rec.lat?.toFixed(4)}, {rec.lng?.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// EMPLOYEES PAGE
const EmployeesPage = ({ employees, setEmployees, attendance, addToast, currentUser }) => {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [viewEmp, setViewEmp] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", department: "Engineering", position: "", phone: "", salary: "", status: "active", role: ROLES.EMPLOYEE });

  const filtered = employees.filter(e =>
    (search === "" || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())) &&
    (dept === "All" || e.department === dept) &&
    (status === "All" || e.status === status)
  );

  const openAdd = () => { setEditEmp(null); setForm({ name: "", email: "", department: "Engineering", position: "", phone: "", salary: "", status: "active", role: ROLES.EMPLOYEE }); setShowModal(true); };
  const openEdit = (emp) => { setEditEmp(emp); setForm({ ...emp }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.email) { addToast("Name and email are required", "error"); return; }
    if (editEmp) {
      setEmployees(prev => prev.map(e => e.id === editEmp.id ? { ...e, ...form } : e));
      addToast("Employee updated successfully", "success");
    } else {
      const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      setEmployees(prev => [...prev, { ...form, id: Date.now(), avatar: initials, joinDate: today(), password: "emp123" }]);
      addToast("Employee added successfully", "success");
    }
    setShowModal(false);
  };

  const handleDelete = (emp) => {
    if (window.confirm(`Delete ${emp.name}?`)) {
      setEmployees(prev => prev.filter(e => e.id !== emp.id));
      addToast(`${emp.name} removed`, "info");
    }
  };

  const getAttendanceRate = (empId) => {
    const total = attendance.filter(a => a.userId === empId).length;
    return total > 0 ? Math.round((total / 20) * 100) : 0;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="section-title" style={{ fontSize: 20 }}>Employee Management</div>
          <div className="section-sub">{filtered.length} employees found</div>
        </div>
        {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.HR) && (
          <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" size={16} /> Add Employee</button>
        )}
      </div>

      <div className="flex gap-3 mb-4" style={{ flexWrap: "wrap" }}>
        <div className="search-box">
          <Icon name="search" size={16} color="var(--text3)" />
          <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input form-select" style={{ width: 160 }} value={dept} onChange={e => setDept(e.target.value)}>
          <option>All</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="form-input form-select" style={{ width: 130 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option>All</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Employee</th><th>Department</th><th>Position</th><th>Status</th><th>Attendance</th><th>Joined</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar" style={{ background: getAvatarColor(emp.name) }}>{emp.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-purple">{emp.department}</span></td>
                  <td style={{ color: "var(--text)" }}>{emp.position}</td>
                  <td><span className={`badge ${emp.status === "active" ? "badge-green" : "badge-red"}`}>{emp.status}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${getAttendanceRate(emp.id)}%`, background: "var(--green)" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text2)" }}>{getAttendanceRate(emp.id)}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{formatDate(emp.joinDate)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-ghost btn" style={{ padding: 6 }} onClick={() => setViewEmp(emp)} title="View"><Icon name="eye" size={15} /></button>
                      {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.HR) && (
                        <>
                          <button className="btn-ghost btn" style={{ padding: 6 }} onClick={() => openEdit(emp)} title="Edit"><Icon name="edit" size={15} /></button>
                          <button className="btn-ghost btn" style={{ padding: 6, color: "var(--red)" }} onClick={() => handleDelete(emp)} title="Delete"><Icon name="trash" size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editEmp ? "Edit Employee" : "Add New Employee"}</div>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><Icon name="x" size={18} /></button>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" /></div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" /></div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-input form-select" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Position</label><input className="form-input" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} placeholder="Senior Developer" /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1-555-0000" /></div>
              <div className="form-group"><label className="form-label">Salary (USD)</label><input className="form-input" type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="70000" /></div>
              <div className="form-group"><label className="form-label">Role</label>
                <select className="form-input form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value={ROLES.EMPLOYEE}>Employee</option>
                  <option value={ROLES.HR}>HR Manager</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-input form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-between mt-4">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Icon name="check" size={16} /> {editEmp ? "Update" : "Add"} Employee</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewEmp && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewEmp(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Employee Profile</div>
              <button className="btn-ghost" onClick={() => setViewEmp(null)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div className="avatar avatar-xl" style={{ background: getAvatarColor(viewEmp.name), margin: "0 auto 12px" }}>{viewEmp.avatar}</div>
              <div style={{ fontFamily: "Syne", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{viewEmp.name}</div>
              <div style={{ color: "var(--text3)", fontSize: 14 }}>{viewEmp.position}</div>
              <div className="flex gap-2" style={{ justifyContent: "center", marginTop: 8 }}>
                <span className="badge badge-purple">{viewEmp.department}</span>
                <span className={`badge ${viewEmp.status === "active" ? "badge-green" : "badge-red"}`}>{viewEmp.status}</span>
              </div>
            </div>
            <div className="grid-2">
              {[
                { label: "Email", value: viewEmp.email, icon: "mail" },
                { label: "Phone", value: viewEmp.phone, icon: "info" },
                { label: "Join Date", value: formatDate(viewEmp.joinDate), icon: "calendar" },
                { label: "Salary", value: `$${Number(viewEmp.salary || 0).toLocaleString()}`, icon: "dollar" },
                { label: "Attendance Rate", value: `${getAttendanceRate(viewEmp.id)}%`, icon: "chart" },
                { label: "Role", value: viewEmp.role.charAt(0).toUpperCase() + viewEmp.role.slice(1), icon: "shield" },
              ].map((item, i) => (
                <div key={i} style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{item.value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ATTENDANCE ADMIN
const AttendanceAdmin = ({ attendance, employees, addToast }) => {
  const [dateFilter, setDateFilter] = useState(today());
  const [empFilter, setEmpFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewRec, setViewRec] = useState(null);

  const filtered = attendance.filter(a =>
    (dateFilter === "" || a.date === dateFilter) &&
    (empFilter === "All" || a.userId === Number(empFilter)) &&
    (statusFilter === "All" || a.status === statusFilter)
  ).sort((a, b) => b.date.localeCompare(a.date));

  const getEmp = (id) => employees.find(e => e.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="section-title" style={{ fontSize: 20 }}>Attendance Records</div>
          <div className="section-sub">{filtered.length} records</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => addToast("Exporting Excel report...", "info")}><Icon name="download" size={14} /> Excel</button>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast("Generating PDF report...", "info")}><Icon name="file" size={14} /> PDF</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4" style={{ flexWrap: "wrap" }}>
        <input type="date" className="form-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <select className="form-input form-select" style={{ width: 180 }} value={empFilter} onChange={e => setEmpFilter(e.target.value)}>
          <option value="All">All Employees</option>
          {employees.filter(e => e.role === ROLES.EMPLOYEE).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select className="form-input form-select" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All</option><option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => { setDateFilter(""); setEmpFilter("All"); setStatusFilter("All"); }}>Clear</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Employee</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th><th>Location</th><th>Device</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, 50).map((rec, i) => {
                const emp = getEmp(rec.userId);
                if (!emp) return null;
                return (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ background: getAvatarColor(emp.name), width: 28, height: 28, fontSize: 10 }}>{emp.avatar}</div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{formatDate(rec.date)}</td>
                    <td style={{ fontWeight: 600, color: isLate(rec.clockIn) ? "var(--yellow)" : "var(--green)" }}>{formatTime(rec.clockIn)}</td>
                    <td>{formatTime(rec.clockOut)}</td>
                    <td style={{ fontWeight: 600, color: "var(--accent2)" }}>{calcHours(rec.clockIn, rec.clockOut)}</td>
                    <td><span className={`badge ${rec.status === "present" ? "badge-green" : rec.status === "late" ? "badge-yellow" : "badge-red"}`}>{rec.status}</span></td>
                    <td style={{ fontSize: 11, color: "var(--text3)" }}>📍 {rec.lat?.toFixed(3)}, {rec.lng?.toFixed(3)}</td>
                    <td style={{ fontSize: 11, color: "var(--text3)" }}>{rec.device}</td>
                    <td><button className="btn-ghost btn" style={{ padding: 5 }} onClick={() => setViewRec(rec)}><Icon name="eye" size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewRec && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewRec(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Attendance Details</div>
              <button className="btn-ghost" onClick={() => setViewRec(null)}><Icon name="x" size={18} /></button>
            </div>
            {(() => {
              const emp = getEmp(viewRec.userId);
              return (
                <>
                  <div className="flex items-center gap-3 mb-4" style={{ padding: "12px", background: "var(--bg3)", borderRadius: 10 }}>
                    <div className="avatar avatar-lg" style={{ background: getAvatarColor(emp?.name || "") }}>{emp?.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{emp?.name}</div>
                      <div style={{ color: "var(--text3)", fontSize: 13 }}>{emp?.department} · {emp?.position}</div>
                    </div>
                    <span className={`badge ml-auto ${viewRec.status === "present" ? "badge-green" : viewRec.status === "late" ? "badge-yellow" : "badge-red"}`}>{viewRec.status}</span>
                  </div>
                  <MapView lat={viewRec.lat} lng={viewRec.lng} showOffice={true} />
                  <div className="grid-2 mt-4" style={{ marginTop: 16 }}>
                    {[{ l: "Date", v: formatDate(viewRec.date) }, { l: "Clock In", v: viewRec.clockIn }, { l: "Clock Out", v: viewRec.clockOut || "—" }, { l: "Total Hours", v: calcHours(viewRec.clockIn, viewRec.clockOut) }, { l: "IP Address", v: viewRec.ip }, { l: "Device", v: viewRec.device }, { l: "Latitude", v: viewRec.lat?.toFixed(6) }, { l: "Longitude", v: viewRec.lng?.toFixed(6) }].map((it, i) => (
                      <div key={i} style={{ background: "var(--bg3)", borderRadius: 8, padding: "8px 12px" }}>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{it.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{it.v}</div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// LEAVE MANAGEMENT
const LeavePage = ({ leaves, setLeaves, employees, currentUser, addToast }) => {
  const [tab, setTab] = useState(currentUser.role === ROLES.EMPLOYEE ? "apply" : "requests");
  const [form, setForm] = useState({ type: "Annual Leave", from: "", to: "", reason: "" });
  const [filter, setFilter] = useState("All");

  const handleApply = () => {
    if (!form.from || !form.to || !form.reason) { addToast("Please fill all fields", "error"); return; }
    const days = Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1;
    setLeaves(prev => [...prev, { id: Date.now(), userId: currentUser.id, ...form, days, status: "pending", appliedOn: today() }]);
    addToast("Leave application submitted successfully", "success");
    setForm({ type: "Annual Leave", from: "", to: "", reason: "" });
    setTab("my");
  };

  const handleAction = (id, action) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
    addToast(`Leave request ${action}`, action === "approved" ? "success" : "error");
  };

  const myLeaves = leaves.filter(l => l.userId === currentUser.id);
  const allLeaves = leaves.filter(l => filter === "All" || l.status === filter);
  const getEmp = (id) => employees.find(e => e.id === id);

  const leaveTypes = ["Annual Leave", "Sick Leave", "Personal Leave", "Maternity/Paternity Leave", "Unpaid Leave", "Emergency Leave"];

  return (
    <div>
      <div className="section-header mb-4">
        <div>
          <div className="section-title" style={{ fontSize: 20 }}>Leave Management</div>
          <div className="section-sub">{leaves.filter(l => l.status === "pending").length} pending requests</div>
        </div>
      </div>

      <div className="tabs">
        {currentUser.role === ROLES.EMPLOYEE && <button className={`tab ${tab === "apply" ? "active" : ""}`} onClick={() => setTab("apply")}>Apply for Leave</button>}
        {currentUser.role === ROLES.EMPLOYEE && <button className={`tab ${tab === "my" ? "active" : ""}`} onClick={() => setTab("my")}>My Leaves</button>}
        {(currentUser.role !== ROLES.EMPLOYEE) && <button className={`tab ${tab === "requests" ? "active" : ""}`} onClick={() => setTab("requests")}>All Requests</button>}
        <button className={`tab ${tab === "calendar" ? "active" : ""}`} onClick={() => setTab("calendar")}>Calendar View</button>
      </div>

      {tab === "apply" && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="section-title mb-4">New Leave Application</div>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select className="form-input form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {leaveTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">From Date</label><input type="date" className="form-input" value={form.from} min={today()} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">To Date</label><input type="date" className="form-input" value={form.to} min={form.from || today()} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} /></div>
          </div>
          {form.from && form.to && (
            <div style={{ marginBottom: 16, padding: "8px 12px", background: "rgba(99,102,241,0.1)", borderRadius: 8, fontSize: 13, color: "var(--accent2)" }}>
              📅 Duration: {Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1} day(s)
            </div>
          )}
          <div className="form-group"><label className="form-label">Reason</label><textarea className="form-input form-textarea" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Briefly describe your reason for leave..." /></div>
          <button className="btn btn-primary" onClick={handleApply}><Icon name="check" size={16} /> Submit Application</button>
        </div>
      )}

      {tab === "my" && (
        <div className="card">
          <div className="section-title mb-4">My Leave History</div>
          {myLeaves.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🏖️</div><div className="empty-text">No leave applications yet</div></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Applied</th></tr></thead>
                <tbody>
                  {myLeaves.map((l, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: "var(--text)" }}>{l.type}</td>
                      <td>{formatDate(l.from)}</td>
                      <td>{formatDate(l.to)}</td>
                      <td><span className="badge badge-blue">{l.days}d</span></td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.reason}</td>
                      <td><span className={`badge ${l.status === "approved" ? "badge-green" : l.status === "rejected" ? "badge-red" : "badge-yellow"}`}>{l.status}</span></td>
                      <td style={{ fontSize: 12 }}>{formatDate(l.appliedOn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Leave Requests</div>
            <select className="form-input form-select" style={{ width: 140 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option>All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>Period</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {allLeaves.map((l, i) => {
                  const emp = getEmp(l.userId);
                  return (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ background: getAvatarColor(emp?.name || ""), width: 28, height: 28, fontSize: 10 }}>{emp?.avatar}</div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{emp?.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{l.type}</td>
                      <td style={{ fontSize: 12 }}>{formatDate(l.from)} — {formatDate(l.to)}</td>
                      <td><span className="badge badge-blue">{l.days}d</span></td>
                      <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{l.reason}</td>
                      <td><span className={`badge ${l.status === "approved" ? "badge-green" : l.status === "rejected" ? "badge-red" : "badge-yellow"}`}>{l.status}</span></td>
                      <td>
                        {l.status === "pending" && (
                          <div className="flex gap-1">
                            <button className="btn btn-success btn-sm" onClick={() => handleAction(l.id, "approved")}><Icon name="check" size={12} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleAction(l.id, "rejected")}><Icon name="x" size={12} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "calendar" && (
        <div className="card">
          <div className="section-title mb-4">Leave Calendar — {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}</div>
          <div className="leave-calendar" style={{ marginBottom: 12 }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text3)", padding: "4px 0" }}>{d}</div>
            ))}
            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }, (_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate();
              const hasLeave = leaves.some(l => {
                const from = new Date(l.from), to = new Date(l.to), curr = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                return curr >= from && curr <= to && l.status === "approved";
              });
              return (
                <div key={day} className={`cal-day ${isToday ? "today" : hasLeave ? "leave" : ""}`}>
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            {[{ color: "var(--accent)", label: "Today" }, { color: "var(--yellow)", label: "Leave Approved" }].map((l, i) => (
              <div key={i} className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--text2)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ANALYTICS
const AnalyticsPage = ({ attendance, employees, leaves }) => {
  const empOnly = employees.filter(e => e.role === ROLES.EMPLOYEE);
  const totalWorkHours = attendance.reduce((s, a) => {
    if (!a.clockIn || !a.clockOut) return s;
    const [ih, im] = a.clockIn.split(":").map(Number);
    const [oh, om] = a.clockOut.split(":").map(Number);
    return s + ((oh * 60 + om) - (ih * 60 + im)) / 60;
  }, 0);

  const deptData = DEPARTMENTS.map(d => {
    const dEmps = empOnly.filter(e => e.department === d);
    const dAtt = attendance.filter(a => dEmps.some(e => e.id === a.userId));
    return { label: d.slice(0, 3), value: dAtt.length, color: `hsl(${DEPARTMENTS.indexOf(d) * 45}, 70%, 60%)` };
  }).filter(d => d.value > 0);

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return { value: Math.floor(Math.random() * 20) + 60, label: d.toLocaleString("en-US", { month: "short" }) };
  });

  const lateByDept = DEPARTMENTS.slice(0, 6).map(d => {
    const dEmps = empOnly.filter(e => e.department === d);
    const lates = attendance.filter(a => dEmps.some(e => e.id === a.userId) && a.status === "late").length;
    return { label: d.slice(0, 4), value: lates, color: "#f59e0b" };
  });

  const topPerformers = empOnly.map(emp => {
    const recs = attendance.filter(a => a.userId === emp.id);
    const onTime = recs.filter(a => a.status === "present").length;
    const rate = recs.length ? Math.round(onTime / recs.length * 100) : 0;
    return { ...emp, rate, recs: recs.length };
  }).sort((a, b) => b.rate - a.rate).slice(0, 5);

  return (
    <div>
      <div className="section-title mb-2" style={{ fontSize: 20 }}>Analytics & Reports</div>
      <div className="section-sub mb-6">Workforce insights and performance metrics</div>

      <div className="grid-4 mb-4">
        {[
          { label: "Total Work Hours", value: `${Math.round(totalWorkHours)}h`, icon: "clock", color: "#6366f1", sub: "This month" },
          { label: "Avg Daily Attendance", value: `${Math.round(empOnly.length * 0.85)}`, icon: "users", color: "#10b981", sub: "Employees" },
          { label: "On-time Rate", value: "87%", icon: "trending", color: "#3b82f6", sub: "Last 30 days" },
          { label: "Leave Utilization", value: `${leaves.filter(l => l.status === "approved").length}`, icon: "calendar", color: "#f59e0b", sub: "Approved leaves" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}><Icon name={s.icon} size={22} color={s.color} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="section-title mb-4">Attendance by Department</div>
          <BarChart data={deptData} height={180} />
        </div>
        <div className="card">
          <div className="section-title mb-4">6-Month Attendance Trend</div>
          <LineChart data={monthlyTrend} height={140} color="#6366f1" />
          <div className="flex justify-between mt-2" style={{ marginTop: 8 }}>
            {monthlyTrend.map((m, i) => (
              <div key={i} style={{ fontSize: 11, color: "var(--text3)", textAlign: "center" }}>{m.label}<br /><span style={{ color: "var(--text)", fontWeight: 600 }}>{m.value}%</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title mb-4">Late Arrivals by Department</div>
          <BarChart data={lateByDept} height={140} />
        </div>
        <div className="card">
          <div className="section-title mb-4">Top Performers</div>
          {topPerformers.map((emp, i) => (
            <div key={i} className="flex items-center gap-3" style={{ padding: "8px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 24, textAlign: "center", fontFamily: "Syne", fontWeight: 700, color: ["#f59e0b","#9aa0b4","#cd7f32","var(--text3)","var(--text3)"][i] }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </div>
              <div className="avatar" style={{ background: getAvatarColor(emp.name), width: 32, height: 32, fontSize: 11 }}>{emp.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{emp.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{emp.department}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", fontFamily: "Syne" }}>{emp.rate}%</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{emp.recs} days</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// PAYROLL
const PayrollPage = ({ employees, attendance, addToast }) => {
  const empOnly = employees.filter(e => e.role === ROLES.EMPLOYEE && e.status === "active");
  const [month] = useState(new Date().toLocaleString("en-US", { month: "long", year: "numeric" }));

  const calcPayroll = (emp) => {
    const recs = attendance.filter(a => a.userId === emp.id && a.clockIn && a.clockOut);
    const hours = recs.reduce((s, a) => {
      const [ih, im] = a.clockIn.split(":").map(Number);
      const [oh, om] = a.clockOut.split(":").map(Number);
      return s + ((oh * 60 + om) - (ih * 60 + im)) / 60;
    }, 0);
    const dailyRate = (emp.salary || 60000) / 260;
    const gross = Math.round(dailyRate * recs.length);
    const tax = Math.round(gross * 0.22);
    const net = gross - tax;
    return { hours: Math.round(hours), days: recs.length, gross, tax, net };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="section-title" style={{ fontSize: 20 }}>Payroll Overview</div>
          <div className="section-sub">{month}</div>
        </div>
        <button className="btn btn-primary" onClick={() => addToast("Payroll report generated", "success")}><Icon name="download" size={16} /> Export Payroll</button>
      </div>

      <div className="grid-4 mb-4">
        {(() => {
          const total = empOnly.reduce((s, e) => s + (calcPayroll(e).gross), 0);
          return [
            { label: "Total Payroll", value: `$${(total / 1000).toFixed(0)}K`, color: "#6366f1" },
            { label: "Net Disbursed", value: `$${(total * 0.78 / 1000).toFixed(0)}K`, color: "#10b981" },
            { label: "Tax Deducted", value: `$${(total * 0.22 / 1000).toFixed(0)}K`, color: "#ef4444" },
            { label: "Employees Paid", value: empOnly.length, color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 28, fontFamily: "Syne", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{s.label}</div>
            </div>
          ));
        })()}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Department</th><th>Days Worked</th><th>Hours</th><th>Gross Pay</th><th>Tax (22%)</th><th>Net Pay</th><th>Status</th></tr></thead>
            <tbody>
              {empOnly.map((emp, i) => {
                const p = calcPayroll(emp);
                return (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ background: getAvatarColor(emp.name), width: 28, height: 28, fontSize: 10 }}>{emp.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>{emp.position}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-purple">{emp.department}</span></td>
                    <td style={{ textAlign: "center", fontWeight: 600, color: "var(--text)" }}>{p.days}</td>
                    <td style={{ textAlign: "center", color: "var(--text2)" }}>{p.hours}h</td>
                    <td style={{ fontWeight: 700, color: "var(--text)", fontFamily: "Syne" }}>${p.gross.toLocaleString()}</td>
                    <td style={{ color: "var(--red)" }}>-${p.tax.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: "var(--green)", fontFamily: "Syne" }}>${p.net.toLocaleString()}</td>
                    <td><span className="badge badge-green">Processed</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// DEPARTMENTS
const DepartmentsPage = ({ employees, attendance }) => {
  const deptStats = DEPARTMENTS.map(dept => {
    const emps = employees.filter(e => e.department === dept && e.role === ROLES.EMPLOYEE);
    const todayAtt = attendance.filter(a => a.date === today() && emps.some(e => e.id === a.userId));
    const avgSalary = emps.reduce((s, e) => s + (e.salary || 0), 0) / (emps.length || 1);
    return { name: dept, count: emps.length, present: todayAtt.length, avgSalary: Math.round(avgSalary), employees: emps };
  });

  const colors = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#06b6d4", "#a855f7", "#84cc16"];

  return (
    <div>
      <div className="section-title mb-2" style={{ fontSize: 20 }}>Departments</div>
      <div className="section-sub mb-6">{DEPARTMENTS.length} departments across the organization</div>
      <div className="grid-auto">
        {deptStats.map((dept, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${colors[i % colors.length]}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="building" size={22} color={colors[i % colors.length]} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{dept.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{dept.count} employees</div>
              </div>
            </div>
            <div className="grid-2" style={{ gap: 8, marginBottom: 12 }}>
              <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>Present Today</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", fontFamily: "Syne" }}>{dept.present}/{dept.count}</div>
              </div>
              <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>Avg. Salary</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors[i % colors.length], fontFamily: "Syne" }}>${(dept.avgSalary / 1000).toFixed(0)}K</div>
              </div>
            </div>
            <div className="progress">
              <div className="progress-fill" style={{ width: dept.count ? `${(dept.present / dept.count) * 100}%` : "0%", background: colors[i % colors.length] }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
              {dept.count ? Math.round((dept.present / dept.count) * 100) : 0}% attendance today
            </div>
            <div className="flex" style={{ marginTop: 12, gap: 4, flexWrap: "wrap" }}>
              {dept.employees.slice(0, 5).map(emp => (
                <div key={emp.id} className="avatar" style={{ background: getAvatarColor(emp.name), width: 24, height: 24, fontSize: 9 }} title={emp.name}>{emp.avatar}</div>
              ))}
              {dept.employees.length > 5 && <div style={{ width: 24, height: 24, borderRadius: 8, background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--text3)" }}>+{dept.employees.length - 5}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SECURITY / AUDIT LOG
const SecurityPage = ({ auditLogs, addToast }) => {
  const allLogs = [
    ...auditLogs,
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 10, user: MOCK_USERS[Math.floor(Math.random() * 2)].name,
      action: ["Exported report", "Updated geofence settings", "Reset employee password", "Approved leave", "Viewed attendance record"][Math.floor(Math.random() * 5)],
      target: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)].name,
      timestamp: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      ip: `192.168.1.${Math.floor(Math.random() * 254 + 1)}`
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div>
      <div className="section-title mb-2" style={{ fontSize: 20 }}>Security & Audit Logs</div>
      <div className="section-sub mb-6">Track all admin actions and system events</div>

      <div className="grid-3 mb-4">
        {[
          { label: "Total Audit Logs", value: allLogs.length, color: "#6366f1", icon: "shield" },
          { label: "Geofence Violations", value: 3, color: "#ef4444", icon: "mapPin" },
          { label: "Failed Logins", value: 7, color: "#f59e0b", icon: "x" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}><Icon name={s.icon} size={22} color={s.color} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="section-title mb-4">Geofence Configuration</div>
        <div className="grid-2">
          <div>
            <MapView lat={OFFICE_CENTER.lat} lng={OFFICE_CENTER.lng} showOffice={true} />
          </div>
          <div>
            <div className="form-group"><label className="form-label">Office Latitude</label><input className="form-input" defaultValue={OFFICE_CENTER.lat} /></div>
            <div className="form-group"><label className="form-label">Office Longitude</label><input className="form-input" defaultValue={OFFICE_CENTER.lng} /></div>
            <div className="form-group"><label className="form-label">Radius (meters)</label><input className="form-input" type="number" defaultValue={OFFICE_CENTER.radius} /></div>
            <button className="btn btn-primary" onClick={() => addToast("Geofence settings saved", "success")}><Icon name="check" size={16} /> Save Settings</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title mb-4">Audit Trail</div>
        <div className="timeline">
          {allLogs.map((log, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot" style={{ background: ["#6366f1", "#10b981", "#f59e0b", "#3b82f6"][i % 4] }} />
              <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "10px 14px" }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{log.action}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{formatDateTime(log.timestamp)}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                  By <span style={{ color: "var(--accent2)" }}>{log.user}</span> → <span style={{ color: "var(--text2)" }}>{log.target}</span> · {log.ip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SETTINGS PAGE
const SettingsPage = ({ currentUser, employees, setEmployees, addToast }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({ ...currentUser });
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });

  const handleSave = () => {
    setEmployees(prev => prev.map(e => e.id === currentUser.id ? { ...e, ...form } : e));
    addToast("Profile updated successfully", "success");
  };

  const handlePwChange = () => {
    if (pwForm.new !== pwForm.confirm) { addToast("Passwords don't match", "error"); return; }
    if (pwForm.current !== currentUser.password) { addToast("Current password incorrect", "error"); return; }
    addToast("Password changed successfully", "success");
    setPwForm({ current: "", new: "", confirm: "" });
  };

  return (
    <div>
      <div className="section-title mb-2" style={{ fontSize: 20 }}>Settings</div>
      <div className="section-sub mb-6">Manage your account and preferences</div>
      <div className="tabs">
        {["profile", "security", "notifications"].map(t => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar avatar-xl" style={{ background: getAvatarColor(currentUser.name) }}>{currentUser.avatar}</div>
            <div>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20, color: "var(--text)" }}>{currentUser.name}</div>
              <div style={{ color: "var(--text3)", fontSize: 14 }}>{currentUser.role} · {currentUser.department}</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => addToast("Photo upload coming soon", "info")}>Change Photo</button>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email || ""} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone || ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department || ""} readOnly /></div>
          </div>
          <button className="btn btn-primary" onClick={handleSave}><Icon name="check" size={16} /> Save Changes</button>
        </div>
      )}
      {activeTab === "security" && (
        <div className="card" style={{ maxWidth: 400 }}>
          <div className="section-title mb-4">Change Password</div>
          <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={pwForm.new} onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-input" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} /></div>
          <button className="btn btn-primary" onClick={handlePwChange}><Icon name="shield" size={16} /> Update Password</button>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="section-title mb-4">Notification Preferences</div>
          {[
            { label: "Clock-in Confirmation", desc: "Get notified when you clock in", on: true },
            { label: "Late Arrival Alerts", desc: "Receive alerts for late check-ins", on: true },
            { label: "Leave Approval Updates", desc: "Get updates on leave request status", on: true },
            { label: "Weekly Reports", desc: "Receive weekly attendance summary", on: false },
            { label: "Payroll Notifications", desc: "Get notified when payroll is processed", on: true },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: "12px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{n.label}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{n.desc}</div>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: n.on ? "var(--accent)" : "var(--bg4)", cursor: "pointer", position: "relative", transition: "background 0.2s" }} onClick={() => addToast("Notification preference saved", "info")}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: n.on ? 21 : 3, transition: "left 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [employees, setEmployees] = useState(MOCK_USERS);
  const [attendance, setAttendance] = useState(generateAttendance);
  const [leaves, setLeaves] = useState(generateLeaves);
  const [notifications, setNotifications] = useState(generateNotifications);
  const [auditLogs] = useState(generateAuditLogs);
  const [toasts, setToasts] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const handleLogin = (u, tok) => { setUser(u); setToken(tok); setPage("dashboard"); };
  const handleLogout = () => { setUser(null); setToken(null); setPage("dashboard"); };

  const unreadNotifs = notifications.filter(n => !n.read).length;

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = user.role === ROLES.ADMIN;
  const isHR = user.role === ROLES.HR;
  const isEmployee = user.role === ROLES.EMPLOYEE;

  const navSections = [
    {
      label: "Main", items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "attendance", label: isEmployee ? "My Attendance" : "Attendance", icon: "clock" },
      ]
    },
    {
      label: "People", items: [
        ...(isAdmin || isHR ? [{ id: "employees", label: "Employees", icon: "users" }] : []),
        ...(isAdmin || isHR ? [{ id: "departments", label: "Departments", icon: "building" }] : []),
        { id: "leaves", label: "Leave Management", icon: "calendar" },
      ]
    },
    {
      label: "Reports", items: [
        ...(isAdmin || isHR ? [{ id: "analytics", label: "Analytics", icon: "chart" }] : []),
        ...(isAdmin || isHR ? [{ id: "payroll", label: "Payroll", icon: "dollar" }] : []),
      ]
    },
    {
      label: "System", items: [
        ...(isAdmin ? [{ id: "security", label: "Security & Logs", icon: "shield" }] : []),
        { id: "settings", label: "Settings", icon: "settings" },
      ]
    }
  ];

  const pageComponents = {
    dashboard: <Dashboard user={user} attendance={attendance} employees={employees} leaves={leaves} addToast={addToast} />,
    attendance: isEmployee
      ? <AttendanceClock user={user} attendance={attendance} setAttendance={setAttendance} addToast={addToast} />
      : <AttendanceAdmin attendance={attendance} employees={employees} addToast={addToast} />,
    employees: <EmployeesPage employees={employees} setEmployees={setEmployees} attendance={attendance} addToast={addToast} currentUser={user} />,
    departments: <DepartmentsPage employees={employees} attendance={attendance} />,
    leaves: <LeavePage leaves={leaves} setLeaves={setLeaves} employees={employees} currentUser={user} addToast={addToast} />,
    analytics: <AnalyticsPage attendance={attendance} employees={employees} leaves={leaves} />,
    payroll: <PayrollPage employees={employees} attendance={attendance} addToast={addToast} />,
    security: <SecurityPage auditLogs={auditLogs} addToast={addToast} />,
    settings: <SettingsPage currentUser={user} employees={employees} setEmployees={setEmployees} addToast={addToast} />,
  };

  const pageTitles = {
    dashboard: "Dashboard", attendance: isEmployee ? "My Attendance" : "Attendance Records",
    employees: "Employees", departments: "Departments", leaves: "Leave Management",
    analytics: "Analytics & Reports", payroll: "Payroll", security: "Security & Audit", settings: "Settings"
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Sidebar */}
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-icon">LA</div>
            {!collapsed && <div className="logo-text">LeanAixs<span> HR</span></div>}
          </div>

          <nav className="sidebar-nav">
            {navSections.map((section, si) => (
              section.items.length > 0 && (
                <div key={si} className="nav-section">
                  {!collapsed && <div className="nav-label">{section.label}</div>}
                  {section.items.map(item => (
                    <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)} title={collapsed ? item.label : ""}>
                      <div className="nav-icon"><Icon name={item.icon} size={18} /></div>
                      {!collapsed && <span>{item.label}</span>}
                      {item.badge && !collapsed && <span className="nav-badge">{item.badge}</span>}
                    </div>
                  ))}
                </div>
              )
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="user-card" onClick={() => setPage("settings")}>
              <div className="avatar" style={{ background: getAvatarColor(user.name) }}>{user.avatar}</div>
              {!collapsed && (
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <button className="btn-ghost btn" onClick={() => setCollapsed(!collapsed)}>
              <Icon name="menu" size={20} />
            </button>
            <div>
              <div className="topbar-title">{pageTitles[page]}</div>
            </div>
            <div style={{ flex: 1 }} />

            {/* Today date */}
            <div style={{ fontSize: 13, color: "var(--text3)", background: "var(--bg3)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button className="btn-ghost btn" style={{ position: "relative" }} onClick={() => setShowNotif(!showNotif)}>
                <Icon name="bell" size={20} />
                {unreadNotifs > 0 && (
                  <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, background: "var(--red)", borderRadius: "50%", fontSize: 9, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg2)" }}>
                    {unreadNotifs}
                  </div>
                )}
              </button>
              {showNotif && (
                <div className="notif-panel">
                  <div className="flex items-center justify-between mb-3">
                    <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>Notifications</div>
                    <button style={{ fontSize: 11, color: "var(--accent2)", background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
                      Mark all read
                    </button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`} onClick={() => { setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x)); setShowNotif(false); }}>
                      <div className="notif-dot" style={{ background: n.type === "success" ? "var(--green)" : n.type === "warning" ? "var(--yellow)" : "var(--blue)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User */}
            <div className="avatar" style={{ background: getAvatarColor(user.name), cursor: "pointer" }} onClick={() => setPage("settings")} title={user.name}>{user.avatar}</div>
            <button className="btn-ghost btn" onClick={handleLogout} title="Logout">
              <Icon name="logout" size={18} />
            </button>
          </div>

          <div className="content" onClick={() => showNotif && setShowNotif(false)}>
            {pageComponents[page] || <div className="empty-state"><div className="empty-icon">🚧</div><div className="empty-text">Page not found</div></div>}
          </div>
        </div>
      </div>

      <ToastContext toasts={toasts} removeToast={removeToast} />
    </>
  );
}
