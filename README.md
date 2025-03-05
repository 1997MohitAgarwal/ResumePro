Overview
The ResumeReview application is a single-page React application (SPA) designed to upload, parse, and analyze PDF resumes using AI, with an interactive chat interface for follow-up questions. The architecture follows a client-side, component-based approach with external API integration.

Components
##Navbar:
A static, reusable UI component displaying the app’s branding (logo and name).
Purpose: Provides a consistent header across the app.
Structure: Simple functional component with no state or logic.

##ResumeReview (Main Component):
The core component handles file uploads, PDF parsing, AI analysis, and chat functionality.

--Structure:
State Management: Uses React hooks (useState, useEffect, useRef) to manage UI state and side effects.

--Subsections:
 a)File Upload UI: Drag-and-drop input for PDF files.
 b)Loading Indicator: Displays analysis progress.
 c)Analysis Display: This shows structured AI output.
 d)Chat Interface: Allows user interaction with the AI.
 
##Data Flow
 a)User Input: The user uploads a PDF resume using the file input.
 b)PDF Parsing: Client-side pdfjs-dist extracts text from the PDF.
 c)AI Analysis: The Text is sent to OpenAI’s API, which returns structured feedback.
 d)Rendering: Feedback is parsed and displayed; chat messages are managed and rendered.
 e)Chat Interaction: User questions are sent to the API with resume context, and responses are appended to the chat.
 f)OpenAI API: Provides AI-powered resume analysis and chat responses.
 g)HTTP Requests: fetch API handles communication with OpenAI’s /v1/chat/completions endpoint.

Technologies Used
1)React:
 Purpose: Frontend framework for building the SPA.
 Features Used: Hooks (useState, useEffect, useRef), functional components.
2)pdfjs-dist:
 Purpose: Client-side PDF parsing to extract text from resumes.
3)OpenAI API:
 Model: gpt-4o-mini
 Purpose: Analyze resume text and respond to chat queries.
4)Lucide React:
 Purpose: Provides lightweight, customizable SVG icons (e.g., UploadCloud, Loader).
5)Tailwind CSS:
 Purpose: Utility-first CSS framework for rapid, responsive styling.
6)JavaScript (ES6+):
 Purpose: To implement functionalities.
7)Fetch API:
 Purpose: Native browser API for making HTTP requests to OpenAI.
