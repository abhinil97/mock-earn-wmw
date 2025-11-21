import { useState } from 'react'
import { Button } from './components/ui/button.tsx'
import { Header } from './components/Header.tsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Vite + React + TypeScript + shadcn/ui
          </h1>
          <div className="card">
            <Button
              size="lg"
              onClick={() => setCount((count) => count + 1)}
            >
              count is {count}
            </Button>
            <p className="mt-4 text-muted-foreground">
              Edit <code className="bg-muted px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
            </p>
          </div>
          <p className="text-muted-foreground">
            Using shadcn/ui Button component with Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
