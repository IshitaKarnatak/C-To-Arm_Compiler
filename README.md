# CrossCraft: ARM Edition
C to ARM Cross Compiler

## Introduction
The C to ARM Cross Compiler project is a comprehensive tool designed to compile C source code into ARM assembly instructions. It facilitates efficient development for embedded systems by bridging the gap between high-level C programming and low-level ARM machine code generation. This project leverages Python for backend compiler components and a modern React-based frontend for an interactive user interface.

## Project Overview
This cross-compiler translates C code into ARM machine code, enabling developers to build applications optimized for ARM-based embedded devices. Its modular design, user-friendly interface, and comprehensive testing framework make it a robust solution for both learning and real-world applications in embedded system development.

## Features
- Supports standard C language features.
- Modular backend architecture including lexer, parser, semantic analysis, and code generation.
- Generates optimized ARM assembly code.
- Interactive frontend built with React and Tailwind CSS.
- Command-line API powered by Flask for backend communication.
- Comprehensive test suite covering lexical, syntactic, and semantic analysis.
- Sample input programs included for testing and demonstration.

## Technologies Used

| ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
|---|---|---|---|
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white) | ![GCC](https://img.shields.io/badge/GCC-D31D00?style=for-the-badge&logo=gnu&logoColor=white) | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white) |

- Python (compiler logic)
- Flask (backend API)
- React and TypeScript (frontend UI)
- Tailwind CSS (frontend styling)
- GCC (ARM compiler tools)
- Git & GitHub (version control)
- Virtual Environment (dependency isolation)

## Project Structure
```text
├── Backend/ # Python backend source code and compiler modules 
│ ├── compiler.py 
│ ├── modules/ 
│ ├── input/ # Sample C input programs 
│ ├── output/ # Generated output files 
│ ├── tests/ # Test cases and expected outputs 
│ └── app.py # Flask app entry point 
├── Frontend/ # React frontend source code 
│ ├── src/ 
│ ├── index.html 
│ └── package.json 
├── .venv/ # Python virtual environment 
├── README.md # Project documentation 
└── ...
```

## Compilation Workflow
1. Write or use existing C source files from the `Backend/input/` directory.
2. Use the backend compiler modules to tokenize, parse, and perform semantic analysis.
3. Generate intermediate representation (IR) and convert it to ARM assembly code.
4. Compile generated assembly using ARM GCC toolchain.
5. Test generated binaries on ARM hardware or emulators.

## How to Run

### Clone Repo 
```bash
  git clone <https://github.com/Ayush-2404/C-to-Arm_Compiler.git>
  cd project-root
```

### Backend
1. Create and activate the virtual environment:
#### Create virtual environment
```bash
python -m venv .venv
```

#### Activate virtual environment
On Linux/Mac:
```bash
source .venv/bin/activate
```

On Windows (Command Prompt):
```bash
.venv\Scripts\activate
```

On Windows (PowerShell):
```bash
.venv\Scripts\Activate.ps1
```

2. 2. Install required dependencies:

```bash
  pip install -r requirements.txt
```

3. Run the Flask backend server:

```bash
  python app.py
```

### Frontend
1. Navigate to the Frontend directory: 

```bash
  cd Frontend
```

2. Install frontend dependencies:

```bash
  npm install
```

3. Start the development server:

```bash
  npm run dev
```

4. Open the browser and visit `http://localhost:3000` to access the UI.

## Testing
Tests are available in the `Backend/tests/` directory. Run the backend test script to validate functionality:

```bash
  python run_tests.py
```

## Acknowledgments
- GNU Compiler Collection (GCC)
- React and Tailwind CSS communities
- Python open source ecosystem
