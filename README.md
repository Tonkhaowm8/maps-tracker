# Stress Map Manual

## Prerequisites

### 1. Install Node.js and npm

Make sure you have **Node.js** and **npm** (Node Package Manager) installed on your system.

To check if they're installed, run the following commands in your terminal:

```bash
node -v
npm -v
```


If they are not installed, download and install them from the [Node.js official website](https://nodejs.org/).

---

## Project Setup

### 2. Clone the Project Repository

If you haven't already cloned the project, use  **git** :

```
git clone <repository-url>

```

Replace `<repository-url>` with the actual URL of the project repository.

### 3. Navigate to the Project Directory

After cloning, move into the project directory:

```
cd <project-directory>

```

Replace `<project-directory>` with the name of the folder where the project was cloned.

### 4. Install Project Dependencies

The project likely includes a `package.json` file that lists all dependencies. To install them, run:


This command will install all required packages, including  **React** ,  **react-leaflet** ,  **leaflet** , and other dependencies.

---

## Frontend Setup

### 5. Set Up Environment Variables for ngrok

For guidance on setting up ngrok, refer to this [YouTube tutorial](https://youtu.be/aFwrNSfthxU?si=ZEBzfBx5PpzcdCws).

### 6. Start the Development Server

Once all dependencies are installed, you can start the development server:

```
npm start

```

The React app should now be accessible in your browser at:

https://localhost:3000

### 7. Open Command Prompt to Forward Port with ngrok

To expose your local server to the internet, use  **ngrok** :

```
ngrok http --url=<your-ngrok-link> https://localhost:3000/
```

Replace `<your-ngrok-link>` with your specific ngrok domain link if needed.

---

## Backend Setup

### Database Setup (You only have to do this once)

Ensure your database is set up and running before proceeding.

### 8. Open a New Terminal

You can use **CMD** in Windows or **Terminal** in macOS.

### 9. Navigate to Backend Directory

Move into the backend folder of the project:

```
cd maps-tracker/backend

```

### 10. Install Backend Dependencies

Run the following command:

```
npm i

```

If you encounter any errors, try:

```
npm i --force

```

### 11. Start the Backend Server

To start the backend server, run:

```
npm run dev

```

If everything is set up correctly, you should see a message indicating that the server is running.

To confirm, visit:

http://localhost:4000/

You should see a "Hello World!" message.

---

## Additional Notes

* Make sure **ngrok** is properly configured to forward the correct port.
* For troubleshooting, ensure all dependencies are up-to-date and properly installed.
* If the backend or frontend servers do not start as expected, double-check that the correct ports are not already in use.

---

## License

This project is licensed under the [MIT License]().

---

## Contact

For any questions or issues, please contact the project maintainer.
