# Tower of Hanoi React Component

A production-ready, interactive Tower of Hanoi visualization built with React and Tailwind CSS.

## Features

- **Interactive Controls**: Play, pause, step forward/backward, reset
- **Customizable**: Support for 1-12 disks with input validation
- **Smooth Animations**: CSS transitions with adjustable speed (0.25x - 4x)
- **Keyboard Controls**: Spacebar (play/pause), arrow keys (step)
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Visual Feedback**: Highlighted pegs during moves, move counter, progress tracking

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Usage

### As a Standalone Component

```jsx
import TowerOfHanoi from './TowerOfHanoi'

function App() {
  return <TowerOfHanoi />
}
```

### Controls

- **Generate**: Initialize puzzle with specified number of disks
- **Play/Pause**: Auto-animate the solution
- **Step Forward/Backward**: Manual step-through
- **Speed Slider**: Adjust animation speed
- **Reset**: Return to initial state

### Keyboard Shortcuts

- `Spacebar`: Toggle play/pause
- `Arrow Left`: Step backward
- `Arrow Right`: Step forward

## Technical Details

### Algorithm
Uses recursive divide-and-conquer to generate the optimal sequence of moves (2^n - 1 total moves).

### Performance
Optimized for up to 12 disks with smooth animations using `requestAnimationFrame` and controlled timeouts.

### Accessibility
- Full keyboard navigation
- ARIA labels for screen readers
- Color-blind friendly disk colors
- Focus management

## Build

```bash
npm run build
```

## Dependencies

- React 18.3+
- Tailwind CSS 3.4+
- Vite (development)

No external animation libraries required - uses native CSS transitions and JavaScript timing.