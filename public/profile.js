const addBalanceButton = document.getElementById('add-balance');
const refreshBalanceButton = document.getElementById('refresh-balance');
const accountBalanceElement = document.getElementById('account-balance');
const userContainer = document.getElementById('user-info'); // Select the user info container
const participateButton = document.getElementById('participate-sweepstakes');
// Assuming you have a function to refresh total sweepstakes (similar to what you provided)
async function refreshTotalSweepstakes() {
    try {
        const response = await fetch(`/user-info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include credentials (cookies)
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('userData:', userData);
            console.log('total_sweepstakes_entered:', userData.total_sweepstakes_entered);
            const totalnumberoftickets = document.getElementById('Numberofentries');
            const totalnumberofentries = userData.total_sweepstakes_entered;
            totalnumberoftickets.innerText = totalnumberofentries / 1;
            const totalSweepstakesElement = document.getElementById('total-sweepstakes');
            totalSweepstakesElement.innerText = isNaN(userData.total_sweepstakes_entered) ? 'N/A' : `$${userData.total_sweepstakes_entered}`;
        } else {
            console.error('Error fetching user data:', response.status);
        }
    } catch (error) {
        console.error('Error during refreshTotalSweepstakes:', error);
    }
}
// Event listener for the "Refresh Sweepstakes" button
document.getElementById('refresh-balance').addEventListener('click', async () => {
    await refreshTotalSweepstakes();
});
// Event listener for the "Logout" button
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        // Make an AJAX request to the logout route
        const response = await fetch('/logout', { method: 'GET' });

        if (response.ok) {
            // Redirect to the login page after successful logout
            window.location.href = '/index.html'; // Change to your desired page
        } else {
            console.error('Failed to logout:', response.statusText);
            // Handle the error or display a message to the user
        }
    } catch (error) {
        console.error('Error during logout:', error);
        // Handle the error or display a message to the user
    }
});
// Define the refreshBalance function
async function refreshBalance() {
    // Retrieve the username from local storage
    const username = sessionStorage.getItem('username');

    if (!username) {
        console.error('Username not found in local storage.');
        return;
    }

    // Fetch the user's data from the server using the stored username
    const response = await fetch(`/user-info?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (response.ok) {
        const userData = await response.json();
        accountBalanceElement.innerText = `$${userData.account_balance}`;
    } else {
        console.error('Error fetching user data:', response.status);
    }
}
// Event listener for adding $1 to the balance
addBalanceButton.addEventListener('click', async () => {
    try {
        // Retrieve the username from local storage
        const username = sessionStorage.getItem('username');

        if (!username) {
            console.error('Username not found in local storage.');
            return;
        }

        // Make an API call to add $1 to the user's balance on the server
        const response = await fetch('/add-balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include credentials (cookies)
            body: JSON.stringify({
                username,
                amount: 1
            }), // Send the username and amount to add
        });

        if (response.ok) {
            console.log('Balance updated successfully');
            // You may want to refresh other data on the page if needed
            // e.g., refreshTotalSweepstakes();
        } else {
            console.error('Error adding balance:', response.status);
        }
    } catch (error) {
        console.error('Error during addBalanceButton click:', error);
    }
});
// Event listener for refreshing the balance
refreshBalanceButton.addEventListener('click', async () => {
    // Retrieve the username from local storage
    const username = sessionStorage.getItem('username');

    if (!username) {
        console.error('Username not found in local storage.');
        return;
    }

    // Fetch the user's data from the server using the stored username
    const response = await fetch(`/user-info?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        const userData = await response.json();
        accountBalanceElement.innerText = `$${userData.account_balance}`;
        refreshTotalSweepstakes();
    } else {
        console.error('Error fetching user data:', response.status);
    }
});
// Display the welcome message
const username = sessionStorage.getItem('username');
if (username) {
    const capitalizedUsername = username.toUpperCase();
    userContainer.innerText = `Welcome, ${capitalizedUsername}!`; // Show the welcome message with the username in capital letters
}
    // Event listener for participating in sweepstakes
    participateButton.addEventListener('click', async () => {
        try{
            const username = sessionStorage.getItem('username');

            if (!username) {
                 console.error('Username not found in local storage.');
                 return;
            }

        // Make an API call to participate in sweepstakes
        console.log(JSON.stringify({ username, amount: 1 }));
        const response = await fetch('/participate-sweepstakes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username,
                amount: 1
            }),
        });
        

           if (response.ok) {
              // Delay for 1 second (1000 milliseconds) before refreshing the balance and total sweepstakes
                setTimeout(() => {
                refreshBalance();
                refreshTotalSweepstakes();
                }, 1000);
            }     else {
                console.error('Error participating in sweepstakes:', response.status);
        }
    } catch (error) {
        console.error('Error Particpating in sweepstakes:', error);


    
    // ...
}});
  
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
      const sumSweepstakesButton = document.getElementById('sum-sweepstakes-button');
      const totalCountElement = document.getElementById('total-count');
  
      sumSweepstakesButton.addEventListener('click', async () => {
          const response = await fetch('/get-sweepstakes-values', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });
  
          if (response.ok) {
              try {
                  const totalSweepstakesData = await response.json();
                  console.log('Total Sweepstakes Data:', totalSweepstakesData);
  
                  const totalSweepstakesValue = totalSweepstakesData.total_sweepstakes_entered;
  
                  totalCountElement.innerText = isNaN(totalSweepstakesValue) ? 'N/A' : `$${totalSweepstakesValue}`;
              } catch (error) {
                  console.error('Error parsing total sweepstakes data:', error);
              }
          } else {
              console.error('Error fetching total sweepstakes data:', response.status);
          }
      });
          // JavaScript code to handle logout
          document.getElementById('logoutButton').addEventListener('click', async () => {
            try {
              // Make an AJAX request to the logout route
              const response = await fetch('/logout', { method: 'GET' });
      
              if (response.ok) {
                // Redirect to the login page after successful logout
                window.location.href = 'index.html';
              } else {
                console.error('Failed to logout:', response.statusText);
                // Handle the error or display a message to the user
              }
            } catch (error) {
              console.error('Error during logout:', error);
              // Handle the error or display a message to the user
            }
          });
      