// Toggle option buttons in configurator
function toggleOption(btn) {
  const stepGroup = btn.closest('.step-group');
  const allGroups = document.querySelectorAll('.step-group');

  if (stepGroup === allGroups[0]) {
    stepGroup.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
  } else {
    btn.classList.toggle('active');
  }

  updateDeliverablesCount();
}

// Update requested deliverables count
function updateDeliverablesCount() {
  const allGroups = document.querySelectorAll('.step-group');
  if (allGroups.length < 2) return;

  const activeFeatures = allGroups[1].querySelectorAll('.pill.active').length;
  const countDisplay = document.getElementById('selected-count');

  if (countDisplay) {
    countDisplay.innerText = `${activeFeatures} Key Module${activeFeatures !== 1 ? 's' : ''} Selected`;
  }
}

// Submit custom proposal with logged-in JWT Token & contact details
async function submitProposal() {
  const token = localStorage.getItem('kinetic_token') || localStorage.getItem('token');

  if (!token) {
    alert('Please sign in or create an account to submit a proposal.');
    window.location.href = 'signin.html';
    return;
  }

  const allGroups = document.querySelectorAll('.step-group');
  if (allGroups.length < 2) return;

  const objectiveEl = allGroups[0].querySelector('.pill.active');
  const featureEls = allGroups[1].querySelectorAll('.pill.active');

  const objective = objectiveEl ? objectiveEl.innerText.trim() : '';
  const features = Array.from(featureEls).map(f => f.innerText.trim());

  // Retrieve input fields for contact details
  const nameInput = document.getElementById('client-name');
  const phoneInput = document.getElementById('client-phone');

  const clientName = nameInput ? nameInput.value.trim() : '';
  const clientPhone = phoneInput ? phoneInput.value.trim() : '';

  if (!objective || features.length === 0) {
    alert('Please select a primary objective and at least one core feature.');
    return;
  }

  if (!clientName || !clientPhone) {
    alert('Please fill in your Name and Phone Number.');
    return;
  }

  // Retrieve existing user info from local storage as fallback
  const storedUser = JSON.parse(localStorage.getItem('kinetic_user') || '{}');

  try {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        objective: objective, 
        features: features,
        name: clientName,
        phone: clientPhone,
        email: storedUser.email || 'N/A'
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert(data.message || 'Proposal submitted successfully!');
      
      // Reset text input fields
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';

      // Reset option selections and deliverable counters
      document.querySelectorAll('.pill.active').forEach(p => p.classList.remove('active'));
      updateDeliverablesCount();
    } else if (res.status === 401 || res.status === 403) {
      alert('Your session has expired. Please sign in again.');
      localStorage.removeItem('kinetic_token');
      localStorage.removeItem('kinetic_user');
      window.location.href = 'signin.html';
    } else {
      alert(data.message || 'Could not submit proposal.');
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('Server error. Could not submit proposal.');
  }
}