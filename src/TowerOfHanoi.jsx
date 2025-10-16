import React, { useState, useEffect, useCallback, useRef } from 'react';

const TowerOfHanoi = () => {
  // State management
  const [n, setN] = useState(3);
  const [inputN, setInputN] = useState('3');
  const [towers, setTowers] = useState([[], [], []]);
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [animatingDisk, setAnimatingDisk] = useState(null);
  const [highlightedPegs, setHighlightedPegs] = useState([]);
  const [inputError, setInputError] = useState('');

  const animationRef = useRef(null);
  const timeoutRef = useRef(null);

  // Disk colors for visual distinction
  const diskColors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
    'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400',
    'bg-teal-400', 'bg-cyan-400', 'bg-lime-400', 'bg-rose-400'
  ];

  // Generate all moves using recursive algorithm
  const generateMoves = useCallback((n, source = 0, destination = 2, auxiliary = 1) => {
    if (n === 1) {
      return [{ from: source, to: destination, disk: 1 }];
    }
    
    const moves = [];
    // Move n-1 disks from source to auxiliary
    moves.push(...generateMoves(n - 1, source, auxiliary, destination));
    // Move the largest disk from source to destination
    moves.push({ from: source, to: destination, disk: n });
    // Move n-1 disks from auxiliary to destination
    moves.push(...generateMoves(n - 1, auxiliary, destination, source));
    
    return moves;
  }, []);

  // Initialize towers with n disks
  const initializeTowers = useCallback(() => {
    const newTowers = [[], [], []];
    for (let i = n; i >= 1; i--) {
      newTowers[0].push(i);
    }
    setTowers(newTowers);
    
    const allMoves = generateMoves(n);
    setMoves(allMoves);
    setCurrentMoveIndex(-1);
    setIsInitialized(true);
    setIsPlaying(false);
    setAnimatingDisk(null);
    setHighlightedPegs([]);
  }, [n, generateMoves]);

  // Validate input
  const handleInputChange = (value) => {
    setInputN(value);
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 12) {
      setInputError('Please enter a number between 1 and 12');
    } else {
      setInputError('');
    }
  };

  // Start/Generate button handler
  const handleStart = () => {
    const num = parseInt(inputN);
    if (num >= 1 && num <= 12) {
      setN(num);
      setInputError('');
    }
  };

  // Apply a move to the towers
  const applyMove = useCallback((move, reverse = false) => {
    setTowers(prevTowers => {
      const newTowers = prevTowers.map(tower => [...tower]);
      const fromTower = reverse ? move.to : move.from;
      const toTower = reverse ? move.from : move.to;
      
      const disk = newTowers[fromTower].pop();
      newTowers[toTower].push(disk);
      
      return newTowers;
    });
  }, []);

  // Animation function for disk movement
  const animateMove = useCallback((move, onComplete) => {
    const fromTower = move.from;
    const toTower = move.to;
    
    setHighlightedPegs([fromTower, toTower]);
    setAnimatingDisk({ ...move, phase: 'lift' });
    
    // Simulate animation phases: lift -> move -> drop
    setTimeout(() => {
      setAnimatingDisk({ ...move, phase: 'move' });
      setTimeout(() => {
        setAnimatingDisk({ ...move, phase: 'drop' });
        setTimeout(() => {
          setAnimatingDisk(null);
          setHighlightedPegs([]);
          onComplete();
        }, 200 / speed);
      }, 300 / speed);
    }, 200 / speed);
  }, [speed]);

  // Step forward
  const stepForward = useCallback(() => {
    if (currentMoveIndex < moves.length - 1) {
      const nextMove = moves[currentMoveIndex + 1];
      animateMove(nextMove, () => {
        applyMove(nextMove);
        setCurrentMoveIndex(prev => prev + 1);
      });
    }
  }, [currentMoveIndex, moves, animateMove, applyMove]);

  // Step backward
  const stepBackward = useCallback(() => {
    if (currentMoveIndex >= 0) {
      const prevMove = moves[currentMoveIndex];
      animateMove({ ...prevMove, from: prevMove.to, to: prevMove.from }, () => {
        applyMove(prevMove, true);
        setCurrentMoveIndex(prev => prev - 1);
      });
    }
  }, [currentMoveIndex, moves, animateMove, applyMove]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !animatingDisk) {
      if (currentMoveIndex < moves.length - 1) {
        timeoutRef.current = setTimeout(() => {
          stepForward();
        }, 500 / speed);
      } else {
        setIsPlaying(false);
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentMoveIndex, moves.length, stepForward, speed, animatingDisk]);

  // Initialize on n change
  useEffect(() => {
    if (n) {
      initializeTowers();
    }
  }, [n, initializeTowers]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isInitialized && !animatingDisk) {
            setIsPlaying(prev => !prev);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (isInitialized && !isPlaying && !animatingDisk) {
            stepForward();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (isInitialized && !isPlaying && !animatingDisk) {
            stepBackward();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isInitialized, isPlaying, animatingDisk, stepForward, stepBackward]);

  // Reset function
  const handleReset = () => {
    setIsPlaying(false);
    initializeTowers();
  };

  // Calculate expected moves
  const expectedMoves = Math.pow(2, n) - 1;

  // Get current move description
  const getCurrentMoveDescription = () => {
    if (currentMoveIndex >= 0 && currentMoveIndex < moves.length) {
      const move = moves[currentMoveIndex];
      const pegNames = ['A', 'B', 'C'];
      return `Move ${currentMoveIndex + 1}: from ${pegNames[move.from]} → ${pegNames[move.to]}`;
    }
    return 'Ready to start';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tower of Hanoi</h1>
          <p className="text-gray-600">
            Move all disks from the left peg to the right peg. Only one disk at a time, and never place a larger disk on a smaller one.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Input Section */}
            <div>
              <label htmlFor="disk-count" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Disks (1-12)
              </label>
              <div className="flex gap-2">
                <input
                  id="disk-count"
                  type="number"
                  min="1"
                  max="12"
                  value={inputN}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    inputError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-describedby={inputError ? 'input-error' : undefined}
                />
                <button
                  onClick={handleStart}
                  disabled={!!inputError || !inputN}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  aria-label="Generate new puzzle"
                >
                  Generate
                </button>
              </div>
              {inputError && (
                <p id="input-error" className="text-red-500 text-sm mt-1" role="alert">
                  {inputError}
                </p>
              )}
            </div>

            {/* Playback Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Playback</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={!isInitialized || animatingDisk}
                  className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button
                  onClick={stepBackward}
                  disabled={!isInitialized || isPlaying || currentMoveIndex < 0 || animatingDisk}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  aria-label="Step backward"
                >
                  ⏮️
                </button>
                <button
                  onClick={stepForward}
                  disabled={!isInitialized || isPlaying || currentMoveIndex >= moves.length - 1 || animatingDisk}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  aria-label="Step forward"
                >
                  ⏭️
                </button>
                <button
                  onClick={handleReset}
                  disabled={!isInitialized || animatingDisk}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  aria-label="Reset puzzle"
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Speed Control */}
            <div>
              <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-700 mb-2">
                Speed: {speed}x
              </label>
              <input
                id="speed-slider"
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
                aria-label="Animation speed"
              />
            </div>

            {/* Move Counter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
              <div className="text-sm text-gray-600">
                <div>Moves: {Math.max(0, currentMoveIndex + 1)} / {expectedMoves}</div>
                <div className="text-xs">{getCurrentMoveDescription()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Controls:</h3>
          <div className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>• Spacebar: Play/Pause</div>
            <div>• Arrow Left: Step Back</div>
            <div>• Arrow Right: Step Forward</div>
          </div>
        </div>

        {/* Game Board */}
        {isInitialized && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-8 md:gap-16">
                {towers.map((tower, pegIndex) => (
                  <div key={pegIndex} className="flex flex-col items-center">
                    {/* Peg Label */}
                    <div className="text-lg font-semibold mb-2 text-gray-700">
                      {['A', 'B', 'C'][pegIndex]}
                    </div>
                    
                    {/* Peg */}
                    <div className="relative">
                      <div 
                        className={`w-2 bg-gray-400 rounded-t transition-colors duration-200 ${
                          highlightedPegs.includes(pegIndex) ? 'bg-yellow-400' : ''
                        }`}
                        style={{ height: `${Math.max(200, n * 25)}px` }}
                      />
                        
                      {/* Base */}
                      <div className="w-32 h-4 bg-gray-600 rounded -ml-15 mt-0" />
                      
                      {/* Disks */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        {tower.slice().reverse().map((diskSize, visualIndex) => {
                          const width = 20 + diskSize * 8;
                          const isAnimating = animatingDisk && 
                            animatingDisk.disk === diskSize && 
                            (animatingDisk.from === pegIndex || animatingDisk.to === pegIndex);
                          
                          return (
                            <div
                              key={`${pegIndex}-${diskSize}`}
                              className={`h-6 rounded transition-all duration-300 relative ${
                                diskColors[diskSize - 1]
                              } ${isAnimating ? 'opacity-50 transform scale-105' : ''}`}
                              style={{
                                width: `${width}px`,
                                marginLeft: `-${width / 2}px`,
                                marginBottom: visualIndex > 0 ? '2px' : '0',
                                zIndex: 5
                              }}
                            >
                              {/* Hole in the middle of disk for peg */}
                              <div 
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-50 h-full w-3 rounded"
                                style={{ zIndex: 6 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TowerOfHanoi;