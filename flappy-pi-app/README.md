# Flappy Pi App

Flappy Pi is a fun and engaging game that integrates features from the Pi Network, allowing users to authenticate and play seamlessly within the Pi Browser. This project is built using React and Next.js.

## Features

- **Splash Screen**: Displays a loading UI while checking for Pi Browser detection.
- **Pi Auth Login**: Handles user authentication using Pi Auth, allowing users to log in and access their wallet.
- **Responsive Design**: The app is designed to work well on various devices.

## Project Structure

```
flappy-pi-app
├── src
│   ├── components
│   │   ├── SplashScreen.tsx
│   │   └── PiAuthLogin.tsx
│   ├── pages
│   │   ├── index.tsx
│   │   └── _app.tsx
│   ├── utils
│   │   └── piNetwork.ts
│   └── styles
│       └── globals.css
├── public
│   └── 
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd flappy-pi-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the application in development mode, use the following command:
```
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the app.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.