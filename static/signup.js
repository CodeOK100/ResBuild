// Signup Page JavaScript for Flask Resume Builder

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form-box');
  const nameInput = document.querySelector('input[name="name"]');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const confirmPasswordInput = document.querySelector('input[name="confirm_password"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  // Create elements for showing messages and password strength
  const messageDiv = createMessageDiv();
  const passwordStrengthDiv = createPasswordStrengthDiv();
  
  form.insertBefore(messageDiv, form.firstChild);
  passwordInput.parentNode.insertBefore(passwordStrengthDiv, passwordInput.nextSibling);
  
  // Real-time validation for all fields
  nameInput.addEventListener('input', function() {
      validateName(this);
  });
  
  emailInput.addEventListener('input', function() {
      validateEmail(this);
  });
  
  passwordInput.addEventListener('input', function() {
      validatePassword(this);
      updatePasswordStrength(this.value);
      // Re-validate confirm password if it has content
      if (confirmPasswordInput.value) {
          validateConfirmPassword(confirmPasswordInput);
      }
  });
  
  confirmPasswordInput.addEventListener('input', function() {
      validateConfirmPassword(this);
  });
  
  // Check email availability on blur
  emailInput.addEventListener('blur', function() {
      if (validateEmail(this)) {
          checkEmailAvailability(this.value.trim());
      }
  });
  
  // Enhanced form submission with AJAX
  form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate entire form before submission
      if (!validateForm()) {
          showMessage('Please fix the errors below before submitting.', 'error');
          return;
      }
      
      // Show loading state
      setLoadingState(true);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('name', nameInput.value.trim());
      formData.append('email', emailInput.value.trim());
      formData.append('password', passwordInput.value);
      formData.append('confirm_password', confirmPasswordInput.value);
      
      // AJAX request to Flask backend
      fetch('/signup', {
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
              showMessage('Account created successfully! Redirecting to login...', 'success');
              // Clear form
              form.reset();
              // Redirect to login page
              setTimeout(() => {
                  window.location.href = data.redirect_url || '/login';
              }, 2000);
          } else {
              showMessage(data.message || 'Signup failed. Please try again.', 'error');
              // Handle specific field errors
              if (data.errors) {
                  handleFieldErrors(data.errors);
              }
          }
      })
      .catch(error => {
          setLoadingState(false);
          console.error('Signup error:', error);
          showMessage('Network error. Please check your connection and try again.', 'error');
      });
  });
  
  // Validation functions
  function validateName(input) {
      const name = input.value.trim();
      const isValid = name.length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
      
      if (name === '') {
          removeValidationFeedback(input);
      } else if (isValid) {
          showValidationFeedback(input, true);
      } else {
          showValidationFeedback(input, false, 'Name must be at least 2 characters and contain only letters');
      }
      
      return isValid;
  }
  
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
      const password = input.value;
      const strength = getPasswordStrength(password);
      const isValid = password.length >= 8 && strength.score >= 3;
      
      if (password === '') {
          removeValidationFeedback(input);
      } else if (isValid) {
          showValidationFeedback(input, true);
      } else {
          const message = password.length < 8 ? 
              'Password must be at least 8 characters' : 
              'Password is too weak. Add numbers, symbols, or mix case.';
          showValidationFeedback(input, false, message);
      }
      
      return isValid;
  }
  
  function validateConfirmPassword(input) {
      const isValid = input.value === passwordInput.value && input.value !== '';
      
      if (input.value === '') {
          removeValidationFeedback(input);
      } else if (isValid) {
          showValidationFeedback(input, true);
      } else {
          showValidationFeedback(input, false, 'Passwords do not match');
      }
      
      return isValid;
  }
  
  function validateForm() {
      const nameValid = validateName(nameInput);
      const emailValid = validateEmail(emailInput);
      const passwordValid = validatePassword(passwordInput);
      const confirmPasswordValid = validateConfirmPassword(confirmPasswordInput);
      
      // Check for empty fields
      if (!nameInput.value.trim()) {
          showValidationFeedback(nameInput, false, 'Full name is required');
      }
      if (!emailInput.value.trim()) {
          showValidationFeedback(emailInput, false, 'Email is required');
      }
      if (!passwordInput.value) {
          showValidationFeedback(passwordInput, false, 'Password is required');
      }
      if (!confirmPasswordInput.value) {
          showValidationFeedback(confirmPasswordInput, false, 'Please confirm your password');
      }
      
      return nameValid && emailValid && passwordValid && confirmPasswordValid &&
             nameInput.value.trim() && emailInput.value.trim() && 
             passwordInput.value && confirmPasswordInput.value;
  }
  
  // Password strength checker
  function getPasswordStrength(password) {
      let score = 0;
      let feedback = [];
      
      if (password.length >= 8) score++;
      else feedback.push('at least 8 characters');
      
      if (/[a-z]/.test(password)) score++;
      else feedback.push('lowercase letters');
      
      if (/[A-Z]/.test(password)) score++;
      else feedback.push('uppercase letters');
      
      if (/[0-9]/.test(password)) score++;
      else feedback.push('numbers');
      
      if (/[^A-Za-z0-9]/.test(password)) score++;
      else feedback.push('special characters');
      
      const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
      const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#007bff'];
      
      return {
          score: score,
          strength: strength,
          color: colors[score],
          feedback: feedback
      };
  }
  
  function updatePasswordStrength(password) {
      if (password === '') {
          passwordStrengthDiv.style.display = 'none';
          return;
      }
      
      const strength = getPasswordStrength(password);
      passwordStrengthDiv.style.display = 'block';
      
      const progressBar = passwordStrengthDiv.querySelector('.strength-bar');
      const strengthText = passwordStrengthDiv.querySelector('.strength-text');
      
      progressBar.style.width = `${(strength.score / 5) * 100}%`;
      progressBar.style.backgroundColor = strength.color;
      strengthText.textContent = `Password Strength: ${strength.strength}`;
      strengthText.style.color = strength.color;
  }
  
  // Email availability checker
  function checkEmailAvailability(email) {
      fetch('/api/check-email', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ email: email })
      })
      .then(response => response.json())
      .then(data => {
          if (!data.available) {
              showValidationFeedback(emailInput, false, 'This email is already registered');
          }
      })
      .catch(error => {
          console.log('Email check failed:', error);
          // Silently fail - don't show error to user
      });
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
  
  function createPasswordStrengthDiv() {
      const div = document.createElement('div');
      div.className = 'password-strength';
      div.style.cssText = `
          margin-top: 5px;
          display: none;
      `;
      
      div.innerHTML = `
          <div class="strength-bar-container" style="
              width: 100%;
              height: 4px;
              background-color: #e9ecef;
              border-radius: 2px;
              margin-bottom: 5px;
          ">
              <div class="strength-bar" style="
                  height: 100%;
                  border-radius: 2px;
                  transition: all 0.3s ease;
                  width: 0%;
              "></div>
          </div>
          <div class="strength-text" style="
              font-size: 12px;
              text-align: left;
          "></div>
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
      removeValidationFeedback(input);
      
      input.style.borderColor = isValid ? '#28a745' : '#dc3545';
      
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
          submitButton.textContent = 'Creating Account...';
          submitButton.style.backgroundColor = '#95a5a6';
      } else {
          submitButton.disabled = false;
          submitButton.textContent = 'Sign Up';
          submitButton.style.backgroundColor = '#3498db';
      }
  }
  
  function handleFieldErrors(errors) {
      Object.keys(errors).forEach(field => {
          const input = document.querySelector(`input[name="${field}"]`);
          if (input) {
              showValidationFeedback(input, false, errors[field]);
          }
      });
  }
  
  // Enhanced user experience features
  
  // Smart field navigation with Tab/Enter
  document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
          const inputs = [nameInput, emailInput, passwordInput, confirmPasswordInput];
          const currentIndex = inputs.indexOf(document.activeElement);
          
          if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
              e.preventDefault();
              inputs[currentIndex + 1].focus();
          }
      }
      
      if (e.key === 'Escape') {
          messageDiv.style.display = 'none';
      }
  });
  
  // Clear error messages when user starts typing
  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
      input.addEventListener('input', function() {
          if (messageDiv.style.display === 'block') {
              messageDiv.style.display = 'none';
          }
      });
  });
  
  // Auto-focus first field
  nameInput.focus();
  
  // Form reset functionality
  function resetForm() {
      form.reset();
      [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
          removeValidationFeedback(input);
      });
      passwordStrengthDiv.style.display = 'none';
      messageDiv.style.display = 'none';
  }
  
  // Expose reset function globally if needed
  window.resetSignupForm = resetForm;
});