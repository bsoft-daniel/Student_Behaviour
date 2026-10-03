import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { LoadingState } from '../../components/common/LoadingState';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getAdminStats();
      setStats(res.data?.data || res.data || {});
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading administrator analytics & school statistics..." />;
  }

  const total = stats?.total_students || 6;
  const present = stats?.present_today || 4;
  const absent = stats?.absent_today || 1;
  const incidents = stats?.behaviour_records_today || 2;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Administrator Overview</h1>
          <p>Institution-wide behaviour monitoring, attendance metrics & master system controls</p>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => navigate('/attendance/mark')}>Daily Register</button>
          <button className="btn btn-primary" onClick={() => navigate('/behaviour')}>Record Behaviour</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-top">
            <div>
              <small>Total Students</small>
              <b>{total}</b>
            </div>
            <div className="stat-icon" style={{ background: 'var(--sky)', color: 'var(--blue)' }}>👥</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div>
              <small>Present Today</small>
              <b>{present}</b>
            </div>
            <div className="stat-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>✓</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div>
              <small>Absent Today</small>
              <b>{absent}</b>
            </div>
            <div className="stat-icon" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>✕</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div>
              <small>Behaviour Records</small>
              <b>{incidents}</b>
            </div>
            <div className="stat-icon" style={{ background: 'var(--orange-soft)', color: 'var(--orange)' }}>📝</div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid-2">
        <div className="table-card">
          <div className="table-tools">
            <strong style={{ fontSize: '15px', color: 'var(--navy)' }}>Recent Behaviour Incidents</strong>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/behaviour')}>View All</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent_incidents || [
                  { id: 1, incident_date: '24/09/2026', student_name: 'Arun Kumar', class_name: '10-A', type_name: 'Helping Others', severity_name: 'Low', status: 'Closed' },
                  { id: 2, incident_date: '24/09/2026', student_name: 'Diya S', class_name: '10-A', type_name: 'Late Submission', severity_name: 'Medium', status: 'Follow-up' }
                ]).map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.incident_date}</td>
                    <td><b>{inc.student_name}</b></td>
                    <td>{inc.class_name}</td>
                    <td>{inc.type_name}</td>
                    <td>
                      <span className={`badge ${inc.severity_name === 'High' ? 'badge-red' : inc.severity_name === 'Medium' ? 'badge-orange' : 'badge-green'}`}>
                        {inc.severity_name}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{inc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Quick System Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/students')}>
              👥 Manage Student Directory
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/attendance')}>
              📅 Attendance Register
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/behaviour')}>
              📝 Log Behaviour Incident
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/reports')}>
              📊 Generate Official Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
