# Project Requirements

This page outlines the key requirements for the ft_transcendence project based on the 42 School curriculum.

## Core Requirements

!!! important "Fundamental Requirements"
    These requirements are non-negotiable and must be implemented.

    - Create a single-page web application with a Pong game
    - No use of frontend frameworks like React, Vue, Angular, etc.
    - Backend must be using Python with Django
    - Data must be stored in a PostgreSQL database

## Security Requirements

!!! warning "Security Considerations"
    Violating these security requirements could lead to project failure.

    - Passwords must be hashed in the database
    - The website must be protected against SQL injections
    - Forms and user input must be validated
    - No credentials should be present in the source code

## Mandatory Features

### User Account

- Users must login using the OAuth system of 42 intranet
- Users should be able to upload an avatar
- Users should be able to enable two-factor authentication
- Each user should have a unique name displayed on the website
- Users can add other users as friends
- Users can see other users' stats (wins, losses, etc.)
- Users should have a Match History and stats on their profile

### Game

- There should be a matchmaking system
- The game should include customization options
- The game should be responsive and fair for both players

## Additional Notes

- The application must be containerized using Docker
- Environment variables should be used for sensitive information
- The site should be responsive and provide a good user experience
