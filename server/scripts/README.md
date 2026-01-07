# Authentication Scripts

This directory contains diagnostic and utility scripts to help manage and troubleshoot the authentication system.

## Available Scripts

### 1. diagnose_auth.js
**Purpose**: Comprehensive authentication diagnostic tool

**Usage**:
```bash
node scripts/diagnose_auth.js
```

**What it does**:
- Connects to MongoDB and lists all users
- Checks each user's password hash format
- Verifies bcrypt hash validity
- Identifies users with corrupted or invalid password hashes
- Checks environment configuration (JWT_SECRET, etc.)
- Provides recommendations for fixing issues

**When to use**:
- When users report "Invalid Credentials" errors
- After server restarts or system changes
- To verify all users have valid password hashes
- To check system configuration

---

### 2. fix_user_passwords.js
**Purpose**: Interactive tool to repair user accounts with invalid password hashes

**Usage**:
```bash
node scripts/fix_user_passwords.js
```

**What it does**:
- Scans for users with invalid or corrupted password hashes
- Offers two fix options:
  1. Reset passwords to a temporary password (recommended)
  2. Re-hash existing passwords (if they're stored as plain-text)
- Safely updates user accounts

**When to use**:
- After running diagnose_auth.js and finding users with password issues
- When migrating from an old system
- To recover from manual database edits

**⚠️ IMPORTANT**: Always backup your database before running this script!

---

### 3. generate_jwt_secret.js
**Purpose**: Generate a cryptographically secure JWT secret

**Usage**:
```bash
node scripts/generate_jwt_secret.js
```

**What it does**:
- Generates a random 128-character hex string
- Displays the value for copying to .env file

**When to use**:
- Initial setup
- When rotating JWT secrets for security
- When moving to production

---

## Troubleshooting Authentication Issues

### Issue: "Invalid Credentials" after server restart

**Step 1**: Run diagnostic script
```bash
node scripts/diagnose_auth.js
```

**Step 2**: Check the output
- If all users show "✅ Valid bcrypt format" and "✅ Hash is valid", the issue is NOT with password hashing
- If any users show "🚨 ISSUE", proceed to Step 3

**Step 3**: Fix identified issues
```bash
node scripts/fix_user_passwords.js
```
Choose option 1 (reset to temporary password) and set a temporary password.

**Step 4**: Test login
Try logging in with the email and temporary password.

**Step 5**: Have users update passwords
Users should change their passwords after logging in successfully.

---

### Issue: Some users can login, others cannot

This suggests **data inconsistency** - some users have properly hashed passwords while others don't.

**Solution**:
1. Run `node scripts/diagnose_auth.js` to identify affected users
2. Run `node scripts/fix_user_passwords.js` to repair them
3. Notify affected users to use the temporary password

---

### Issue: JWT tokens expire or become invalid

Check your `.env` file:
- Ensure `JWT_SECRET` is set to a strong, random value (not the default)
- Ensure `JWT_SECRET` doesn't change between server restarts
- If you change `JWT_SECRET`, all existing tokens become invalid (users must re-login)

---

## Enhanced Security Features

The authentication system now includes:

### 1. Automatic Password Hashing
The User model includes a pre-save hook that automatically hashes passwords. This means:
- You never need to manually hash passwords in your code
- Passwords are always stored securely
- Prevents accidental plain-text password storage

### 2. Email Normalization
All emails are automatically:
- Converted to lowercase
- Trimmed of whitespace
- This prevents "user@EXAMPLE.com" and "user@example.com" being treated as different users

### 3. Enhanced Logging
Login and registration attempts are logged with:
- Timestamp
- Email attempting to login
- Success/failure reason
- This helps diagnose authentication issues quickly

### 4. Connection Resilience
The server now:
- Waits for database connection before accepting requests
- Handles disconnections gracefully
- Attempts to reconnect automatically
- Logs all connection events

---

## Best Practices

1. **Always backup database** before running fix scripts
2. **Use strong JWT secrets** in production (at least 64 random characters)
3. **Never commit .env file** to version control
4. **Rotate JWT secrets periodically** for security
5. **Monitor server logs** for authentication failures
6. **Run diagnostic script** after system updates or migrations

---

## Getting Help

If you're still experiencing authentication issues after following these steps:

1. Check server logs for error messages
2. Verify MongoDB is running and accessible
3. Ensure .env file is being loaded correctly
4. Check that all environment variables are set
5. Verify network connectivity to database

For persistent issues, review the implementation_plan.md in the artifacts directory for detailed system architecture.
