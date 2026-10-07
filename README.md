# ChatWave

ChatWave is a real-time chat MVP using the existing ChatWave interface, Node.js, Express, Socket.IO, PostgreSQL, bcrypt, and JWT cookies.

## Local setup

Requirements: Node.js 20+ and PostgreSQL.

```bash
cp .env.example .env
npm install
npm start
```

Set `DATABASE_URL` and `JWT_SECRET` in `.env`, then open `http://localhost:8787`.

## Test checklist

1. Open two browser windows or private tabs.
2. Sign up as two different users, for example `maya` and `alex`.
3. From the `+` button, enter the other user's username.
4. Send messages from both windows and confirm they appear without refreshing.
5. Type in one window and confirm the other shows `is typing…`.
6. Leave the chat open in the recipient window and confirm the sender changes from `✓` to `✓✓` when delivered and read.
7. Close one window, send a message from the other, reopen the first window, and confirm history loads.
8. Create a group with `group:Weekend Crew,maya,alex` and test messages from all members.
9. Open the sidebar and verify the latest message and unread count update.

## Security notes

- Passwords use bcrypt and sessions use an httpOnly JWT cookie.
- REST and Socket.IO access require authenticated conversation membership.
- SQL uses parameterized queries and message text is escaped in the browser.
- Messages are described honestly as encrypted in transit over HTTPS/WSS. End-to-end encryption is not implemented.
- Calls, vault data, token balances, and relay metrics are placeholders and are not presented as live security features.
