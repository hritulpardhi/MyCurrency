# My Currency Converter

This repository contains the Currency Converter project, which includes a Django backend and a React frontend. Postman collection for your reference is pushed as well in the repository.
Note: On the First hit, the data will be fetched from the API, if the data is not present in db. After the API call is successful, post which the data will be fetched from db. (Refer to the screenshots below)

## Table of Contents

- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Backend (Django)](#setting-up-the-backend-django)
  - [Setting Up the Frontend (React)](#setting-up-the-frontend-react)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Technologies Used

- **Backend**: Django, Django REST Framework
- **Frontend**: React, Axios
- **Database**: SQLite (or specify your database)
- **Other Tools**: Node.js, npm

## Getting Started

Follow these instructions to set up the project locally.
1. Generate your api key from this website - https://currencybeacon.com/login
2. Update the Settings.py with your db config.

### Prerequisites

Make sure you have the following installed:

- Python 3.x
- Django
- Node.js and npm

### Setting Up the Backend (Django)

1. **Clone the repository**:
   git clone [https://github.com/your-username/currency_converter.git](https://github.com/hritulpardhi/MyCurrency.git)
   cd currency_converter/currency_converter_backend
  

2. **Create a virtual environment**:
   ```
   python -m venv venv
   ```

3. **Activate the virtual environment**:

   - **On Windows**:
     ```
     venv\Scripts\activate
     ```

   - **On macOS/Linux**:
     ```
     source venv/bin/activate
     ```

4. **Install the required packages**:
   ```
   pip install -r requirements.txt
   ```

5. **Run migrations**:
   ```
   python manage.py migrate
   ```

6. **Create a superuser** (optional, for admin access):
   ```
   python manage.py createsuperuser
   ```

7. **Run the Django server**:
   ```
   python manage.py runserver
   ```
8. **Run Fixtures**:
   Update the api key for currencybeacon which you generated from https://currencybeacon.com/login for the providers fixture.
   python manage.py loaddata 001_providers_list.json

9. **Run Management Commands**:
     1. python manage.py bulk_load_currencies (Load all currency data)
     2. python manage.py set_load_historical (Set defaults for fetching the historical data)
     3. python manage.py async_load_historical_data (For fetching and storing data in the database). This management command can be configured to fetch the data from the date ranges by modifying the code. 

### Setting Up the Frontend (React)

1. **Navigate to the React project**:
   ```bash
   cd ../currency_converter_client
   ```

2. **Install the required dependencies**:
   ```bash
   npm install
   ```

3. **Start the React development server**:
   ```bash
   npm start
   ```

## Running the Application

- The Django backend will be running at `http://127.0.0.1:8000/`.
- The React frontend will typically run at `http://localhost:3000/`.

Ensure that your frontend is correctly configured to make API calls to your Django backend.


*Note: Replace with actual API endpoints and methods relevant to your project.*

UI Screenshots :
1. Currency List:
   ![image](https://github.com/user-attachments/assets/fe763024-3cba-4de6-95cc-8a5e4d9ea50c)
2. Multiple Currency Exchange:
   ![image](https://github.com/user-attachments/assets/9abc1436-9d29-4ff6-ad21-27d035c9ddf4)
3. Single Currency Chart:
   ![image](https://github.com/user-attachments/assets/ea0e7968-fb89-4da5-b2c4-8ccbb4aef92c)
4. Multiple Currency Chart:
   ![image](https://github.com/user-attachments/assets/edb447c0-da06-4863-a599-9bdbdcc0da81)


## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

You can copy and paste this directly into your README file. Let me know if you need any more adjustments!
