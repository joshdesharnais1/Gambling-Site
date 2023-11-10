const express = require('express');
const session = require('express-session');
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const app = express();
const port = 3000;
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.db', // Replace with your desired database file path
  });
  const sessionStore = new SequelizeStore({
    db: sequelize,
    expiration: 3600000, // Session expiration time (1 hour)
    genid: () => {
      // Generate a unique session ID here, for example using a UUID library
      return uuidv4(); // You may need to install the 'uuid' library
    },
  });
  app.use(
    session({
      secret: secret,
      resave: false,
      saveUninitialized: true,
      store: sessionStore,
      cookie: {
        sameSite: 'Lax',
      },
    })
  );
  
  
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
const bcrypt = require('bcrypt');

// Registration route
app.post('/register', async(req, res) => {
    const {
        username,
        password
    } = req.body;

    // Check if the username or password is missing
    if (!username || !password) {
        return res.status(400).json({
            error: 'Both username and password are required.'
        });
    }

    // Check if the username already exists in the database
    db.get('SELECT * FROM users WHERE username = ?', [username], async(err, row) => {
        if (err) {
            console.error('Error during registration:', err);
            res.status(500).json({
                error: 'Database error'
            });
            return;
        }

        if (row) {
            // Username already exists
            return res.status(409).json({
                error: 'Username already in use'
            });
        } else {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user into the database
            db.run('INSERT INTO users (username, password, account_balance) VALUES (?, ?, ?)', [username, hashedPassword, 0], (err) => {
                if (err) {
                    console.error('Error during registration:', err);
                    res.status(500).json({
                        error: 'Failed to register user'
                    });
                } else {
                    // Registration successful
                    res.json({
                        message: 'Registration successful'
                    });
                }
            });
        }
    });
});
// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Fetch user data from the database
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
  
      if (!row) {
        console.log('Invalid username during login:', username);
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }
  
      // Check the hashed password
      const passwordMatch = await bcrypt.compare(password, row.password);
  
      if (passwordMatch) {
        console.log('Login successful:', username);
  
        // Set session data here after successful login
        req.session.user = {
          username: username,
          // You can add more user data if needed
        };
  
        // Continue with your response
        // Fetch user data from the database
        db.get('SELECT username, account_balance FROM users WHERE username = ?', [username], (err, user) => {
          if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ error: 'Failed to fetch user data' });
          }
          // Send the user data as a response
          res.json({
            message: 'Login successful',
            user,
          });
        });
      } else {
        console.log('Invalid password during login:', username);
        res.status(401).json({ error: 'Invalid username or password' });
      }
    });
  });  
//Log out route
app.get('/logout', (req, res) => {
    // Destroy the user's session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
  
      // Redirect to the index page or another desired destination
      res.redirect('/index.html');
    });
  });  
  app.get('/user-info', async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.username) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        const username = req.session.user.username;

        // Query the database to fetch user data based on the username
        db.get('SELECT username, account_balance, total_sweepstakes_entered FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                console.error('Error fetching user data:', err);
                return res.status(500).json({
                    error: 'Failed to fetch user data'
                });
            }
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            res.json(user);
        });
    } catch (err) {
        console.error('Error during user info retrieval:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
// Add a route to handle adding balance
app.post('/add-balance', async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.username) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }
        const {
            username,
            amount
        } = req.body;

        if (!username || !amount) {
            return res.status(400).json({
                error: 'Both username and amount are required.'
            });
        }

        // Query the database to fetch the user's current balance
        db.get('SELECT account_balance FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error('Error fetching user data:', err);
                return res.status(500).json({
                    error: 'Failed to fetch user data'
                });
            }
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            const currentBalance = user.account_balance;
            const updatedBalance = currentBalance + amount;

            // Update the user's balance in the database
            db.run('UPDATE users SET account_balance = ? WHERE username = ?', [updatedBalance, username], (err) => {
                if (err) {
                    console.error('Error updating user balance:', err);
                    return res.status(500).json({
                        error: 'Failed to update user balance'
                    });
                }

                // Send the updated balance as a response
                res.json({
                    message: 'Balance added successfully',
                    updatedBalance
                });
            });
        });
    } catch (err) {
        console.error('Error during add balance:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
app.post('/participate-sweepstakes', async (req, res) => {
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    const {
        username,
        amount
    } = req.body;

    if (!amount) {
        return res.status(400).json({
            error: 'Amount is required.'
        });
    }

    // Query the database to fetch the user's current balance and total_sweepstakes_entered
    db.get('SELECT account_balance, total_sweepstakes_entered FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({
                error: 'Failed to fetch user data'
            });
        }
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const currentBalance = user.account_balance;

        // Check if the user has enough balance to participate in sweepstakes
        if (currentBalance < amount) {
            return res.status(400).json({
                error: 'Insufficient balance to participate in sweepstakes.'
            });
        }

        const updatedBalance = currentBalance - amount;
        const updatedTotalSweepstakes = user.total_sweepstakes_entered + amount;

        // Update the user's balance and total sweepstakes entries in the database
        db.run('UPDATE users SET account_balance = ?, total_sweepstakes_entered = ? WHERE username = ?', [updatedBalance, updatedTotalSweepstakes, username], (err) => {
            if (err) {
                console.error('Error updating user balance:', err);
                return res.status(500).json({
                    error: 'Failed to update user balance'
                });
            } else {
                console.log('User balance and total sweepstakes updated successfully');
                res.json({
                    message: 'Participated in sweepstakes successfully',
                    updatedBalance,
                    updatedTotalSweepstakes
                });
            }
        });
    });
});
app.post('/admin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: 'Both username and password are required.'
        });
    }

    // Fetch user data from the database
    db.get('SELECT * FROM users WHERE username = ? AND isadmin = 1', [username], async (err, row) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({
                error: 'Database error'
            });
            return;
        }
        if (!row) {
            console.log('Invalid username during login:', username);
            res.status(401).json({
                error: 'Invalid username or password'
            });
            return;
        }

        // Check the hashed password
        const passwordMatch = await bcrypt.compare(password, row.password);
        if (passwordMatch) {
            console.log('Login successful:', username);
            // Fetch user data from the database
            db.get('SELECT username, account_balance FROM users WHERE username = ?', [username], (err, user) => {
                if (err) {
                    console.error('Error fetching user data:', err);
                    return res.status(500).json({
                        error: 'Failed to fetch user data'
                    });
                }
                // Send the user data as a response
                res.json({
                    message: 'Login successful',
                    user
                });
            });
            req.session.user = {
                username: username,
                // You can add more user data if needed
              };
        } else {
            console.log('Invalid password during login:', username);
            res.status(401).json({
                error: 'Invalid username or password'
            });
        }
    });
});
app.get('/getRandomUsername', async (req, res) => {
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    try {
        // Step 1: Fetch usernames with total_sweepstakes_entered > 0
        db.all('SELECT username, total_sweepstakes_entered FROM users WHERE total_sweepstakes_entered > 0', async (err, users) => {
            if (err) {
                console.log('Error during username retrieval:', err);
                return res.status(500).json({
                    error: 'Database error'
                });
            }

            if (users.length === 0) {
                console.log('No eligible users found');
                return res.status(404).json({
                    error: 'No eligible users found'
                });
            }

            const usernamesArray = [];

            // Step 2: Calculate the total entries
            let totalEntries = 0;
            users.forEach((user) => {
                totalEntries += user.total_sweepstakes_entered;
                for (let i = 0; i < user.total_sweepstakes_entered; i++) {
                    usernamesArray.push(user.username);
                }
            });

            // Step 3: Randomly select a username
            const randomUsername = usernamesArray[Math.floor(Math.random() * usernamesArray.length)];

            // Step 4: Update total_sweepstakes_entered values
            db.run('UPDATE users SET total_sweepstakes_entered = 0 WHERE total_sweepstakes_entered > 0', (err) => {
                if (err) {
                    console.log('Error zeroing out total_sweepstakes_entered:', err);
                    return res.status(500).json({
                        error: 'Database error'
                    });
                }
            });

            // Step 5: Add the totalEntries to the random user's account balance
            db.run('UPDATE users SET account_balance = account_balance + ? WHERE username = ?', [totalEntries, randomUsername], (err) => {
                if (err) {
                    console.log('Error updating balance:', err);
                    return res.status(500).json({
                        error: 'Database error'
                    });
                }

                console.log('Random user updated successfully');
                res.json({
                    randomUsername
                });
            });
        });
    } catch (err) {
        console.error('Error during random username retrieval:', err);
        res.status(500).json({
            error: 'Database error'
        });
    }
});
app.post('/resetSweepstakes', async(req, res) => {
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    try {
        // Run an SQL query to update the "total_sweepstakes_entered" column to 0 for all records.
        db.run('UPDATE users SET total_sweepstakes_entered = 0', (err) => {
            if (err) {
                console.error('Error resetting sweepstakes:', err);
                return res.status(500).json({
                    error: 'Failed to reset sweepstakes'
                });
            } else {
                console.log('Sweepstakes reset successfully');
                res.json({
                    message: 'Sweepstakes reset successfully'
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Server error'
        });
    }
});
app.post('/addSweepstakesBalanceToAccount', async(req, res) => {
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    const {
        randomUsername
    } = req.body;

    // Fetch the sum of total_sweepstakes_entered for all users
    db.get('SELECT SUM(total_sweepstakes_entered) AS totalSweepstakes FROM users', async(err, sumRow) => {
        if (err) {
            console.log('Error during total_sweepstakes_entered sum:', err);
            return res.status(500).json({
                error: 'Database error'
            });
        }

        const totalSweepstakes = sumRow.totalSweepstakes || 0; // Sum of total_sweepstakes_entered

        // Now, add the totalSweepstakes to the random user's account balance
        db.get('SELECT account_balance FROM users WHERE username = ?', [randomUsername], async(err, user) => {
            if (err) {
                console.error('Error fetching user data:', err);
                return res.status(500).json({
                    error: 'Failed to fetch user data'
                });
            }

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            const currentBalance = user.account_balance;

            // Add totalSweepstakes to the balance
            const updatedBalance = currentBalance + totalSweepstakes;

            // Update the user's account balance in the database
            db.run('UPDATE users SET account_balance = ? WHERE username = ?', [updatedBalance, randomUsername], (err) => {
                if (err) {
                    console.error('Error updating user balance:', err);
                    return res.status(500).json({
                        error: 'Failed to update user balance'
                    });
                }

                // Now, update the total_sweepstakes_entered value for all users except the random user
                db.run('UPDATE users SET total_sweepstakes_entered = CASE WHEN username = ? THEN 0 ELSE total_sweepstakes_entered END', [randomUsername], (err) => {
                    if (err) {
                        console.log('Error updating total_sweepstakes_entered:', err);
                        return res.status(500).json({
                            error: 'Database error'
                        });
                    }

                    console.log('Balance and total sweepstakes entered updated successfully');
                    res.json({
                        message: 'Balance and total sweepstakes entered updated successfully',
                        updatedBalance,
                        randomUsername
                    });
                });
            });
        });
    });
});
app.post('/zeroAccountBalances', async(req, res) => {
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    // Zero out the account balance for all users
    db.run('UPDATE users SET account_balance = 0', (err) => {
        if (err) {
            console.error('Error zeroing out account balances:', err);
            return res.status(500).json({
                error: 'Database error'
            });
        }

        console.log('Account balances zeroed out successfully');
        res.json({
            message: 'Account balances zeroed out successfully'
        });
    });
});
//Get Sweepstakes Route
app.get('/get-sweepstakes-values', (req, res) => {
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    // Check if the user is authenticated by verifying the session
      db.get('SELECT SUM(total_sweepstakes_entered) AS total FROM users', [], (err, row) => {
        if (err) {
          console.error('Error fetching total sweepstakes values:', err);
          return res.status(500).json({
            error: 'Failed to fetch total sweepstakes values'
          });
        }
  
        const totalSweepstakesValue = row.total || 0;
  
        // Return the sum as a JSON response
        res.json({
          total_sweepstakes_entered: totalSweepstakesValue
        });
      });
  });
  

