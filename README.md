# Ren'Py Visual Editor

A visual editor for creating Ren'Py visual novel scripts with real-time preview and code generation.

## Features

- **Visual Script Editor**: Drag-and-drop interface for creating Ren'Py scripts
- **Character Management**: Define characters with custom names and colors
- **Real-time Preview**: See how your visual novel will look as you edit
- **Code Generation**: Automatically generate Ren'Py script code
- **Export Functionality**: Copy or download your script as a .rpy file

## Supported Ren'Py Elements

- **Dialogue**: Character dialogue and narration
- **Scenes**: Background images with transitions
- **Characters**: Show/hide character sprites with positions
- **Menus**: Interactive choices for players
- **Labels & Jumps**: Navigation between script sections
- **Audio**: Background music and sound effects
- **Variables**: Set and manage game variables
- **Transitions**: Various visual effects (fade, dissolve, etc.)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/renpy-visual-editor.git
cd renpy-visual-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Visual Editor Tab
- **Add Elements**: Use the toolbar to add dialogue, scenes, characters, menus, etc.
- **Edit Elements**: Click on any element in the list to edit its properties
- **Reorder**: Drag and drop elements to reorder them
- **Character Setup**: Define your characters in the left panel

### 2. Preview Tab
- Click the play button to preview your visual novel
- Use controls to pause, restart, or skip through the script
- Make choices in menus to test branching paths

### 3. Code View Tab
- View the generated Ren'Py code
- Copy the code to clipboard
- Download as a .rpy file for use in Ren'Py

## Script Elements

### Dialogue
```renpy
character "This is dialogue text"
"This is narrator text"
```

### Scenes and Backgrounds
```renpy
scene bg room with fade
```

### Character Sprites
```renpy
show eileen happy at center with dissolve
hide eileen with moveoutright
```

### Menus and Choices
```renpy
menu:
    "Choice 1":
        "Result of choice 1"
    "Choice 2":
        "Result of choice 2"
```

## Tips

- Start with defining your characters before adding dialogue
- Use labels to organize different sections of your script
- Test your script frequently using the Preview tab
- The generated code is compatible with standard Ren'Py projects

## Limitations

- Asset management (images/audio) requires manual file placement
- Some advanced Ren'Py features may not be supported
- Python blocks and complex conditions have limited support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.