# 🎬 CineTimez — Premium Movie Discovery Platform

**CineTimez** is a state-of-the-art cinematic discovery web application designed for film enthusiasts who value a premium, fluid, and intuitive browsing experience. Built with **React 19**, **Tailwind CSS 4**, and **Framer Motion**, it delivers a theater-like atmosphere directly to your browser.

![CineTimez Hero Banner](./public/hero.png)

## ✨ Overview

CineTimez serves as a high-end demonstration of modern full-stack web development capabilities. It seamlessly integrates the **TMDB API** for rich, real-time movie data and **Appwrite** for Backend-as-a-Service (BaaS) functionalities, including Google OAuth authentication, live search analytics, and secure cloud synchronization for personalized user data.

### 🌟 Key Features

- **Intelligent Search & Filtering**: Real-time debounced movie searching, advanced sorting (Popularity, Release Date, Ratings), and dynamic genre filtering.
- **Google OAuth Authentication**: Secure, one-click sign-in powered by Appwrite.
- **Custom Library Management**: Create unlimited custom folders to categorize your saved movies (e.g., "Comfort Movies", "Weekend Thrillers").
- **Personal Movie Notes**: Rate movies on a 5-star scale and write private personal reviews that sync securely to the cloud.
- **Cinematic Details Modal**: A rich, responsive overlay featuring an embedded YouTube trailer player, cast registry, related recommendations, and your personal notes.
- **Trending Analytics**: A live "Trending Now" section that intelligently tracks popular search queries globally across the platform.
- **Premium UI/UX**: A dark-themed, glassmorphic design featuring smooth staggered animations, interactive hover states, and seamless mobile responsiveness.

---

## 📖 User Guide

### 1. Account Creation & Authentication

- **Sign In**: Click the "Sign In with Google" button at the top right to instantly create an account.
- **Cloud Sync**: Once logged in, all your interactions (watchlists, folders, reviews) are securely synced to your Appwrite User Preferences. You can log out and log back in on any device, and your data will be right where you left it.

### 2. Discovering Movies

- **Search Bar**: Type any movie title. Results populate instantly with a 500ms debounce to prevent API spam.
- **Genre Pills & Sorting**: Refine the catalog by clicking genre pills (Action, Sci-Fi, etc.) and use the sort dropdown to order by Release Date or Rating.
- **Trending Now**: Check the top carousel to see what other CineTimez users are currently searching for.

### 3. Movie Details & Trailers

Click on any movie card to open the **Cinematic Modal**:

- **Overview**: Read the official synopsis and check runtime, genres, and release date.
- **Cast**: View the primary cast registry with profile images and character names.
- **Recommended**: Discover visually similar films dynamically recommended by the TMDB engine.
- **Trailer Integration**: Watch the official YouTube trailer directly within the modal. (Automatically pauses when closed).

### 4. Custom Folder Watchlist

Manage your collection like a pro:

- **Save a Movie**: Click the `+` icon on a movie card, or select a specific folder from the animated dropdown inside the Movie Details modal.
- **View Collection**: Click "My Collection" in the navigation bar to toggle between the global catalog and your private library.
- **Create Folders**: Click "+ New Folder" in your collection to create a custom category.
- **Manage Folders**: Scroll through your folders using the premium invisible scrollbar. Click the 'X' on any custom folder to delete it (movies will safely remain in your "All Saved" default folder).

### 5. Personal Notes & Reviews

Keep track of what you thought about every film:

- **Rate & Review**: Open the "Notes" tab inside any movie's detail modal. Hover to select a 1-5 star rating and jot down your personal notes in the text area.
- **Save to Cloud**: Click "Save to Notes" to lock in your review.
- **Manage Entries**: Your gold stars and notes will persist whenever you revisit the movie. Hover over your saved review to reveal "Edit" and "Delete" options.

---

## 🛠️ Technical Architecture

### Tech Stack

- **Frontend Core**: React 19 (Functional Components & Custom Hooks)
- **State Management**: React Context API (Global State Architecture)
- **Styling**: Tailwind CSS 4 (Custom utilities, theme-first architecture)
- **Animations**: Framer Motion (AnimatePresence, Layout transitions)
- **Notifications**: Sonner (Premium, non-intrusive toast notifications)
- **Backend/DB**: Appwrite (OAuth2, User Preferences, Document Storage)
- **API**: The Movie Database (TMDB)

### Engineering Highlights

- **Modular Architecture**: Clean code structure with business logic extracted into custom hooks (`useMovies`, `useWatchlist`, `useAuth`), ensuring the codebase is scalable and easy to maintain.
- **Context-Driven State**: Eliminated prop drilling by implementing a centralized `AppProvider`, allowing components to access global movie data and user preferences seamlessly.
- **Optimistic UI Updates**: Watchlists and folders update instantly in the local state while silently syncing with the Appwrite cloud in the background, ensuring zero latency for the user.
- **Asynchronous State Safety**: Implemented deep merging for Appwrite Preferences to prevent race conditions or data overwrites when rapidly updating folders and reviews.
- **Adaptive Responsiveness**: The complex Movie Details modal uses adaptive flexbox modeling to lock scroll boundaries on mobile, ensuring the trailer and details sections scale flawlessly without breaking layout.
- **Error Boundaries**: Comprehensive fallback UIs for failed API connections or missing trailer data.

---

## 🚀 Future Roadmap: Building a Cinema Community

CineTimez is designed with scalability in mind. While it currently serves as a powerful personal movie discovery tool, it is perfectly architected to evolve into a full-scale **Cinema Community Platform**.

Future development phases include:

- **Public Review Feeds**: Transitioning from private user preferences to public Appwrite Database collections, allowing users to discover and interact with reviews from other movie enthusiasts.
- **Social Interaction**: Implementing "Likes" and "Replies" for movie reviews, creating a social dialogue around cinema.
- **Community Ratings**: Aggregating personal user ratings to create a "CineTimez Community Score" for every film, independent of official critic ratings.
- **User Profiles**: Public profiles showcasing a user's curated folders, top-rated movies, and cinematic history.

---

## 📥 Getting Started (Developer Setup)

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/nojanzzz/CineTimez.git
    cd CineTimez
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**: Create a `.env.local` file in the root directory:
    ```env
    VITE_TMDB_API_KEY=your_tmdb_bearer_token
    VITE_APPWRITE_PROJECT_ID=your_project_id
    VITE_APPWRITE_DATABASE_ID=your_db_id
    VITE_APPWRITE_COLLECTION_ID=your_collection_id
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🧑‍💻 Author

**Naufal Auzan R**
Computer Engineering, Vocational School IPB University
[Portfolio](https://port-jan.vercel.app/) | [LinkedIn](https://www.linkedin.com/in/naufalauzanr/)

---
