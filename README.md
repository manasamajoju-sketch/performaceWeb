# PerformanceWeb

A React + TypeScript web application for viewing and analyzing performance/session data with charts, maps, and detailed session views.

## Overview

This project is a frontend dashboard focused on:
- viewing session details
- visualizing sensor data such as acceleration, gyroscope, speed, and orientation
- rendering route and activity maps
- presenting lap and impact analysis

## Tech Stack

- React 19
- TypeScript
- Vite
- SCSS modules
- Leaflet
- Three.js

## Getting Started

### Install dependencies

bash
npm install


### Run locally

bash
npm run dev


### Build for production

bash
npm run build


### Lint

bash
npm run lint


## Project Structure

text
src/
  components/
    AccelerometerChart/
    ActivityMap/
    Calender/
    GyroscopeChart/
    HelmetViewer/
    ImpactAnalysis/
    LapAnalysis/
    LapTimeChart/
    LeanAngle/
    Login/
    Navbar/
    OrientationStats/
    Profile/
    RouteMap/
    SensorPanel/
    SessionDetail/
    SessionPanel/
    SpeedChart/
    SpikesChart/
    ThrottleBrakeChart/
  assets/
  styles/


## Main Areas

- Components folder: reusable UI and feature components
- Styles folder: global and shared SCSS styles
- Public folder: static assets and models
