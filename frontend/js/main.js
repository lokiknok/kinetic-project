/**
 * Kinetic Main JavaScript Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initPageUI();
});

// UI Initialization Helper
function initPageUI() {
  highlightActiveNavLink();
}

// Automatically highlight active page in Navbar
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.style.color = '#ff5500';
    }
  });
}

// Utility: Format Date nicely for display
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Display success/info notification banners
function showNotification(message, type = 'info') {
  const existingNotice = document.getElementById('kinetic-notice');
  if (existingNotice) existingNotice.remove();

  const notice = document.createElement('div');
  notice.id = 'kinetic-notice';
  notice.style.position = 'fixed';
  notice.style.bottom = '20px';
  notice.style.right = '20px';
  notice.style.padding = '0.8rem 1.5rem';
  notice.style.borderRadius = '6px';
  notice.style.fontSize = '0.9rem';
  notice.style.fontWeight = '600';
  notice.style.zIndex = '1000';
  notice.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';

  if (type === 'error') {
    notice.style.background = '#ef4444';
    notice.style.color = '#ffffff';
  } else if (type === 'success') {
    notice.style.background = '#22c55e';
    notice.style.color = '#ffffff';
  } else {
    notice.style.background = '#ff5500';
    notice.style.color = '#ffffff';
  }

  notice.innerText = message;
  document.body.appendChild(notice);

  setTimeout(() => {
    notice.remove();
  }, 4000);
}
