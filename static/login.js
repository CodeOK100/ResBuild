// Login Page JavaScript for Flask Resume Builder

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form-box');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  // Create elements for showing messages
  const messageDiv = createMessageDiv();
  form.insertBefore(messageDiv, form.firstChild);
  
  // Real-time email validation
  emailInput.addEventListener('input', function() {
      validateEmail(this);
  });
  
  // Real-time password validation
  passwordInput.addEventListener('input', function() {
      validatePassword(this);
  });
  
  // Enhanced form submission with AJAX
  form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate form before submission
      if (!validateForm()) {
          return;
      }
      
      // Show loading state
      setLoadingState(true);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('email', emailInput.value.trim());
      formData.append('password', passwordInput.value);
      
      // AJAX request to Flask backend
      fetch('/login', {
          method: 'POST',
          body: formData,
          headers: {
              'X-Requested-With': 'XMLHttpRequest'
          }
      })
      .then(response => response.json())
      .then(data => {
          setLoadingState(false);
          
          if (data.success) {
              showMessage('Login successful! Redirecting...', 'success');
              // Redirect to dashboard or home page
              setTimeout(() => {
                  window.location.href = data.redirect_url || '/dashboard';
              }, 1000);
          } else {
              showMessage(data.message || 'Login failed. Please try again.', 'error');
              // Clear password field on error
              passwordInput.value = '';
              passwordInput.focus();
          }
      })
      .catch(error => {
          setLoadingState(false);
          console.error('Login error:', error);
          showMessage('Network error. Please check your connection and try again.', 'error');
      });
  });
  
  // Form validation functions
  function validateEmail(input) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(input.value.trim());
      
      if (input.value.trim() === '') {
          removeValidationFeedback(input);
      } else if (isValid) {
          showValidationFeedback(input, true);
      } else {
          showValidationFeedback(input, false, 'Please enter a valid email address');
      }
      
      return isValid;
  }
  
  function validatePassword(input) {
      const isValid = input.value.length >= 6;
      
      if (input.value === '') {
          removeValidationFeedback(input);
      } else if (isValid) {
          showValidationFeedback(input, true);
      } else {
          showValidationFeedback(input, false, 'Password must be at least 6 characters');
      }
      
      return isValid;
  }
  
  function validateForm() {
      const emailValid = validateEmail(emailInput);
      const passwordValid = validatePassword(passwordInput);
      
      if (!emailInput.value.trim()) {
          showValidationFeedback(emailInput, false, 'Email is required');
      }
      
      if (!passwordInput.value) {
          showValidationFeedback(passwordInput, false, 'Password is required');
      }
      
      return emailValid && passwordValid && emailInput.value.trim() && passwordInput.value;
  }
  
  // UI Helper functions
  function createMessageDiv() {
      const div = document.createElement('div');
      div.className = 'message-div';
      div.style.cssText = `
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          font-size: 14px;
          display: none;
      `;
      return div;
  }
  
  function showMessage(message, type) {
      const colors = {
          success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
          error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
          info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
      };
      
      const style = colors[type] || colors.info;
      messageDiv.style.backgroundColor = style.bg;
      messageDiv.style.color = style.color;
      messageDiv.style.border = `1px solid ${style.border}`;
      messageDiv.textContent = message;
      messageDiv.style.display = 'block';
      
      // Auto-hide success messages
      if (type === 'success') {
          setTimeout(() => {
              messageDiv.style.display = 'none';
          }, 3000);
      }
  }
  
  function showValidationFeedback(input, isValid, message = '') {
      // Remove existing feedback
      removeValidationFeedback(input);
      
      // Set border color
      input.style.borderColor = isValid ? '#28a745' : '#dc3545';
      
      // Add feedback message for errors
      if (!isValid && message) {
          const feedback = document.createElement('div');
          feedback.className = 'validation-feedback';
          feedback.textContent = message;
          feedback.style.cssText = `
              color: #dc3545;
              font-size: 12px;
              margin-top: 5px;
              text-align: left;
          `;
          input.parentNode.insertBefore(feedback, input.nextSibling);
      }
  }
  
  function removeValidationFeedback(input) {
      input.style.borderColor = '#ccc';
      const feedback = input.parentNode.querySelector('.validation-feedback');
      if (feedback) {
          feedback.remove();
      }
  }
  
  function setLoadingState(loading) {
      if (loading) {
          submitButton.disabled = true;
          submitButton.textContent = 'Logging in...';
          submitButton.style.backgroundColor = '#95a5a6';
      } else {
          submitButton.disabled = false;
          submitButton.textContent = 'Login';
          submitButton.style.backgroundColor = '#3498db';
      }
  }
  
  // Enhanced user experience features
  
  // Remember email (optional)
  const savedEmail = localStorage.getItem('resumeBuilderEmail');
  if (savedEmail) {
      emailInput.value = savedEmail;
      passwordInput.focus();
  }
  
  // Save email on successful validation
  emailInput.addEventListener('blur', function() {
      if (validateEmail(this)) {
          localStorage.setItem('resumeBuilderEmail', this.value.trim());
      }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
      // Enter key focuses next field or submits
      if (e.key === 'Enter') {
          if (document.activeElement === emailInput) {
              e.preventDefault();
              passwordInput.focus();
          }
      }
      
      // Escape key clears messages
      if (e.key === 'Escape') {
          messageDiv.style.display = 'none';
      }
  });
  
  // Clear error messages when user starts typing
  [emailInput, passwordInput].forEach(input => {
      input.addEventListener('input', function() {
          if (messageDiv.style.display === 'block') {
              messageDiv.style.display = 'none';
          }
      });
  });
  
  // Auto-focus first empty field
  if (!emailInput.value) {
      emailInput.focus();
  } else if (!passwordInput.value) {
      passwordInput.focus();
  }
});

// Utility function for other pages to check login status
function checkLoginStatus() {
  return fetch('/api/check-auth', { 
      method: 'GET',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
  .then(response => response.json())
  .then(data => data.authenticated)
  .catch(() => false);
}