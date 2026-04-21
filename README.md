# 🎬 CineTimez — Premium Movie Discovery Platform

**CineTimez** is a state-of-the-art cinematic discovery web application designed for film enthusiasts who value a premium, fluid, and intuitive browsing experience. Built with **React 19**, **Tailwind CSS 4**, and **Framer Motion**, it delivers a theater-like atmosphere directly to your browser.

![CineTimez Hero Banner](./public/hero.png)

## ✨ Overview
CineTimez serves as a high-end demonstration of modern web development capabilities. It seamlessly integrates the **TMDB API** for real-time movie data and **Appwrite** for intelligent search trend tracking. This project transition from a functional prototype to a production-ready foundation that can be expanded into a full-scale streaming or social movie platform.

### 🌟 Key Features
- **Intelligent Search**: Real-time movie searching with debounced API requests to optimize performance.
- **Dynamic Filtering**: Narrow down your search by genre (Action, Sci-Fi, Drama, etc.) with a single click.
- **Advanced Sorting**: Organize results by Popularity, Release Date, or Critic Ratings.
- **Personalized Watchlist**: Save your must-watch movies to a persistent "My List" using local storage integration.
- **Trending Analytics**: A live "Trending Now" section powered by Appwrite that tracks popular search queries globally.
- **Premium UI/UX**: A dark-themed, glassmorphic design featuring smooth staggered animations and responsive layouts for all device sizes.

---

## 📖 User Guide

### 1. Finding Movies
Use the **Search Bar** at the top to type in any movie title. Results will populate instantly as you type (with a subtle 500ms debounce to avoid API spam).

### 2. Filtering & Sorting
- Use the **Genre Pills** below the search bar to jump to specific categories.
- Use the **Sort Dropdown** on the right of the "Explore" section to reorder movies based on your preference (e.g., "Newest" to see recent releases).

### 3. Managing Your Watchlist
Look for the **Heart Icon** on any movie card. 
- **Click to Add**: The heart turns solid red, and the movie is saved to your list.
- **Click to Remove**: The movie is removed from your list instantly.
- You can see your total saved count in the "Explore Catalog" header.

---

## 🛠️ Technical Implementation

### Tech Stack
- **Frontend**: React 19 (Functional Components & Hooks)
- **Styling**: Tailwind CSS 4 (Theme-first architecture)
- **Animations**: Framer Motion (Layout transitions & stagger effects)
- **Backend/DB**: Appwrite (Global trend tracking)
- **API**: The Movie Database (TMDB)

### Production Readiness
CineTimez is designed with a **scalability-first** approach:
- **Error Boundaries**: Implemented to prevent app crashes during API downtime.
- **SEO Optimized**: Fully configured with Open Graph meta tags and semantic HTML.
- **Modular Components**: Highly reusable atomic components for easy expansion.

---

## 🚀 Potential for Expansion
This website serves as a robust base for:
- **User Authentication**: Implementing Appwrite Auth for cloud-synced accounts.
- **Social Features**: Adding user reviews, ratings, and shared watchlists.
- **Streaming Integration**: Connecting with VOD providers or official trailers via YouTube API.
- **AI Recommendations**: Using movie data to generate personalized "For You" feeds.

---

## 📥 Getting Started

1.  **Clone the Repository**: `git clone [repo-url]`
2.  **Install Dependencies**: `npm install`
3.  **Environment Variables**: Create a `.env.local` file with:
    ```env
    VITE_TMDB_API_KEY=your_tmdb_bearer_token
    VITE_APPWRITE_PROJECT_ID=your_project_id
    VITE_APPWRITE_DATABASE_ID=your_db_id
    VITE_APPWRITE_COLLECTION_ID=your_collection_id
    ```
4.  **Run Development Server**: `npm run dev`

---

*CineTimez — Redefining how you discover cinema.*
