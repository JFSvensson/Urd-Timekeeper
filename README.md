# Urd Timekeeper

Urd Timekeeper is a Pomodoro timer web application that helps you manage your time effectively with work and break intervals.

## Features

- ✅ Pomodoro timer with 25-minute work intervals and 5-minute breaks
- ✅ Start, pause, and resume functionality
- ✅ Circular progress indicator showing remaining time
- ✅ Visual feedback with color-coded sessions (green for work, blue for short break, orange for long break)
- ✅ Session counter tracking completed Pomodoros
- ✅ Notifications when a session is complete
- ✅ Keyboard shortcuts (Space bar to start/pause)
- ✅ Customizable time intervals with persistent settings
- ✅ Clean, modern UI with smooth animations

## Installation

1. Clone the repo: `git clone https://github.com/JFSvensson/Urd-Timekeeper`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Usage

Visit `http://localhost:5173` in your web browser to use Urd Timekeeper.

## Overlay Mode for Video Production

Urd Timekeeper includes a special **overlay mode** designed for creating ambient Pomodoro focus videos for YouTube and other platforms. The overlay displays only a minimalist animated circle with transparent background, perfect for layering over ambient footage in video editing software.

### Quick Start

1. **Development mode**: `http://localhost:5174/overlay.html?work=50&break=10`
2. **Production build**: Build once with `npm run build`, then serve with `npm run serve`

### Query Parameters

- `work=50` - Work session duration in minutes (default: 50)
- `break=10` - Break session duration in minutes (default: 10)

### Features

- 🎨 **Soft pastel colors**: Work (soft blue), Short break (soft peach), Long break (soft purple)
- 📐 **Compact 200×200px circle** - Perfect for corner placement
- 🎭 **Fully transparent background** - Ready for video compositing
- 🔄 **Auto-cycling sessions** - Continuous loop with 5-second delays
- 📍 **Centered positioning**: Circle stays centered throughout recording (reposition in your video editor)

### Recording Methods

#### Method 1: OBS Studio (Recommended - Free)

**Why OBS?** Professional screen recording with native transparency support, widely used by content creators.

1. **Download and install**: [OBS Studio](https://obsproject.com/) (free and open source)

2. **Create new scene** in OBS

3. **Add Browser Source**:
   - Click **"+"** under Sources → Select **"Browser"**
   - **URL**: `http://localhost:5174/overlay.html?work=50&break=10`
   - **Width**: `1920`
   - **Height**: `1080`
   - **FPS**: Match your target video frame rate (usually 30 or 60)
   - ✅ **Uncheck** "Shutdown source when not visible"
   - Leave Custom CSS empty

4. **Configure recording settings**:
   - Go to **Settings** → **Output** → **Recording**
   - **Recording Format**: **MOV** (supports alpha channel/transparency)
   - **Encoder**: **Apple ProRes 4444** (best quality, preserves transparency)
   - Alternative: **WebM** with **VP9 codec** (smaller file size, requires more CPU)

5. **Record**:
   - Click **"Start Recording"**
   - Let it run for 2-3 hours (or longer for extended ambient videos)
   - Click **"Stop Recording"** when done
   - File saved to your Videos folder by default

**ProRes vs WebM:**

- **ProRes 4444**: Larger files (~50GB/hour), best quality, native Premiere Pro support, preserves transparency perfectly
- **WebM VP9**: Smaller files (~2GB/hour), good quality, requires VP9 codec in Premiere Pro, excellent compression

---

#### Method 2: Chrome with Transparency Flags

**Why this method?** Direct browser capture with built-in transparency support.

1. **Start Chrome with transparency enabled**:

   Windows (PowerShell):

   ```powershell
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --enable-transparent-visuals --disable-gpu
   ```

   macOS (Terminal):

   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --enable-transparent-visuals --disable-gpu
   ```

2. **Open overlay URL**:

   ```
   http://localhost:5174/overlay.html?work=50&break=10&position=top-right
   ```

3. **Enter fullscreen**: Press **F11** (Windows) or **Cmd+Shift+F** (macOS)

4. **Record with OBS**:
   - Add **"Window Capture"** source instead of Browser Source
   - Select the Chrome window
   - ✅ Check **"Capture Cursor"**: OFF (recommended)
   - Use same recording settings as Method 1

**Note**: This method gives you more control over browser rendering but requires manual Chrome restart with flags each time.

---

#### Method 3: Static Build (Best for Long Recordings)

**Why this method?** No server needed, works offline, never times out - perfect for multi-hour recordings.

**The Problem with Dev Server**: Vite dev server (`http://localhost:5174`) automatically shuts down after inactivity or when you close the terminal. This is problematic for 2-3 hour recording sessions.

**The Solution**: Build a static version and serve it with a simple local server.

1. **Build the project once**:

   ```bash
   npm run build
   ```

   This creates a `dist/` folder with standalone HTML/CSS/JS files.

2. **Serve the dist folder with a local server**:

   **Option A - Using Python (Built-in on most systems)**:

   ```bash
   cd dist
   python -m http.server 8000
   ```

   Then open: `http://localhost:8000/overlay.html?work=50&break=10&position=top-right`

   **Option B - Using Node.js http-server**:

   ```bash
   npx http-server dist -p 8000 --cors
   ```

   Then open: `http://localhost:8000/overlay.html?work=50&break=10&position=top-right`

   **Option C - Using npm script (Recommended)**:

   ```bash
   npm run serve
   ```

   (This runs the included serve script from package.json)
   Then open the URL shown in terminal.

3. **Use in OBS Browser Source**:
   - Add Browser Source in OBS
   - **URL**: `http://localhost:8000/overlay.html?work=50&break=10&position=top-right`
   - **Width**: 1920, **Height**: 1080
   - Same recording settings as Method 1

**Why not file:// URLs?**
Modern browsers block ES modules from `file://` protocol for security reasons (CORS policy). You'll get errors like "Cross-Origin request blocked" or "Module source URI is not allowed". Using `http://localhost` solves this.

**Advantages of Static Build Method**:

- ✅ **Stable and persistent** - Server runs until you stop it manually
- ✅ **Lightweight** - No dev server overhead, just static file serving
- ✅ **Works offline** - No internet required after build
- ✅ **Consistent performance** - No hot-reload or file watching
- ✅ **Portable** - Copy `dist/` folder to any computer and serve it

**When to rebuild**:
Only rebuild (`npm run build`) if you change timer settings or code. For normal recording, build once and reuse the same dist folder.

---

### Using Recorded Video in Premiere Pro

1. **Import the recorded video**:
   - File → Import → Select your `.mov` or `.webm` file
   - ProRes 4444 or WebM VP9 will have transparency embedded

2. **Add to timeline**:
   - Drag the overlay video to a track **above** your ambient footage
   - The timer circle will appear over your background automatically

3. **Adjust if needed**:
   - Use **Effect Controls** → **Motion** to reposition or scale
   - Add effects like glow, drop shadow, or color grading to the timer layer

4. **Export settings**:
   - Use **H.264** or **H.265** for YouTube upload
   - Make sure to enable **Maximum Render Quality** for best results

### Tips for Best Results

- 🎬 **Record longer than needed**: Aim for 2-3 hours minimum to give yourself editing flexibility
- ✅ **Test before long recordings**: Run for 2-3 minutes first to verify circle animates correctly
- 🔋 **Disable sleep mode**: Prevent computer from sleeping during recording
- 💾 **Check disk space**: ProRes 4444 uses ~50GB per hour, WebM ~2GB per hour
- 🎨 **Experiment with positions**: Try different `position` parameters for varied video layouts
- ⏱️ **Custom durations**: Adjust `work` and `break` times for different Pomodoro intervals (e.g., `?work=25&break=5` for classic 25/5 Pomodoro)

### Troubleshooting

**Circle doesn't animate:**

- Refresh the page and wait 5 seconds for auto-start
- Check browser console for errors (F12)

**Transparency not working in OBS:**

- Verify Recording Format is MOV (not MP4)
- Use ProRes 4444 or WebM VP9 encoder
- Check that "Shutdown source when not visible" is disabled

**Dev server keeps shutting down:**

- Use Method 3 (static build) instead
- Keep the terminal window open during recording

**CORS errors with file:// URLs:**

- Cannot use `file://` protocol with modern JavaScript modules
- Use `http://localhost` instead (see Method 3)
- Python: `python -m http.server 8000` in dist folder
- Node: `npx http-server dist -p 8000`

## Future Features

- [ ] Sound notifications
- [ ] Integrated task list
- [ ] Statistics and reports
- [ ] Theme toggle (light/dark mode)
- [ ] Multi-language support
- [ ] Browser notifications API
- [ ] Export session history

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to the project.

## License

This project is licensed under two licenses:

1. For open source use, Urd Timekeeper is licensed under the terms of the MIT License, see the [LICENSE](LICENSE) file for details.

2. For commercial use, please contact the developer to discuss a commercial license.
