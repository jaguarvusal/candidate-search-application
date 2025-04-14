# Candidate Search Application

[Live Demo](https://candidate-search-application-035x.onrender.com)

This is a dynamic candidate discovery and selection application that allows users to browse through developer profiles, shortlist potential candidates, and manage a persistent list of saved candidates. Built to streamline the search process, the app enables users to swipe through profiles and save ideal matches with a single click.
<img width="1439" alt="Screen Shot 2025-04-13 at 4 06 48 PM" src="https://github.com/user-attachments/assets/050dbac6-34d1-4a17-8848-df5b671e934e" />

![license](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Technologies Used](#technologies-used)
- [License](#license)

## Features

- **Candidate Search Page**:
  - Displays detailed information for one candidate at a time, including:
    - Name
    - Username
    - Location
    - Avatar
    - Email
    - GitHub Profile URL
    - Company
  - **"+" Button**: Saves the current candidate to the shortlist and loads the next candidate.
  - **"-" Button**: Skips the current candidate and loads the next one without saving.
  - **End of List Handling**: Displays a message when there are no more candidates left to review.

- **Potential Candidates Page**:
  - Displays a list of all previously saved candidates with full profile details.
  - Shows a message when there are no saved candidates.
  - Saved candidates persist even after page reloads, ensuring continuity.

## Installation

1. Clone the repository:  
   `git clone <repo-url>`

2. Navigate into the project directory:  
   `cd <project-name>`

3. Install dependencies:  
   `npm install`

4. Start the app:  
   `npm start`

## Technologies Used

- **React** (Frontend Framework)
- **Node.js** (Runtime Environment)
- **Express** (Backend - if used)
- **LocalStorage** (Data Persistence)
- **GitHub Users API** (Candidate Data)

## License

This project is licensed under the MIT License.
