# Backend Logs

This directory contains log files from the backend server.

## Usage

To run the server with logging enabled:

```bash
npm run dev:log
```

Logs will be written to `backend.log` in this directory.

## Viewing Logs

- Open `backend.log` in any text editor
- Use `Ctrl+F` to search for specific terms
- Logs are appended, so you can keep the file open and watch it update

## Log File Location

- **File**: `backend/logs/backend.log`
- **Format**: All console output (stdout and stderr)

## Searching Logs

In PowerShell:
```powershell
Get-Content backend/logs/backend.log | Select-String "2-point"
Get-Content backend/logs/backend.log | Select-String "conversion"
Get-Content backend/logs/backend.log | Select-String "🎯"
```
