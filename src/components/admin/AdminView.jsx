import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ChevronLeft, 
  BarChart, 
  Activity, 
  Shield, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../supabase';

const AdminView = ({ onBack, usersCount, couplesCount, activeSessions, recentActivities }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('updated_at', { ascending: false });
    if (data) setUsers(data);
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#F8FAFB', minHeight: '100vh', width: '100%' }}>
      {/* Admin Header */}
      <div style={{ background: '#1E293B', padding: '25px 30px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '12px', color: 'white' }}>
             <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900 }}>ADMIN PORTAL</h1>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>Heart Sync System Management</p>
          </div>
          <div style={{ background: '#10B981', padding: '5px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900 }}>SYSTEM ONLINE</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #E2E8F0' }}>
         <button onClick={() => setActiveTab('dashboard')} style={{ flex: 1, padding: '18px', border: 'none', background: 'none', borderBottom: activeTab === 'dashboard' ? '3px solid #1E293B' : 'none', fontWeight: 900, color: activeTab === 'dashboard' ? '#1E293B' : '#64748B' }}>DASHBOARD</button>
         <button onClick={() => setActiveTab('users')} style={{ flex: 1, padding: '18px', border: 'none', borderBottom: activeTab === 'users' ? '3px solid #1E293B' : 'none', background: 'none', fontWeight: 900, color: activeTab === 'users' ? '#1E293B' : '#64748B' }}>USERS</button>
         <button onClick={() => setActiveTab('system')} style={{ flex: 1, padding: '18px', border: 'none', borderBottom: activeTab === 'system' ? '3px solid #1E293B' : 'none', background: 'none', fontWeight: 900, color: activeTab === 'system' ? '#1E293B' : '#64748B' }}>SYSTEM</button>
      </div>

      <div style={{ padding: '25px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                   <Users size={20} color="#1E293B" style={{ marginBottom: '10px' }} />
                   <div style={{ fontSize: '24px', fontWeight: 900 }}>{usersCount}</div>
                   <div style={{ fontSize: '12px', color: '#64748B' }}>Total Registered Users</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                   <BarChart size={20} color="#1E293B" style={{ marginBottom: '10px' }} />
                   <div style={{ fontSize: '24px', fontWeight: 900 }}>{couplesCount}</div>
                   <div style={{ fontSize: '12px', color: '#64748B' }}>Connected Couples</div>
                </div>
             </div>

             <div style={{ background: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>Real-time System Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {recentActivities.map((act, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                        <div style={{ flex: 1 }}>
                           <p style={{ fontSize: '13px', fontWeight: 800 }}>{act.user} - {act.action}</p>
                           <p style={{ fontSize: '11px', color: '#64748B' }}>{act.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'users' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ position: 'relative' }}>
                 <input placeholder="Search users by nickname or email..." style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '15px', border: '1px solid #E2E8F0', outline: 'none' }} />
                 <Search size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: '#CBD5E1' }} />
              </div>
              
              <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                 {isLoading ? (
                   <div style={{ padding: '40px', textAlign: 'center' }}>Loading users data...</div>
                 ) : (
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#F8FAFB', textAlign: 'left' }}>
                         <tr>
                            <th style={{ padding: '15px', fontSize: '11px', fontWeight: 900, color: '#64748B' }}>USER/ROLE</th>
                            <th style={{ padding: '15px', fontSize: '11px', fontWeight: 900, color: '#64748B' }}>COUPLE ID</th>
                            <th style={{ padding: '15px', fontSize: '11px', fontWeight: 900, color: '#64748B' }}>LAST ACTIVE</th>
                         </tr>
                      </thead>
                      <tbody>
                         {users.map((u, i) => (
                           <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '15px' }}>
                                 <p style={{ fontSize: '13px', fontWeight: 800 }}>{u.info?.nickname || 'Anonymous'}</p>
                                 <p style={{ fontSize: '10px', color: '#94A3B8' }}>{u.user_role}</p>
                              </td>
                              <td style={{ padding: '15px', fontSize: '12px', fontWeight: 700 }}>{u.couple_id}</td>
                              <td style={{ padding: '15px', fontSize: '11px', color: '#64748B' }}>{new Date(u.updated_at).toLocaleTimeString()}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'system' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Shield size={20} color="#1E293B" />
                    <h3 style={{ fontSize: '16px', fontWeight: 900 }}>Infrastructure Health</h3>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ fontSize: '13px', fontWeight: 700 }}>Supabase Real-time Engine</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981', fontWeight: 900, fontSize: '12px' }}>
                          <CheckCircle2 size={14} /> ACTIVE
                       </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ fontSize: '13px', fontWeight: 700 }}>OpenAI Hatti API</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981', fontWeight: 900, fontSize: '12px' }}>
                          <CheckCircle2 size={14} /> ACTIVE
                       </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ fontSize: '13px', fontWeight: 700 }}>Edge Cache CDN</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981', fontWeight: 900, fontSize: '12px' }}>
                          <CheckCircle2 size={14} /> ACTIVE
                       </div>
                    </div>
                 </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', gap: '15px' }}>
                 <AlertCircle size={24} color="#EF4444" />
                 <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#B91C1C' }}>System Critical Action</h4>
                    <p style={{ fontSize: '12px', color: '#EF4444', marginBottom: '10px' }}>Flush all application caches and force global session refresh.</p>
                    <button style={{ padding: '8px 15px', borderRadius: '8px', background: '#EF4444', color: 'white', border: 'none', fontWeight: 800, fontSize: '11px' }}>FLUSH CACHE</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminView;
