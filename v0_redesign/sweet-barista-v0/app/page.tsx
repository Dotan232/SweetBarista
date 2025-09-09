"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"

interface Cup {
  id: string
  name: string
  required: number
  current: number
  x: number
  completed: boolean
}

interface SugarCube {
  id: string
  x: number
  y: number
  falling: boolean
}

interface Level {
  level: number
  difficulty: string
  timeLimit: number
  cups: Omit<Cup, "x" | "completed" | "current">[]
  speed: number
}

const LEVELS: Level[] = [
  {
    level: 1,
    difficulty: "TUTORIAL",
    timeLimit: 60,
    speed: 1,
    cups: [
      { id: "1", name: "Tom", required: 1 },
      { id: "2", name: "Anna", required: 2 },
      { id: "3", name: "Lily", required: 1 },
    ],
  },
  {
    level: 2,
    difficulty: "EASY",
    timeLimit: 45,
    speed: 1.5,
    cups: [
      { id: "1", name: "David", required: 2 },
      { id: "2", name: "Mia", required: 1 },
      { id: "3", name: "Alex", required: 3 },
      { id: "4", name: "Sara", required: 2 },
    ],
  },
  {
    level: 3,
    difficulty: "EASY",
    timeLimit: 40,
    speed: 2,
    cups: [
      { id: "1", name: "Maria", required: 2 },
      { id: "2", name: "Lily", required: 1 },
      { id: "3", name: "Max", required: 3 },
      { id: "4", name: "Maria", required: 2 },
      { id: "5", name: "Ben", required: 1 },
    ],
  },
]

export default function SweetBarista() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "completed" | "failed">("menu")
  const [timeLeft, setTimeLeft] = useState(60)
  const [cups, setCups] = useState<Cup[]>([])
  const [sugarCubes, setSugarCubes] = useState<SugarCube[]>([])
  const [handPosition] = useState(50) // Centered at 50%
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastDropTime, setLastDropTime] = useState(0)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  const level = LEVELS[currentLevel]

  // Initialize cups for current level
  useEffect(() => {
    if (level && gameState === "playing") {
      const initialCups = level.cups.map((cup, index) => ({
        ...cup,
        current: 0,
        completed: false,
        x: (index * 200) % 800, // Spread cups across conveyor
      }))
      setCups(initialCups)
      setTimeLeft(level.timeLimit)
      setSugarCubes([])
    }
  }, [currentLevel, gameState, level])

  // Game timer
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("failed")
    }
  }, [gameState, timeLeft])

  // Animation loop for moving cups and sugar cubes
  useEffect(() => {
    if (gameState === "playing") {
      const animate = () => {
        // Move cups
        setCups((prevCups) =>
          prevCups.map((cup) => ({
            ...cup,
            x: (cup.x + level.speed) % 800,
          })),
        )

        // Move and remove sugar cubes
        setSugarCubes(
          (prevCubes) =>
            prevCubes
              .map((cube) => ({
                ...cube,
                y: cube.falling ? cube.y + 4 : cube.y,
              }))
              .filter((cube) => cube.y < 500), // Remove cubes that fall off screen
        )

        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, level.speed])

  // Check for collisions between sugar cubes and cups
  useEffect(() => {
    sugarCubes.forEach((cube) => {
      if (cube.y >= 350 && cube.y <= 400) {
        // Cup collision zone
        cups.forEach((cup) => {
          const cupLeft = cup.x
          const cupRight = cup.x + 80

          if (cube.x >= cupLeft && cube.x <= cupRight && !cup.completed) {
            // Sugar cube hit cup
            setCups((prevCups) =>
              prevCups.map((c) =>
                c.id === cup.id
                  ? {
                      ...c,
                      current: Math.min(c.current + 1, c.required),
                      completed: c.current + 1 >= c.required,
                    }
                  : c,
              ),
            )

            // Remove the sugar cube
            setSugarCubes((prevCubes) => prevCubes.filter((c) => c.id !== cube.id))
          }
        })
      }
    })
  }, [sugarCubes, cups])

  // Check win condition
  useEffect(() => {
    if (gameState === "playing" && cups.length > 0 && cups.every((cup) => cup.completed)) {
      setGameState("completed")
    }
  }, [cups, gameState])

  const dropSugar = useCallback(() => {
    const now = Date.now()
    if (now - lastDropTime < 200) return // Anti-spam: 200ms cooldown

    setLastDropTime(now)
    const newCube: SugarCube = {
      id: `cube-${now}`,
      x: (handPosition / 100) * 800,
      y: 120,
      falling: true,
    }
    setSugarCubes((prev) => [...prev, newCube])
  }, [handPosition, lastDropTime])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState === "playing") {
        e.preventDefault()
        dropSugar()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [dropSugar, gameState])

  const startGame = () => {
    setGameState("playing")
  }

  const pauseGame = () => {
    setGameState(gameState === "paused" ? "playing" : "paused")
  }

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(currentLevel + 1)
      setGameState("playing")
    } else {
      setGameState("menu")
      setCurrentLevel(0)
    }
  }

  const restartLevel = () => {
    setGameState("playing")
  }

  const backToMenu = () => {
    setGameState("menu")
    setCurrentLevel(0)
  }

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-amber-800 mb-2">Sweet Barista</h1>
            <p className="text-amber-600">Perfect your sugar cube precision!</p>
          </div>

          <div className="mb-8">
            <div className="text-6xl mb-4">☕</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Drop sugar cubes into moving coffee cups to fulfill each customer's exact sweetness preferences. Time your
              drops perfectly!
            </p>
          </div>

          <Button onClick={startGame} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg">
            Start Game
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-300 flex flex-col">
      {/* Header */}
      <div className="bg-amber-100 border-b-2 border-amber-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Top row: Level and timer/controls */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-bold text-amber-800">
                Level {level.level} <span className="text-sm font-normal text-amber-600">{level.difficulty}</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-32 bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / level.timeLimit) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-amber-800 min-w-[3ch]">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="border-amber-300"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={pauseGame} className="border-amber-300 bg-transparent">
                  {gameState === "paused" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom row: Cups completed progress */}
          <div className="flex justify-center">
            <div className="bg-amber-50 px-4 py-2 rounded-full border border-amber-200 shadow-sm">
              <span className="text-sm text-amber-700">
                Cups completed:{" "}
                <span className="font-semibold text-amber-800">{cups.filter((c) => c.completed).length}</span> /{" "}
                <span className="font-semibold text-amber-800">{cups.length}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden" ref={gameAreaRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
          {/* Coffee shop atmosphere elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-amber-800 rounded-full blur-3xl"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-orange-700 rounded-full blur-2xl"></div>
            <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-amber-700 rounded-full blur-3xl"></div>
            <div className="absolute bottom-60 right-1/3 w-28 h-28 bg-orange-800 rounded-full blur-2xl"></div>
          </div>

          {/* Subtle coffee bean pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, #8B4513 2px, transparent 2px),
                             radial-gradient(circle at 60% 70%, #A0522D 1.5px, transparent 1.5px),
                             radial-gradient(circle at 80% 20%, #8B4513 1px, transparent 1px)`,
              backgroundSize: "120px 120px, 80px 80px, 60px 60px",
            }}
          />

          {/* Warm lighting effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-orange-100/20"></div>
        </div>

        {/* Barista Hand */}
        <div
          className="absolute top-8 z-20 transition-all duration-200"
          style={{ left: `${handPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="text-4xl">🤏</div>
        </div>

        {/* Sugar Cubes */}
        {sugarCubes.map((cube) => (
          <div
            key={cube.id}
            className="absolute w-3 h-3 bg-white border border-gray-300 rounded-sm shadow-sm z-10 transition-all duration-75"
            style={{
              left: `${(cube.x / 800) * 100}%`,
              top: `${cube.y}px`,
              transform: "translateX(-50%)",
            }}
          />
        ))}

        {/* Drop Button for Mobile */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 md:hidden">
          <Button
            onClick={dropSugar}
            disabled={gameState !== "playing"}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg rounded-full shadow-lg"
          >
            Drop Sugar
          </Button>
        </div>

        {/* Conveyor Belt Area */}
        <div className="absolute bottom-0 left-0 right-0 h-48">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-200 via-orange-100 to-transparent"></div>

          <div className="absolute bottom-16 left-0 right-0 h-12 bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 border-t-2 border-gray-500 border-b-2 border-gray-900 shadow-lg">
            {/* Conveyor belt texture */}
            <div className="h-full bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />
            {/* Belt segments for realistic look */}
            <div
              className="absolute inset-0 bg-repeating-linear-gradient bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600"
              style={{ backgroundSize: "40px 100%" }}
            />
          </div>

          {/* Coffee Cups */}
          {cups.map((cup) => {
            const getCupSize = (required: number) => {
              if (required === 1) return "small"
              if (required === 2) return "medium"
              return "large"
            }

            const cupSize = getCupSize(cup.required)
            const cupImage = `/images/cup-${cupSize}.png`

            return (
              <div
                key={cup.id}
                className="absolute bottom-28 transition-all duration-75"
                style={{
                  left: `${(cup.x / 800) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="relative w-16 h-12">
                    <img src="/images/order-note.png" alt="Order note" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center pt-1">
                      <span className="text-xs font-medium text-gray-800 text-center leading-tight">{cup.name}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={cupImage || "/placeholder.svg"}
                    alt={`Coffee cup for ${cup.name}`}
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />

                  {/* Progress Indicators */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {Array.from({ length: cup.required }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full border shadow-sm ${
                          i < cup.current ? "bg-green-400 border-green-500" : "bg-gray-200 border-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Completion Checkmark */}
                  {cup.completed && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="absolute top-20 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm max-w-xs">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Desktop:</span> Press SPACEBAR to drop sugar
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Mobile:</span> Tap the Drop Sugar button
          </p>
        </div>

        {/* Pause Overlay */}
        {gameState === "paused" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
            <Card className="p-6 text-center bg-white/95 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Game Paused</h3>
              <Button onClick={pauseGame} className="bg-amber-600 hover:bg-amber-700">
                Resume
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Game Over Modals */}
      {(gameState === "completed" || gameState === "failed") && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <Card className="p-8 text-center bg-white/95 backdrop-blur-sm max-w-md">
            {gameState === "completed" ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Level Complete!</h3>
                <p className="text-gray-600 mb-6">Great job! All customers are satisfied with their perfect coffee.</p>
                <div className="flex gap-3">
                  <Button onClick={nextLevel} className="flex-1 bg-green-600 hover:bg-green-700">
                    {currentLevel < LEVELS.length - 1 ? "Next Level" : "Play Again"}
                  </Button>
                  <Button onClick={backToMenu} variant="outline" className="flex-1 bg-transparent">
                    Menu
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Time's Up!</h3>
                <p className="text-gray-600 mb-6">The coffee shop rush was too much this time. Try again!</p>
                <div className="flex gap-3">
                  <Button onClick={restartLevel} className="flex-1 bg-amber-600 hover:bg-amber-700">
                    Try Again
                  </Button>
                  <Button onClick={backToMenu} variant="outline" className="flex-1 bg-transparent">
                    Menu
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
