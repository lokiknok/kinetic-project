const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
  protectAdminRoute();
  loadUsers();
});

// Verify token and admin role before loading page content
function protectAdminRoute() {
  const token = localStorage.getItem('kinetic_token');
  const user = JSON.parse(localStorage.getItem('kinetic_user') || '{}');

  if (!token || user.role !== 'admin') {
    alert('Session expired or unauthorized.');
    window.location.href = 'signin.html';
  }
}

// Fetch user list from backend
async function loadUsers() {
  const token = localStorage.getItem('kinetic_token');
  const tableBody = document.getElementById('users-table-body');

  try {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Session expired or unauthorized.');
      localStorage.removeItem('kinetic_token');
      localStorage.removeItem('kinetic_user');
      window.location.href = 'signin.html';
      return;
    }

    if (tableBody && data.users) {
      tableBody.innerHTML = data.users.map(u => `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            ${u.role !== 'admin' ? `<button onclick="deleteUser('${u.id}')" style="color:red;">Delete</button>` : 'N/A'}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load admin users:', err);
  }
}

// Delete user functionality
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  const token = localStorage.getItem('kinetic_token');

  try {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) loadUsers();
  } catch (err) {
    alert('Failed to delete user.');
  }
}