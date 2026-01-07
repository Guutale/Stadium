# Admin Login Fix - Setup Instructions

## Problem
Admin login was failing with **400 Bad Request - Invalid Credentials** because:
- Multiple admin creation scripts created admins in different databases
- The running server connects to a different database than where the admin was created
- Old admin accounts may have been soft-deleted (isDeleted = true)

## Solution

### Step 1: Run the Admin Creation Script

Open a terminal in the `server` folder and run:

```bash
node create_guutale_admin.js
```

This script will:
- ✅ Connect to the correct database (from your .env file)
- ✅ Delete ALL existing admin accounts
- ✅ Delete any old admin emails (a@gmail.com, admin@gmail.com, guutale@gmail.com)
- ✅ Create a fresh new admin account

### Step 2: New Admin Credentials

After running the script, use these credentials to login:

```
Email:    guutale@gmail.com
Password: 123456
Role:     admin
```

### Step 3: Restart Backend Server

**IMPORTANT:** You must restart your backend server for the changes to take effect.

1. Stop the current backend server (Ctrl+C)
2. Start it again:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

### Step 4: Login

Now you can login with:
- **Email:** guutale@gmail.com
- **Password:** 123456

## Verification

The script automatically verifies that the admin was created successfully. You should see output like:

```
✅ NEW ADMIN CREATED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    guutale@gmail.com
🔑 Password: 123456
👤 Role:     admin
🗄️  Database: mongodb://127.0.0.1:27017/authdb
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Verification: Admin account exists in database
```

## Troubleshooting

If login still fails after following these steps:

1. **Check database connection:** Make sure your server is connecting to the same database shown in the script output
2. **Check .env file:** Verify `MONGO_URI=mongodb://127.0.0.1:27017/authdb`
3. **Clear browser cache:** Sometimes old tokens cause issues
4. **Check server logs:** Look for any authentication errors in the server console

## Database Information

Your current database URI (from .env): `mongodb://127.0.0.1:27017/authdb`

The admin account is created in this database.
