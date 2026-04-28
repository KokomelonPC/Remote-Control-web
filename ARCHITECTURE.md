# Remote Control Project Notes

## Recommendation

For a real customer-facing product, use:

- `Frontend`: responsive web app first
- `Backend`: authentication, user-device ownership, command routing
- `Database`: primary source of truth
- `MQTT`: command and status messaging with ESP32
- `Google Sheet`: optional whitelist for factory-registered device serials

## Google Sheet Or Something Else?

`Google Sheet` is acceptable for the first validation stage if you want a quick admin-friendly registry.

Use it for:

- registered serial numbers
- device activation secrets
- manufacturing notes
- initial allowed status

Do not use it as the full production database for:

- user accounts
- access control
- command logs
- device ownership history
- live status

Recommended production alternative:

- `Supabase`

Why:

- built-in Postgres database
- authentication included
- REST and realtime support
- easier to scale than a sheet

Best compromise:

- keep `Google Sheet` as a whitelist source for authorized device IDs
- keep `Supabase` as the main app database

## Suggested Tables

### `users`

- `id`
- `email`
- `display_name`
- `created_at`

### `devices`

- `id`
- `serial_number`
- `device_secret`
- `model`
- `status`
- `last_seen_at`
- `relay_state`
- `device_ip`
- `device_http_token`

## Google Sheet Columns For Your Current Plan

Based on your current sheet, keep these columns:

- `no`
- `device_id`
- `device_secret`
- `model`
- `status`
- `assigned_to`

Recommended to add:

- `device_name`
- `device_ip`
- `http_token`
- `last_seen`
- `relay_state`
- `registered_at`

Suggested meaning:

- `status`: `available`, `assigned`, `blocked`
- `assigned_to`: user email or user id
- `http_token`: shared token used by backend when talking to ESP32 over HTTP

### `user_devices`

- `id`
- `user_id`
- `device_id`
- `nickname`
- `created_at`

### `device_logs`

- `id`
- `device_id`
- `command`
- `result`
- `created_at`

## Suggested API Flow

1. User logs in.
2. User submits serial number and device secret.
3. Backend checks:
   - serial exists in Google Sheet or whitelist source
   - serial is not already claimed by another user
   - secret matches
4. Backend stores the ownership in the database.
5. Dashboard displays the device.
6. When user taps ON or OFF:
   - frontend sends request to backend
   - backend sends HTTP command first for your prototype
   - later you can swap to MQTT

## HTTP Prototype Commands

For ESP32 on local network:

- `POST http://<device-ip>/api/on`
- `POST http://<device-ip>/api/off`
- `POST http://<device-ip>/api/toggle`
- `GET http://<device-ip>/api/status`
- `GET http://<device-ip>/api/info`

## What Else Is Needed

- backend project
- database schema
- Google Sheet access service account or API key strategy
- MQTT broker
- device authentication format
- deployment target

## Good Next Step

Build the backend first, then connect this UI to real APIs.
