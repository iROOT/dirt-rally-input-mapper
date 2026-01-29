# 🏎️ DiRT Rally Input Mapper

A modern, web-based tool designed to create, edit, and fix custom ActionMap XML files for the original **DiRT Rally** (2015).

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://iroot.github.io/dirt-rally-input-mapper/)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-cyan)

## 🧐 Why this tool?

The original *DiRT Rally* is an excellent simulator, but its input system has aged poorly. Sim racers often face these issues:
*   **Device Limits:** The game struggles when multiple USB devices are connected (Wheel + Pedals + Handbrake + Shifter + Button Box).
*   **Lost Bindings:** If Windows changes the USB ID of a device, the game forgets the configuration.
*   **Complex Axes:** Setting up specific axis modes (like `biDirLower` for steering vs `uniDirPos` for pedals) via the in-game UI can be buggy or impossible.

This tool uses the modern **Web Gamepad API** to detect your connected controllers directly in the browser, allowing you to map them visually and generate a clean, compatible `.xml` file that the game understands perfectly.

## ✨ Features

*   **Multi-Device Support:** Detects wheels, pedals, shifters, and button boxes simultaneously.
*   **Visual Binding:** Click "Bind", press a button or move an axis on your controller.
*   **Device Reordering:** Drag and drop devices to set their priority (Device 0, Device 1, etc.) to match the game's logic.
*   **Advanced Calibration:**
    *   `biDirLower`/`biDirUpper`: Perfect for split-axis steering inputs.
    *   `uniDirPos`: Standard for pedals and handbrakes.
*   **Save/Load Projects:** Save your work as a JSON project file to edit later without rebinding everything.
*   **Import Existing XML:** Upload an existing DiRT Rally XML to view or edit bindings.
*   **Multi-Language:** Supports English, Russian, French, Italian, German, Spanish, and Portuguese (BR).
*   **Dark/Light Mode:** Automatic system detection or manual toggle.

## 🚀 How to Use (For Gamers)

1.  **Open the App:** [Click here to launch the Web Mapper](https://iroot.github.io/dirt-rally-input-mapper/)
2.  **Connect Devices:** Ensure all your sim racing gear is connected. Press a button on each device to "wake it up" so the browser detects it.
3.  **Select Devices:** In the left sidebar, select the devices you want to use.
    *   *Tip:* Use the "Move Up/Down" arrows to change device priority if necessary.
4.  **Bind Actions:** Scroll through the list (Driving, Gears, Camera, etc.). Click **BIND**, then press the corresponding button or axis on your rig.
5.  **Download XML:** Click the **DOWNLOAD XML** button in the header.
6.  **Install:**
    *   Rename the downloaded file to something like `custom_input.xml` (or replace an existing preset like `lg_g27.xml` if you want to override it).
    *   Move the file to your game installation folder:
        `...\Steam\steamapps\common\DiRT Rally\input\`
    *   Launch the game, go to **Controls**, and select the preset corresponding to the file you replaced or added.

## 🛠️ Installation (For Developers)

If you want to run this locally or contribute to the code.

### Prerequisites
*   Node.js (v18 or higher)
*   npm

### Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/iROOT/dirt-rally-mapper.git
    cd dirt-rally-mapper
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` (or the port shown in terminal) to view it in the browser.

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🏗️ Tech Stack

*   **Framework:** React 19
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS v4
*   **Language:** TypeScript
*   **Icons:** Heroicons (SVG)

## ⚠️ Browser Limitations

*   **Device Count:** Most browsers (Chrome, Edge) support up to **4 connected Gamepads** simultaneously via the standard API. If you have more than 4 USB input devices, some might not show up.
*   **Firefox:** May require explicit permission or interaction to detect gamepads properly.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/iROOT/dirt-rally-mapper/issues).

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## ⚖️ Legal Disclaimer

This project is a fan-made, open-source tool created solely for the purpose of helping the community configure input devices for the video game *DiRT Rally*.

*   **Unofficial:** This project is **not** affiliated with, endorsed by, sponsored by, or approved by Codemasters Software Company Limited or Electronic Arts Inc.
*   **Trademarks:** "DiRT", "DiRT Rally", and related logos are trademarks or registered trademarks of Codemasters/Electronic Arts. They are used in this repository only for identification purposes (Nominative Fair Use) to describe the software's compatibility.
*   **No Warranty:** This software is provided "as is", without warranty of any kind. Use it at your own risk. The author is not responsible for any issues that may arise with your game installation or hardware.