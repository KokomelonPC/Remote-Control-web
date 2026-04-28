# Google Sheet Setup

I could not edit your Google Sheet directly from this workspace, so use this layout in the sheet.

## Required Columns

- `no`
- `device_id`
- `device_secret`
- `model`
- `status`
- `assigned_to`

## Recommended Extra Columns

- `device_name`
- `device_ip`
- `http_token`
- `relay_state`
- `last_seen`
- `registered_at`

## Example Row

| no | device_id | device_secret | model | status | assigned_to | device_name | device_ip | http_token | relay_state | last_seen | registered_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ESP32-0001 | alpha-001 | relay-1ch | available |  | Gate Relay | 192.168.1.35 | token-esp32-001 | OFF | 2026-04-28 10:00 | 2026-04-28 |

## Current Meanings

- `available`: device can still be added by a user
- `assigned`: device already belongs to a user
- `blocked`: do not allow activation

## For The HTTP Prototype

Use:

- `device_id` and `device_secret` for Add Device validation
- `device_ip` for sending commands to the ESP32
- `http_token` for simple device authentication later
