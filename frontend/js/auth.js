const API_URL = '/api';

// Utility: Check if user is logged in
function getCurrentUser() {
  const userStr = localStorage.getItem('kinetic_user');
  return userStr ? JSON.parse(userStr) : null;
}

// Global Auth UI Controller
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const greetingEl = document.getElementById('user-greeting');
  const authBtn = document.getElementById('auth-btn');
  const adminLink = document.getElementById('admin-link');

  if (greetingEl && authBtn) {
    if (user && user.name) {
      greetingEl.innerHTML = `Signed in as <span class="brand-orange-text">${user.name}</span>`;
      authBtn.innerText = 'Logout';
      if (user.role === 'admin' && adminLink) {
        adminLink.style.display = 'inline-flex';
      }
    } else {
      greetingEl.innerText = 'Guest';
      authBtn.innerText = 'Sign In';
      if (adminLink) {
        adminLink.style.display = 'none';
      }
    }
  } else {
    const navLinks = document.getElementById('nav-links');
    if (navLinks && user) {
      let adminBtn = user.role === 'admin' ? '<a href="dashboard.html" style="color:#ff5500;">Admin Dashboard</a>' : '';
      navLinks.innerHTML = `
        ${adminBtn}
        <span style="color:#a3a3a3;">Hi, ${user.name}</span>
        <button onclick="logout()" class="btn-orange">Logout</button>
      `;
    }
  }
});

// Logout Helper
function logout() {
  localStorage.removeItem('kinetic_token');
  localStorage.removeItem('kinetic_user');
  window.location.href = 'signin.html';
}

// Handle Sign In
async function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error-msg');

  try {
    const res = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.innerText = data.message;
      errorEl.style.display = 'block';

      // Redirect if account is not found
      if (res.status === 404) {
        setTimeout(() => {
          window.location.href = 'signup.html';
        }, 1500);
      }
      return;
    }

    localStorage.setItem('kinetic_token', data.token);
    localStorage.setItem('kinetic_user', JSON.stringify(data.user));

    if (data.user.role === 'admin') {
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
  } catch (err) {
    errorEl.innerText = 'Server error. Please ensure backend is running.';
    errorEl.style.display = 'block';
  }
}

// Handle Sign Up
async function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error-msg');

  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.innerText = data.message;
      errorEl.style.display = 'block';
      return;
    }

    alert('Registration successful! Redirecting to login...');
    window.location.href = 'signin.html';
  } catch (err) {
    errorEl.innerText = 'Server error. Please ensure backend is running.';
    errorEl.style.display = 'block';
  }
}