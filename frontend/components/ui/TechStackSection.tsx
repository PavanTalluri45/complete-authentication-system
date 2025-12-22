"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const techStack = [
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64c11.2 0 21.7-2.9 30.8-7.9L48.4 55.3v36.6h-6.8V41.8h6.8l50.5 75.8C116.4 106.2 128 86.5 128 64c0-35.3-28.7-64-64-64zm22.1 84.6l-7.5-11.3V41.8h7.5v42.8z" /></svg>
    ),
    name: "Next.js",
    description: "I leveraged Next.js App Router for efficient file-based routing and Server Components to optimize performance by reducing client-side JavaScript bundle. The API Routes were utilized to build robust backend endpoints that handle authentication, data fetching, and server-side operations seamlessly. Next.js's built-in optimizations like image optimization and automatic code splitting significantly improved the application's loading speed and user experience."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#fff" d="M22.67 47h99.67v73.67H22.67z" /><path data-name="original" fill="#007acc" d="M1.5 63.91v62.5h125v-125H1.5zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34 9.34 0 011.15-.73L82 101l3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H56.66v46.23H45.15V69.26H28.88v-5a49.19 49.19 0 01.12-5.17C29.08 59 39 59 51 59h21.83z" /></svg>

    ),
    name: "TypeScript",
    description: "TypeScript was implemented throughout the entire application to provide type safety and catch potential errors during development rather than at runtime. The enhanced developer experience with intelligent code completion and refactoring capabilities significantly accelerated the development process. By defining strict interfaces and types, I ensured data consistency across components and API responses, making the codebase more maintainable and scalable."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M64.004 25.602c-17.067 0-27.73 8.53-32 25.597 6.398-8.531 13.867-11.73 22.398-9.597 4.871 1.214 8.352 4.746 12.207 8.66C72.883 56.629 80.145 64 96.004 64c17.066 0 27.73-8.531 32-25.602-6.399 8.536-13.867 11.735-22.399 9.602-4.87-1.215-8.347-4.746-12.207-8.66-6.27-6.367-13.53-13.738-29.394-13.738zM32.004 64c-17.066 0-27.73 8.531-32 25.602C6.402 81.066 13.87 77.867 22.402 80c4.871 1.215 8.352 4.746 12.207 8.66 6.274 6.367 13.536 13.738 29.395 13.738 17.066 0 27.73-8.53 32-25.597-6.399 8.531-13.867 11.73-22.399 9.597-4.87-1.214-8.347-4.746-12.207-8.66C55.128 71.371 47.868 64 32.004 64zm0 0" fill="#38bdf8" /></svg>

    ),
    name: "Tailwind CSS",
    description: "Tailwind CSS's utility-first approach enabled rapid UI development with consistent spacing, colors, and typography throughout the application. I implemented responsive design principles using Tailwind's breakpoint system to ensure optimal viewing experience across all device sizes. The dark mode support was seamlessly integrated using Tailwind's dark variant, providing users with comfortable viewing in low-light environments."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#83CD29" d="M112.771 30.334L68.674 4.729c-2.781-1.584-6.402-1.584-9.205 0L14.901 30.334C12.031 31.985 10 35.088 10 38.407v51.142c0 3.319 2.084 6.423 4.954 8.083l11.775 6.688c5.628 2.772 7.617 2.772 10.178 2.772 8.333 0 13.093-5.039 13.093-13.828v-50.49c0-.713-.371-1.774-1.071-1.774h-5.623C42.594 41 41 42.061 41 42.773v50.49c0 3.896-3.524 7.773-10.11 4.48L18.723 90.73c-.424-.23-.723-.693-.723-1.181V38.407c0-.482.555-.966.982-1.213l44.424-25.561c.415-.235 1.025-.235 1.439 0l43.882 25.555c.42.253.272.722.272 1.219v51.142c0 .488.183.963-.232 1.198l-44.086 25.576c-.378.227-.847.227-1.261 0l-11.307-6.749c-.341-.198-.746-.269-1.073-.086-3.146 1.783-3.726 2.02-6.677 3.043-.726.253-1.797.692.41 1.929l14.798 8.754a9.294 9.294 0 004.647 1.246c1.642 0 3.25-.426 4.667-1.246l43.885-25.582c2.87-1.672 4.23-4.764 4.23-8.083V38.407c0-3.319-1.36-6.414-4.229-8.073zM77.91 81.445c-11.726 0-14.309-3.235-15.17-9.066-.1-.628-.633-1.379-1.272-1.379h-5.731c-.709 0-1.279.86-1.279 1.566 0 7.466 4.059 16.512 23.453 16.512 14.039 0 22.088-5.455 22.088-15.109 0-9.572-6.467-12.084-20.082-13.886-13.762-1.819-15.16-2.738-15.16-5.962 0-2.658 1.184-6.203 11.374-6.203 9.105 0 12.461 1.954 13.842 8.091.118.577.645.991 1.24.991h5.754c.354 0 .692-.143.94-.396.24-.272.367-.613.335-.979-.891-10.568-7.912-15.493-22.112-15.493-12.631 0-20.166 5.334-20.166 14.275 0 9.698 7.497 12.378 19.622 13.577 14.505 1.422 15.633 3.542 15.633 6.395 0 4.955-3.978 7.066-13.309 7.066z" /></svg>
    ),
    name: "Node.js",
    description: "Node.js's event-driven architecture and non-blocking I/O model allowed me to build highly scalable backend services that efficiently handle concurrent requests. The platform proved ideal for developing RESTful APIs and microservices that power the application's core functionality and data processing. I leveraged the extensive NPM ecosystem to integrate various packages and tools, accelerating development while maintaining high code quality."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M126.67 98.44c-4.56 1.16-7.38.05-9.91-3.75-5.68-8.51-11.95-16.63-18-24.9-.78-1.07-1.59-2.12-2.6-3.45C89 76 81.85 85.2 75.14 94.77c-2.4 3.42-4.92 4.91-9.4 3.7l26.92-36.13L67.6 29.71c4.31-.84 7.29-.41 9.93 3.45 5.83 8.52 12.26 16.63 18.67 25.21 6.45-8.55 12.8-16.67 18.8-25.11 2.41-3.42 5-4.72 9.33-3.46-3.28 4.35-6.49 8.63-9.72 12.88-4.36 5.73-8.64 11.53-13.16 17.14-1.61 2-1.35 3.3.09 5.19C109.9 76 118.16 87.1 126.67 98.44zM1.33 61.74c.72-3.61 1.2-7.29 2.2-10.83 6-21.43 30.6-30.34 47.5-17.06C60.93 41.64 63.39 52.62 62.9 65H7.1c-.84 22.21 15.15 35.62 35.53 28.78 7.15-2.4 11.36-8 13.47-15 1.07-3.51 2.84-4.06 6.14-3.06-1.69 8.76-5.52 16.08-13.52 20.66-12 6.86-29.13 4.64-38.14-4.89C5.26 85.89 3 78.92 2 71.39c-.15-1.2-.46-2.38-.7-3.57q.03-3.04.03-6.08zm5.87-1.49h50.43c-.33-16.06-10.33-27.47-24-27.57-15-.12-25.78 11.02-26.43 27.57z" /></svg>
    ),
    name: "Express.js",
    description: "Express.js provided a minimal and flexible framework for building the application's backend API with clean, maintainable code structure. The middleware-based architecture allowed me to efficiently handle authentication, logging, error handling, and request processing in a modular way. I utilized Express.js to rapidly develop secure and performant API endpoints that serve data to the frontend while maintaining separation of concerns."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#00618A" d="M116.948 97.807c-6.863-.187-12.104.452-16.585 2.341-1.273.537-3.305.552-3.513 2.147.7.733.809 1.829 1.365 2.731 1.07 1.73 2.876 4.052 4.488 5.268 1.762 1.33 3.577 2.751 5.465 3.902 3.358 2.047 7.107 3.217 10.34 5.268 1.906 1.21 3.799 2.733 5.658 4.097.92.675 1.537 1.724 2.732 2.147v-.194c-.628-.8-.79-1.898-1.366-2.733l-2.537-2.537c-2.48-3.292-5.629-6.184-8.976-8.585-2.669-1.916-8.642-4.504-9.755-7.609l-.195-.195c1.892-.214 4.107-.898 5.854-1.367 2.934-.786 5.556-.583 8.585-1.365l4.097-1.171v-.78c-1.531-1.571-2.623-3.651-4.292-5.073-4.37-3.72-9.138-7.437-14.048-10.537-2.724-1.718-6.089-2.835-8.976-4.292-.971-.491-2.677-.746-3.318-1.562-1.517-1.932-2.342-4.382-3.511-6.633-2.449-4.717-4.854-9.868-7.024-14.831-1.48-3.384-2.447-6.72-4.293-9.756-8.86-14.567-18.396-23.358-33.169-32-3.144-1.838-6.929-2.563-10.929-3.513-2.145-.129-4.292-.26-6.438-.391-1.311-.546-2.673-2.149-3.902-2.927C17.811 4.565 5.257-2.16 1.633 6.682c-2.289 5.581 3.421 11.025 5.462 13.854 1.434 1.982 3.269 4.207 4.293 6.438.674 1.467.79 2.938 1.367 4.489 1.417 3.822 2.652 7.98 4.487 11.511.927 1.788 1.949 3.67 3.122 5.268.718.981 1.951 1.413 2.145 2.927-1.204 1.686-1.273 4.304-1.95 6.44-3.05 9.615-1.899 21.567 2.537 28.683 1.36 2.186 4.567 6.871 8.975 5.073 3.856-1.57 2.995-6.438 4.098-10.732.249-.973.096-1.689.585-2.341v.195l3.513 7.024c2.6 4.187 7.212 8.562 11.122 11.514 2.027 1.531 3.623 4.177 6.244 5.073v-.196h-.195c-.508-.791-1.303-1.119-1.951-1.755-1.527-1.497-3.225-3.358-4.487-5.073-3.556-4.827-6.698-10.11-9.561-15.609-1.368-2.627-2.557-5.523-3.709-8.196-.444-1.03-.438-2.589-1.364-3.122-1.263 1.958-3.122 3.542-4.098 5.854-1.561 3.696-1.762 8.204-2.341 12.878-.342.122-.19.038-.391.194-2.718-.655-3.672-3.452-4.683-5.853-2.554-6.07-3.029-15.842-.781-22.829.582-1.809 3.21-7.501 2.146-9.172-.508-1.666-2.184-2.63-3.121-3.903-1.161-1.574-2.319-3.646-3.124-5.464-2.09-4.731-3.066-10.044-5.267-14.828-1.053-2.287-2.832-4.602-4.293-6.634-1.617-2.253-3.429-3.912-4.683-6.635-.446-.968-1.051-2.518-.391-3.513.21-.671.508-.951 1.171-1.17 1.132-.873 4.284.29 5.462.779 3.129 1.3 5.741 2.538 8.392 4.294 1.271.844 2.559 2.475 4.097 2.927h1.756c2.747.631 5.824.195 8.391.975 4.536 1.378 8.601 3.523 12.292 5.854 11.246 7.102 20.442 17.21 26.732 29.269 1.012 1.942 1.45 3.794 2.341 5.854 1.798 4.153 4.063 8.426 5.852 12.488 1.786 4.052 3.526 8.141 6.05 11.513 1.327 1.772 6.451 2.723 8.781 3.708 1.632.689 4.307 1.409 5.854 2.34 2.953 1.782 5.815 3.903 8.586 5.855 1.383.975 5.64 3.116 5.852 4.879zM29.729 23.466c-1.431-.027-2.443.156-3.513.389v.195h.195c.683 1.402 1.888 2.306 2.731 3.513.65 1.367 1.301 2.732 1.952 4.097l.194-.193c1.209-.853 1.762-2.214 1.755-4.294-.484-.509-.555-1.147-.975-1.755-.556-.811-1.635-1.272-2.339-1.952z" /></svg>
    ),
    name: "MySQL",
    description: "MySQL served as the reliable relational database management system that stores and organizes the application's structured data with ACID compliance. The mature ecosystem and extensive tooling around MySQL enabled efficient database design, query optimization, and data integrity maintenance. I implemented proper indexing and normalization techniques to ensure fast query performance and data consistency across user interactions."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#A41E11" d="M121.8 93.1c-6.7 3.5-41.4 17.7-48.8 21.6-7.4 3.9-11.5 3.8-17.3 1S13 98.1 6.3 94.9c-3.3-1.6-5-2.9-5-4.2V78s48-10.5 55.8-13.2c7.8-2.8 10.4-2.9 17-.5s46.1 9.5 52.6 11.9v12.5c0 1.3-1.5 2.7-4.9 4.4z" /><path fill="#D82C20" d="M121.8 80.5C115.1 84 80.4 98.2 73 102.1c-7.4 3.9-11.5 3.8-17.3 1-5.8-2.8-42.7-17.7-49.4-20.9C-.3 79-.5 76.8 6 74.3c6.5-2.6 43.2-17 51-19.7 7.8-2.8 10.4-2.9 17-.5s41.1 16.1 47.6 18.5c6.7 2.4 6.9 4.4.2 7.9z" /><path fill="#A41E11" d="M121.8 72.5C115.1 76 80.4 90.2 73 94.1c-7.4 3.8-11.5 3.8-17.3 1C49.9 92.3 13 77.4 6.3 74.2c-3.3-1.6-5-2.9-5-4.2V57.3s48-10.5 55.8-13.2c7.8-2.8 10.4-2.9 17-.5s46.1 9.5 52.6 11.9V68c0 1.3-1.5 2.7-4.9 4.5z" /><path fill="#D82C20" d="M121.8 59.8c-6.7 3.5-41.4 17.7-48.8 21.6-7.4 3.8-11.5 3.8-17.3 1C49.9 79.6 13 64.7 6.3 61.5s-6.8-5.4-.3-7.9c6.5-2.6 43.2-17 51-19.7 7.8-2.8 10.4-2.9 17-.5s41.1 16.1 47.6 18.5c6.7 2.4 6.9 4.4.2 7.9z" /><path fill="#A41E11" d="M121.8 51c-6.7 3.5-41.4 17.7-48.8 21.6-7.4 3.8-11.5 3.8-17.3 1C49.9 70.9 13 56 6.3 52.8c-3.3-1.6-5.1-2.9-5.1-4.2V35.9s48-10.5 55.8-13.2c7.8-2.8 10.4-2.9 17-.5s46.1 9.5 52.6 11.9v12.5c.1 1.3-1.4 2.6-4.8 4.4z" /><path fill="#D82C20" d="M121.8 38.3C115.1 41.8 80.4 56 73 59.9c-7.4 3.8-11.5 3.8-17.3 1S13 43.3 6.3 40.1s-6.8-5.4-.3-7.9c6.5-2.6 43.2-17 51-19.7 7.8-2.8 10.4-2.9 17-.5s41.1 16.1 47.6 18.5c6.7 2.4 6.9 4.4.2 7.8z" /><path fill="#fff" d="M80.4 26.1l-10.8 1.2-2.5 5.8-3.9-6.5-12.5-1.1 9.3-3.4-2.8-5.2 8.8 3.4 8.2-2.7L72 23zM66.5 54.5l-20.3-8.4 29.1-4.4z" /><ellipse fill="#fff" cx="38.4" cy="35.4" rx="15.5" ry="6" /><path fill="#7A0C00" d="M93.3 27.7l17.2 6.8-17.2 6.8z" /><path fill="#AD2115" d="M74.3 35.3l19-7.6v13.6l-1.9.8z" /></svg>
    ),
    name: "Redis",
    description: "Redis was implemented as an in-memory data store to cache frequently accessed data and significantly reduce database load for improved performance. The pub/sub functionality was utilized for real-time features and event-driven architecture within the application's notification system. I configured Redis persistence to ensure data durability while maintaining the lightning-fast response times that enhance user experience."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Jwt-Icon--Streamline-Svg-Logos" height="24" width="24">
        <desc>Jwt Icon Streamline Icon: https://streamlinehq.com</desc>

        <path fill="#ffffff" d="M13.774325 6.5715 13.750825 0.25h-3.525l0.0235 6.3215 1.7625 2.4205 1.7625 -2.4205Z" strokeWidth="0.25"></path>
        <path fill="#ffffff" d="M10.2494 17.405025v6.345h3.525v-6.345l-1.7625 -2.4205 -1.7625 2.4205Z" strokeWidth="0.25"></path>
        <path fill="#00f2e6" d="m13.774175 17.405 3.713 5.123 2.8435 -2.068 -3.713 -5.123 -2.8435 -0.9165V17.405Z" strokeWidth="0.25"></path>
        <path fill="#00f2e6" d="M10.2493 6.571475 6.5128 1.4484875l-2.8435 2.0679875 3.713 5.123 2.867 0.9165v-2.9845Z" strokeWidth="0.25"></path>
        <path fill="#00b9f1" d="m7.382275 8.639475 -6.0159975 -1.9505 -1.081 3.337 6.0159975 1.974 2.8435 -0.94 -1.7625 -2.4205Z" strokeWidth="0.25"></path>
        <path fill="#00b9f1" d="m14.855225 12.9165 1.7625 2.4205 6.016 1.9505 1.081 -3.337L17.698725 12 -2.8435 0.9165Z" strokeWidth="0.25"></path>
        <path fill="#d63aff" d="m17.698725 11.999975 6.016 -1.974 -1.081 -3.337 -6.016 1.9505 -1.7625 2.4205 2.8435 0.94Z" strokeWidth="0.25"></path>
        <path fill="#d63aff" d="M6.301275 12 0.2852775 13.9505l1.081 3.337 6.0159975 -1.9505 1.7625 -2.4205L6.301275 12Z" strokeWidth="0.25"></path>
        <path fill="#fb015b" d="M7.3823 15.337 3.6693 20.46l2.8435 2.068 3.7365 -5.123V14.4205l-2.867 0.9165Z" strokeWidth="0.25"></path>
        <path fill="#fb015b" d="m16.617675 8.639475 3.713 -5.123 -2.8435 -2.0679875 -3.713 5.1229875v2.9845l2.8435 -0.9165Z" strokeWidth="0.25"></path>

      </svg>

    ),
    name: "JWT Tokens",
    description: "JWT tokens were implemented for secure user authentication, providing stateless sessions that scale efficiently across multiple servers. The cross-domain compatibility of JWT allowed seamless integration between frontend and backend services while maintaining security standards. I configured proper token expiration and refresh mechanisms to balance security and user convenience throughout the authentication flow."
  },
  {
    icon: (
      <svg className="h-8 w-8" display="block" role="presentation" viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg" id="230458935"><path d="M 0 6 C 0 2.686 2.686 0 6 0 L 29 0 C 32.314 0 35 2.686 35 6 L 35 29 C 35 32.314 32.314 35 29 35 L 6 35 C 2.686 35 0 32.314 0 29 Z" fill="var(--m5zs3g, var(--token-9913619f-76ec-4fff-b5d9-aef25028820c, rgb(254, 246, 42)))" height="35px" id="WHbkZu4LB" width="35px"></path><path d="M 9.587 0 L 4.57 9 L 0 9 L 3.917 1.972 C 4.524 0.883 6.039 0 7.301 0 Z M 20.794 2.25 C 20.794 1.007 21.817 0 23.079 0 C 24.341 0 25.364 1.007 25.364 2.25 C 25.364 3.493 24.341 4.5 23.079 4.5 C 21.817 4.5 20.794 3.493 20.794 2.25 Z M 10.443 0 L 15.013 0 L 9.997 9 L 5.427 9 Z M 15.841 0 L 20.411 0 L 16.494 7.028 C 15.887 8.117 14.372 9 13.11 9 L 10.825 9 Z" fill="var(--b5lzrg, var(--token-04d93255-d6ab-4bbc-a194-71e004214fb0, rgb(12, 16, 18)))" height="9px" id="mGV8bx2Ew" transform="translate(5 13)" width="25.363635327216727px"></path></svg>
    ),
    name: "Framer Motion",
    description: "Framer Motion enabled me to create smooth, performant animations that enhance user engagement and provide visual feedback throughout the interface. The declarative API made it straightforward to implement complex animations while keeping the code clean and maintainable. I utilized Framer Motion's performance optimizations to ensure animations run smoothly even on lower-end devices without compromising user experience."
  },
  {
    icon: (
      <div className="h-8 w-8 relative">
        <Image
          src="/nodemailer.webp"
          alt="Nodemailer"
          fill
          className="object-cover"
          priority
          sizes="32px"
        />
      </div>
    ),
    name: "Nodemailer",
    description: "Nodemailer was integrated to handle all email-sending functionality, including user registration confirmations, password resets, and notification emails. I configured multiple transport options including SMTP to ensure reliable email delivery across different email providers and services. The library's support for HTML templates and file attachments allowed me to create professional, branded email communications that enhance user engagement."
  },
  {
    icon: (
      <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="m19.01 11.55-7.46 7.46c-.46.46-.46 1.19 0 1.65a1.16 1.16 0 0 0 1.64 0l7.46-7.46c.46-.46.46-1.19 0-1.65s-1.19-.46-1.65 0ZM19.17 3.34c-.46-.46-1.19-.46-1.65 0L3.34 17.52c-.46.46-.46 1.19 0 1.65a1.16 1.16 0 0 0 1.64 0L19.16 4.99c.46-.46.46-1.19 0-1.65Z" className="b"></path>
      </svg>
    ),
    name: "shadcn/ui",
    description: "shadcn/ui provided a collection of beautifully designed, accessible components that I customized to create a consistent and professional user interface. The component-based architecture allowed me to build complex UI elements quickly while maintaining full control over styling and functionality. I leveraged shadcn/ui's Radix UI primitives to ensure proper accessibility standards and keyboard navigation throughout the application."
  }
];

export function TechStackSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: {
      y: 50,
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-4">
            Built with Modern Tech Stack
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Carefully selected technologies that ensure performance, security, and developer experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              variants={cardVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: {
                  duration: 0.2,
                  ease: "easeOut"
                }
              }}
              whileTap={{
                scale: 0.98,
                transition: {
                  duration: 0.1,
                  ease: "easeOut"
                }
              }}
            >
              <Card className="group relative h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="text-gray-700 dark:text-gray-300 flex items-center justify-center">
                      {tech.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {tech.name}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true }}
                    className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                  >
                    {tech.description}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
