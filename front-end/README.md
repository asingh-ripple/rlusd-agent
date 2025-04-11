# GiveFi - Blockchain Donation Platform

A modern donation platform that leverages blockchain technology to provide instant, transparent, and direct aid to people around the world. This project is built with React, TypeScript, and CSS, utilizing a component-based architecture for maintainability and scalability.

## 🚀 Features

- **Instant Donations**: Fast transfers powered by Ripple and blockchain technology
- **Four Categories**: Natural Disasters, Conflict Zones, Health Emergencies, and Food & Water Crisis
- **Transparent Transactions**: Clear tracking of where your donations go
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript Support**: Type-safe code with proper interfaces

## 📁 Project Structure

```
givefi-app/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Navbar.css
│   │   ├── Hero.tsx
│   │   ├── Hero.css
│   │   ├── Categories.tsx
│   │   ├── Categories.css
│   │   ├── CategoryCard.tsx
│   │   ├── CategoryCard.css
│   │   ├── DonationForm.tsx
│   │   ├── DonationForm.css
│   │   ├── Footer.tsx
│   │   └── Footer.css
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── HomePage.css
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   ├── index.css
│   ├── react-app-env.d.ts
│   └── setupTests.ts
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 🛠️ Installation and Setup

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Creating the Project from Scratch

```bash
# Create a new React TypeScript project
npx create-react-app givefi-app --template typescript

# Navigate to the project directory
cd givefi-app

# Install required dependencies
npm install react-router-dom
```

### Setting Up the Project

1. Create the folder structure as shown above
2. Create component files and their respective CSS files
3. Update the files with the provided code

### Development Server

To run the app in development mode:

```bash
npm start
```

This will open the app in your default browser at [http://localhost:3000](http://localhost:3000). The page will reload if you make edits, and you'll see any lint errors in the console.

## 📦 Building for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `build` folder ready for deployment.

## 🚀 Deployment

### Deploy to GitHub Pages

1. Add these to your package.json:

```json
"homepage": "https://yourusername.github.io/givefi-app",
"scripts": {
  // other scripts...
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

2. Install GitHub Pages package:

```bash
npm install --save-dev gh-pages
```

3. Deploy:

```bash
npm run deploy
```

### Deploy to Netlify/Vercel

1. Create a production build:

```bash
npm run build
```

2. Deploy the `build` folder using Netlify/Vercel's deployment options or CLI tools.

## 🧪 Testing

To run tests:

```bash
npm test
```

## 🔧 Backend Integration

The current implementation includes placeholder code for backend integration. To connect to your backend:

1. Update API endpoints in the `DonationForm.tsx` component
2. Implement authentication in the `Navbar.tsx` component
3. Add any additional API services as needed

## 📝 Component Documentation

### Core Components

- **Navbar**: Navigation with mobile responsiveness
- **Hero**: Main hero section with tagline
- **Categories**: Container for donation categories
- **CategoryCard**: Individual category display
- **DonationForm**: Form for processing donations
- **Footer**: Site footer with copyright information

### Page Components

- **HomePage**: Main landing page that assembles all components

## 🔄 Future Enhancements

- User authentication and profiles
- Donation history tracking
- Real-time donation impact visualization
- Multi-language support
- Dark mode toggle
- Donation certificate generation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icon libraries used: Default emoji icons
- UI inspiration: Modern donation platforms
- React community for excellent documentation and support
