// import React from "react"

import AppRoutes from "./routes/AppRoutes.jsx"
import { UserProvider } from "./context/UserContext"

const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}

export default App
