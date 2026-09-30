# IRIS — Intelligent Risk and Impact Simulator 🌀

**Built for the Hack2Skill: Build with AI — Code for Communities Hackathon**  
**Problem Statement #05:** Track-Based Cyclone Impact & Infrastructure Vulnerability Forecaster  
**Theme:** Resilience

---

## 📖 Overview
IRIS is an interactive, AI-powered coastal disaster preparedness planning tool designed for District Disaster Management Authorities (DDMAs). It transforms complex meteorological data into clear, actionable pre-landfall decisions for 10 high-risk Indian coastal districts across 6 states.

By combining physics-grounded surge estimates with **Google's Gemini 3.8 Flash AI**, IRIS helps administrators instantly assess infrastructure vulnerability, prioritize vulnerable communities, and automatically generate localized public advisories in multiple regional languages.

## ✨ Key Features
*   🤖 **AI-Powered Advisories (Gemini 3.8 Flash):** Instantly generates localized, audience-aware preparedness advisories in **6 Indian languages** (English, Hindi, Telugu, Bengali, Tamil, Gujarati).
*   🗺️ **Real Geospatial Mapping:** Built on **Leaflet** and OpenStreetMap, featuring real geographic coordinates and dynamic storm surge radius visualizations.
*   🌊 **Physics-Grounded Estimations:** Uses storm surge relationships referenced from the **IMD Storm Surge Atlas (INCOIS)** and historical precedents (Fani, Amphan).
*   🏥 **Infrastructure & Community Exposure:** Calculates exposure using real **Census 2011** population data and **NDMA 2022** cyclone shelter capacities.
*   📊 **Action Planner & Liquidity Simulator:** Tracks pre-landfall readiness against NDMA SOP frameworks and estimates parametric coverage needs.

## 🛠️ Tech Stack
*   **Frontend:** React 19, TypeScript, Vite
*   **AI Integration:** Google Gemini API (gemini-3.8-flash)
*   **Mapping:** Leaflet.js
*   **Styling:** Custom CSS, Lucide Icons

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/div-singhmehra/IRIS.git
   cd IRIS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   *(Get your free API key from [Google AI Studio](https://aistudio.google.com/apikey))*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## 📚 Data References
This is an illustrative planning prototype. Scenario figures are planning estimates, not live forecasts. 
*   **Surge & Rainfall:** IMD Storm Surge Atlas (2020), NIOT hindcasts.
*   **Population & Exposure:** Census of India (2011) coastal aggregates.
*   **Shelters:** NDMA Cyclone Shelter Programme (2022).

---
*Built with ❤️ for coastal resilience.*
