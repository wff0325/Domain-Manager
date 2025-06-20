[中文 (Chinese)](./README.md)

---
![alt text](https://github.com/user-attachments/assets/d7509dd3-5254-4af0-ad68-f8cbfdd0bcd9)
<div align="center">
# Domains-Manager
</div>


A domain management system built on Cloudflare Pages, designed to help you easily manage and monitor the status, expiration dates, and other information for your domains.
## Features
- Domain Management: Add, edit, delete, import, and export domain information.
- Status Monitoring: Automatically checks the online status of domains.
- Expiration Reminders: Set reminder periods for domain expiration.
- Multi-Registrar Support: Supports recording information for multiple domain registrars.
- Telegram Notifications: Supports sending expiration reminders via Telegram.
- Responsive Design: Accessible on both mobile and desktop devices.
- Secure Authentication: Access control based on username and password.
## Batch Import Instructions
The system supports batch importing of domain data via a JSON file. The import format is as follows:
```json
[
  {
    "domain": "example.com",
    "registrar": "Cloudflare",
    "registrar_link": "https://dash.cloudflare.com",
    "registrar_date": "2023-01-01",
    "expiry_date": "2024-01-01",
    "service_type": "Website",
    "memo": "Main site"
  },
  {
    "domain": "example.org",
    "registrar": "Namecheap",
    "registrar_link": "https://www.namecheap.com",
    "registrar_date": "2023-02-15",
    "expiry_date": "2024-02-15",
    "service_type": "API Service",
    "memo": "API documentation site"
  }
]
```
### Import Field Descriptions

- `domain`: The domain name (required)
- `registrar`: The name of the registrar
- `registrar_link`: The management link for the registrar
- `registrar_date`: Registration date, format YYYY-MM-DD
- `expiry_date`: Expiration date, format YYYY-MM-DD
- `service_type`: The type of service
- `memo`: Additional notes or memo
During import, the system will automatically validate the data format and provide detailed information on successful and failed entries.
## Quick Start
### Prerequisites
- A GitHub account
- A Cloudflare account
### Installation Steps
1.Fork this repository to your GitHub account.

2.Create a new project in Cloudflare Pages
- Log in to the Cloudflare Dashboard.
- Go to the Pages section.
- Click "Create a project".
- Select "Connect to Git".
- Choose the repository you forked.
- 
3.Configure build settings
- Build command: `npm run build`
- Build output directory:`dist`
- Environment variables:
 ```
     USER=your_username
     PASS=your_password
     API_TOKEN=your_api_token
     ```

4.Create a D1 Database
- In the Cloudflare Dashboard, go to the D1 section.
- Create a new database, and name it`domains-db`
- Copy the Database ID.

5.Configure the Database
- In your Cloudflare Pages project settings, add a D1 database binding.
- Binding name:`DB`
- Database ID: Paste the ID you copied earlier.

6.Initialize the Database
- In the Cloudflare Dashboard, go to the D1 section.
- Select your database.
- Execute the SQL statements from the`schema.sql` file.

7.Deploy
- Click "Save and Deploy".
- Wait for the deployment to complete.
After deployment is complete, you can access the system via the domain provided by Cloudflare Pages.
## API Documentation
### 1. Domain Check API
**Endpoint**:`/api/check`
**Method**: GET or POST
**Authentication**: Requires an API Token (via URL parameter or Bearer Token).
Authentication methods (choose one):
URL Parameter:`/api/check?token=your_token`
Bearer Token:`Authorization: Bearer your_token`
Response:
```json
{
    "status": 200,
    "message": "Check complete",
    "data": {
        "total_domains": 10,
        "notified_domains": [
            {
                "domain": "example.com",
                "remainingDays": 15,
                "expiry_date": "2024-03-01"
            }
        ]
    }
}
```
### 2. Domain List API
**Endpoint**: `/api/addrec`
**Method**: POST
**Authentication**: Requires a Bearer Token.
Response:
```json
{
    "status": 200,
    "message": "Successfully retrieved",
    "data": [
        {
            "id": 1,
            "domain": "example.com",
            "registrar": "Cloudflare",
            "registrar_link": "https://cloudflare.com",
            "registrar_date": "2023-01-01",
            "expiry_date": "2024-01-01",
            "service_type": "Website",
            "status": "Online",
            "memo": "Main site"
        }
    ]
}
```
## Configuration
### Environment Variables
- `USER`: Administrator username
- `PASS`: Administrator password
- `API_TOKEN`: API access token
## Contributing
Contributions are welcome! Please feel free to submit Issues and Pull Requests.
## Stargazers
![alt text](https://starchart.cc/wff0325/Domain-Manager.svg?variant=adaptive)
## License
This project is open-source under the MIT License - see the LICENSE file for more details.
