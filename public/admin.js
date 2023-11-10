document.addEventListener('DOMContentLoaded', function () {
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
    });

    
      document.addEventListener('DOMContentLoaded', () => {
        const resetSweepstakesButton = document.getElementById('reset-sweepstakes-button');
      
        resetSweepstakesButton.addEventListener('click', async () => {
          try {
            const response = await fetch('/resetSweepstakes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
      
            if (response.ok) {
              console.log('Sweepstakes reset successfully');
              // You can display a success message to the user if needed.
            } else {
              console.error('Failed to reset sweepstakes');
              // Handle the case where resetting sweepstakes failed.
            }
          } catch (error) {
            console.error('Error:', error);
          }
        });
      });
      
      document.getElementById('add-sweepstakes-balance').addEventListener('click', async () => {
        try {
            const response = await fetch('/getRandomUsername', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
    
            if (response.ok) {
                const result = await response.json();
                const randomUsername = result.randomUsername;
    
                // Now that you have the randomUsername, you can call the /addSweepstakesBalanceToAccount route.
                // Pass the randomUsername to this route.
                const addSweepstakesResponse = await fetch('/addSweepstakesBalanceToAccount', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ randomUsername }),
                });
    
                if (addSweepstakesResponse.ok) {
                    const addSweepstakesResult = await addSweepstakesResponse.json();
                    const updatedBalance = addSweepstakesResult.updatedBalance;
                    const sumSweepstakesButton = document.getElementById('SweepStakes-Winner');
                    sumSweepstakesButton.innerText = randomUsername;

                } else {
                    // Handle the case where adding sweepstakes balance fails
                    console.error('Failed to add sweepstakes balance');
                }
            } else {
                // Handle the case where no random username was found
                console.error('No random username found');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    document.getElementById('zero-account-balances').addEventListener('click', async () => {
      try {
          const response = await fetch('/zeroAccountBalances', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              credentials: 'include',
          });
  
          if (response.ok) {
              const result = await response.json();
              console.log('Account balances zeroed out successfully');
              // You can update the UI or display a success message here
          } else {
              console.error('Failed to zero account balances');
              // Handle the case where the request fails
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
  
  