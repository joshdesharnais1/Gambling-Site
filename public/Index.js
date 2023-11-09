document.addEventListener('DOMContentLoaded', function () {
  const menuIcon = document.querySelector('.menu-icon');
  const menuDropdown = document.querySelector('.menu-dropdown');

  menuIcon.addEventListener('click', function () {
    menuDropdown.classList.toggle('show');
  });

  document.addEventListener('click', function (event) {
    const isMenuIconClicked = menuIcon.contains(event.target);
    const isMenuDropdownClicked = menuDropdown.contains(event.target);

    if (!isMenuIconClicked && !isMenuDropdownClicked) {
      menuDropdown.classList.remove('show');
    }
  });
});
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  console.log('Submitting login form for user:', username);

  // Prepare the data to be sent in the request body
  const data = {
    username: username,
    password: password,
  };

  try {
    console.log('Sending login request to the server...');
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('Login successful! Handling the response...');
      // Login successful, handle the response
      const result = await response.json();
      console.log(result);
      // Store the username in session storage
      sessionStorage.setItem('username', username);
      window.location.href = '/profile.html'; // Replace with the correct path
    } else {
      // Handle login error
      const loginError = document.getElementById('login-error');
      loginError.textContent = 'Invalid Login Attempt'; // Set the error message
      console.error('Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
