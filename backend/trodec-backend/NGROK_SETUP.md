# Ngrok Setup Guide — Trodec

This guide explains how to expose the Trodec backend to the internet using ngrok, enabling:
- Testing on other devices (phones, tablets, other laptops)
- Razorpay webhooks (requires public URL)
- Shiprocket webhooks (requires public URL)

---

## Architecture

```
Other Device / Razorpay / Shiprocket
         │
         ▼
  ngrok public URL  (e.g. https://xxxx.ngrok-free.dev)
         │
         ▼
  Backend  →  localhost:3001
         │
         ▼
  Frontend →  localhost:3000
```

---

## Step 1 — Install ngrok

```bash
brew install ngrok
```

Or download from https://ngrok.com/download

---

## Step 2 — Authenticate ngrok (one-time)

Sign up at https://ngrok.com and get your auth token, then run:

```bash
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

---

## Step 3 — Start Servers

**Terminal 1 — Backend:**
```bash
cd backend/trodec-backend
npm run dev
# Runs on port 3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend/trodec-frontend
npm run dev
# Runs on port 3000
```

**Terminal 3 — ngrok:**
```bash
ngrok http 3001
```

Copy the public URL shown, e.g.:
```
https://unenjoying-latarsha-unvasculous.ngrok-free.dev
```

---

## Step 4 — Update Frontend to Use ngrok URL

Edit `frontend/trodec-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://<YOUR_NGROK_URL>/api
```

Then restart the frontend:
```bash
# Stop the frontend (Ctrl+C), then:
npm run dev
```

> **Important:** The ngrok free plan gives a new URL every time you restart ngrok.
> You must update `.env.local` and restart the frontend each time.

---

## Step 5 — Access from Other Devices

Once the frontend is pointing to the ngrok URL, anyone can access:

| What | URL |
|------|-----|
| Frontend | `http://<your-mac-local-ip>:3000` |
| Backend (via ngrok) | `https://<ngrok-url>/api` |
| ngrok dashboard | `http://localhost:4040` |

Find your local IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# e.g. 192.168.1.5
```

Then open `http://192.168.1.5:3000` on any device on the same WiFi.

---

## Step 6 — Configure Webhooks

### Razorpay Webhook
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL:
   ```
   https://<YOUR_NGROK_URL>/api/webhook/razorpay
   ```
3. Select events: `payment.captured`, `payment.failed`
4. Set the webhook secret — must match `RAZORPAY_WEBHOOK_SECRET` in backend `.env`

### Shiprocket Webhook
1. Go to Shiprocket Dashboard → Settings → API → Webhook URL
2. Set:
   ```
   https://<YOUR_NGROK_URL>/api/webhook/shiprocket
   ```

---

## Step 7 — Verify Everything is Working

```bash
# Check ngrok tunnel is active
curl http://localhost:4040/api/tunnels

# Test backend health via ngrok
curl https://<YOUR_NGROK_URL>/api/health

# Test backend locally
curl http://localhost:3001/api/health
```

---

## Restarting After a Session

Every time you restart ngrok (new URL), do this:

1. Copy the new ngrok URL from the terminal
2. Update `frontend/trodec-frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://<NEW_NGROK_URL>/api
   ```
3. Restart frontend (`Ctrl+C` → `npm run dev`)
4. Update Razorpay webhook URL in dashboard
5. Update Shiprocket webhook URL in dashboard

---

## Tip — Fixed ngrok URL (paid plan)

On the ngrok free plan, the URL changes every restart. To get a fixed URL:
- Upgrade to ngrok paid plan
- Or use a custom domain in ngrok settings

This avoids having to update `.env.local` and webhook URLs every time.

---

## Current ngrok URL

Check the active tunnel at any time:
```bash
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; d=json.load(sys.stdin); [print(t['public_url']) for t in d['tunnels']]"
```
