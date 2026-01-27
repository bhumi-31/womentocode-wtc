import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5001';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error('Unexpected data format:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Role update error:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      {/* Page Title */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">USERS</h1>
          <span className="count-tag">{users.length} TOTAL</span>
        </div>
        <div className="title-line"></div>
      </div>

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="SEARCH USERS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Users Table */}
      <div className="users-table">
        <div className="table-header">
          <span className="col-user">USER</span>
          <span className="col-email">EMAIL</span>
          <span className="col-role">ROLE</span>
          <span className="col-date">JOINED</span>
          <span className="col-action">ACTION</span>
        </div>

        <div className="table-body">
          {filteredUsers.map((user) => (
            <div key={user._id} className="table-row">
              <div className="col-user">
                <span className="user-initial">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
              </div>
              <span className="col-email">{user.email}</span>
              <span className="col-role">
                <span className={`role-tag ${user.role}`}>{user.role?.toUpperCase()}</span>
              </span>
              <span className="col-date">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <div className="col-action">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="role-select"
                >
                  <option value="viewer">VIEWER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>NO USERS FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
