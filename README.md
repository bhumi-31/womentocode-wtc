# WomenToCode (WTC) 👩‍💻

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<p align="center">
  <strong>🌐 Live Demo:</strong> <a href="https://womentocode.me">womentocode.me</a>
</p>

---

## 📌 Project Overview

**WomenToCode** is a full-stack web application designed to empower women in technology through community building, education, and career opportunities. The platform serves as a comprehensive hub for connecting aspiring and established women in tech, featuring event management, project showcases, team collaboration, and an administrative dashboard for content management.

---

## ✨ Key Features

### 🏠 **Public Features**
| Feature | Description |
|---------|-------------|
| **Dynamic Homepage** | Hero section with video background, animated components, and smooth scroll interactions |
| **Events Management** | Browse upcoming events, workshops, and tech meetups |
| **Team Directory** | View team members with detailed profiles and individual member pages |
| **Project Showcase** | Gallery of community projects with descriptions and tech stacks |
| **Photo Gallery** | Visual showcase of community activities and events |
| **Articles & Blog** | Educational content and tech articles for the community |
| **Contact Form** | Direct communication channel with the organization |
| **Membership Application** | Join Us form for new member applications |

### 🔐 **User Authentication**
- **Email/Password Authentication** with JWT tokens
- **OAuth Integration** (Google & GitHub)
- **Password Recovery** with email-based reset links
- **User Profile Management** with role-based access

### 👑 **Admin Dashboard**
| Module | Capabilities |
|--------|--------------|
| **Dashboard** | Overview stats and quick actions |
| **User Management** | View, edit, and manage user accounts |
| **Team Management** | CRUD operations for team members |
| **Event Management** | Create, update, and delete events |
| **Project Management** | Manage community project showcases |
| **Gallery Management** | Upload and organize photos |
| **Article Management** | Content management for blog posts |
| **Membership Applications** | Review and process join requests |
| **Messages** | View and respond to contact form submissions |

---

## 🛠️ Tech Stack

### **Frontend**
```
├── React 19.2.0          # UI Library
├── React Router DOM 7    # Client-side routing
├── Vite 7.2.4            # Build tool & dev server
├── CSS3                  # Custom styling with modern CSS
└── ESLint                # Code quality & linting
```

### **Backend**
```
├── Node.js               # Runtime environment
├── Express.js 4.18       # Web framework
├── MongoDB               # NoSQL database
├── Mongoose 8.0          # ODM for MongoDB
├── JWT                   # Token-based authentication
├── Passport.js           # OAuth strategies (Google, GitHub)
├── Nodemailer            # Email service for notifications
└── bcrypt.js             # Password hashing
```

### **Deployment**
```
├── Frontend              # Vercel / GitHub Pages
├── Backend               # Render
└── Database              # MongoDB Atlas
```

---

## 📂 Project Architecture

```
womentocode/
├── frontend/                    # React Frontend Application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── admin/           # Admin dashboard components
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── AdminTeam.jsx
│   │   │   │   ├── AdminEvents.jsx
│   │   │   │   ├── AdminProjects.jsx
│   │   │   │   ├── AdminGallery.jsx
│   │   │   │   ├── AdminArticles.jsx
│   │   │   │   └── AdminMembership.jsx
│   │   │   ├── Hero.jsx         # Landing hero section
│   │   │   ├── Navbar.jsx       # Navigation component
│   │   │   ├── Events.jsx       # Events listing
│   │   │   ├── Team.jsx         # Team directory
│   │   │   ├── Projects.jsx     # Project showcase
│   │   │   ├── Gallery.jsx      # Photo gallery
│   │   │   ├── Articles.jsx     # Blog/Articles
│   │   │   ├── Contact.jsx      # Contact form
│   │   │   └── ...              # Other components
│   │   ├── data/                # Static data files
│   │   ├── App.jsx              # Main app with routing
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Express Backend API
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── passport.js          # OAuth configuration
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   ├── eventController.js
│   │   ├── projectController.js
│   │   ├── galleryController.js
│   │   ├── articleController.js
│   │   └── ...
│   ├── models/                  # MongoDB schemas
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Event.js
│   │   ├── Project.js
│   │   └── ...
│   ├── routes/                  # API routes
│   │   ├── authRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── eventRoutes.js
│   │   └── ...
│   ├── middleware/              # Custom middleware
│   ├── utils/                   # Utility functions
│   ├── server.js                # Express server entry
│   └── package.json
│
├── .github/workflows/           # CI/CD configuration
├── CNAME                        # Custom domain
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/womentocode.git
   cd womentocode
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Configure your environment variables
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env file (optional)
   cp .env.example .env
   
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

### Environment Variables

**Backend (.env)**
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | User login |
| `GET` | `/auth/me` | Get current user (protected) |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password with token |

### Resources
| Resource | Endpoints |
|----------|-----------|
| **Team** | `GET/POST/PUT/DELETE /team` |
| **Events** | `GET/POST/PUT/DELETE /events` |
| **Projects** | `GET/POST/PUT/DELETE /projects` |
| **Gallery** | `GET/POST/PUT/DELETE /gallery` |
| **Articles** | `GET/POST/PUT/DELETE /articles` |
| **Contact** | `POST /contact` |
| **Membership** | `POST /membership` |

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Homepage
- Dynamic hero section with video background
- Smooth scroll animations
- Responsive design

### Admin Dashboard
- Comprehensive content management
- Real-time statistics
- User-friendly interface

</details>

---

## 🎯 Key Technical Highlights

1. **MVC Architecture** - Clean separation of concerns with Models, Views, and Controllers
2. **RESTful API Design** - Properly structured endpoints following REST conventions
3. **JWT Authentication** - Secure token-based authentication system
4. **OAuth 2.0 Integration** - Seamless social login with Google and GitHub
5. **Responsive Design** - Mobile-first approach with adaptive layouts
6. **Role-Based Access Control** - Admin and user permission levels
7. **Real-time Data** - Dynamic content fetching from MongoDB
8. **Modern React Patterns** - Hooks, functional components, and React Router v7

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Bhumika Narula** - [womentocode.me](https://womentocode.me)

---

<p align="center">
  <strong>Built with ❤️ for empowering women in tech</strong>
</p>
