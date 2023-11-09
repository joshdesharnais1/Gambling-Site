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

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
  
    // Prepare the data to be sent in the request body
    const data = {
      username: username,
      password: password,
    };
  
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        // Registration successful, handle the response
        const result = await response.json();
        console.log(result);
        // Redirect to the registration success page
        window.location.href = '/registration-success.html'; // Replace with the correct path
      } else {
        // Handle registration error
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
