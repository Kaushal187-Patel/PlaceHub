# placeHub Frontend

React.js frontend application for the placeHub AI-powered career recommendation platform.

## 🚀 Features

- **Modern React Architecture**: Built with React 19, Vite, and modern JavaScript
- **State Management**: Redux Toolkit for efficient state management
- **Responsive Design**: Tailwind CSS with dark mode support
- **Authentication**: JWT-based authentication with protected routes
- **AI Integration**: Career recommendations and resume analysis
- **Job Board**: Advanced job search and filtering
- **User Dashboard**: Personalized dashboard with analytics
- **File Upload**: Resume upload with drag-and-drop support
- **Real-time Updates**: Toast notifications and loading states

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Dropzone** - File upload
- **React Icons** - Icon library
- **React Toastify** - Notifications

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── layouts/            # Layout components
├── store/              # Redux store and slices
├── services/           # API services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── context/            # React context providers
├── assets/             # Static assets
└── App.jsx             # Main app component
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update environment variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ML_API_URL=http://localhost:5001/api
```

4. Start development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

The application uses Tailwind CSS with custom configurations:

- **Dark Mode**: Automatic dark mode support
- **Responsive Design**: Mobile-first approach
- **Custom Components**: Reusable styled components
- **Animations**: Smooth transitions with Framer Motion

## 🔐 Authentication

The app includes a complete authentication system:

- User registration and login
- JWT token management
- Protected routes
- Automatic token refresh
- Role-based access control

## 📱 Pages

- **Home** - Landing page with features overview
- **Login/Register** - Authentication pages
- **Dashboard** - User dashboard with stats and quick actions
- **Jobs** - Job listings with search and filters
- **Career Recommendations** - AI-powered career suggestions
- **Resume Analyzer** - AI resume analysis and feedback
- **Profile** - User profile management

## 🔧 Configuration

### Tailwind CSS

Custom Tailwind configuration includes:

- Dark mode support
- Custom color palette
- Typography plugin
- Forms plugin
- Custom utilities

### Vite Configuration

Optimized Vite setup with:

- React plugin
- Path aliases
- Environment variables
- Build optimizations

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
