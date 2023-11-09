document.getElementById('admin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Prepare the data to be sent in the request body
    const data = {
      username: username,
      password: password,
    };
  
    try {
      const response = await fetch('/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        // Login successful, handle the response
        const result = await response.json();
        console.log(result);
        
        // Redirect to the admin page (or handle the success as needed)
        window.location.href = '/admin.html'; // Replace with the correct path
      } else {
        // Handle login error
        console.error('NOT ADMIN');
        const loginError = document.getElementById('login-error');
        loginError.textContent = 'You are not an admin'; // Set the error message
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
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
  