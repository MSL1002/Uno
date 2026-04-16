# UNO

A modern implementation of the classic UNO card game built with React and Vite. Created as my first software project in my Principles of SE class.

## Requirements

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **OS**: Windows, macOS, or Linux
- **Browser**: Any modern browser (Chrome, Firefox, Safari, Edge)

### Project Dependencies
- React 19.x
- Vite 8.x
- React Router 7.x
- Sass 1.x

## Installation & Setup

### Step 1: Clone (or Download) the Repository
```bash
# If cloning from git
git clone <repository-url>
```

### Step 2: CD into the game's directery
```bash
cd Uno
```

## Running the Game

### Step 1: Run the start command.
```bash
npm start
```
This command installs dependencies and automatically starts the local server.

### Step 2: Go to the link to localhost provided in the console output
```bash
Local:   http://localhost:XXXX/
```

## Stopping the game

To stop the game, return back to the initial command prompt and press "Ctrl + C".
This will deactivate the server and stop the game from running.

## Usage

1. **Launch the Game**: After running `npm start`, open your browser to the provided URL

2. **Main Menu**: 
   - Enter your player name
   - Select the number of opponents
   - Click "Start Game" to begin

3. **How to Play**: 
   - Click "How to Play" from the main menu to learn the rules and mechanics

4. **During Gameplay**:
   - Click on cards in your hand to play them
   - Match the color or number of the card on the pile
   - Draw cards when you can't play
   - Use special cards strategically to be victorious

## Troubleshooting

**Issue**: Game won't start
- **Solution**: Ensure Node.js is installed. Run `node --version` to check.

**Issue**: Dependencies fail to install
- **Solution**: Clear npm cache and try again:
  ```bash
  npm cache clean --force
  npm start
  ```

**Issue**: Port 5173 is already in use
- **Solution**: Vite will automatically use the next available port, however you can specify a custom port is necissary:
  ```bash
  npm run dev -- --port 3000
  ```