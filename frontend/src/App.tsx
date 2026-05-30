import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Personal } from './pages/Personal'
import { Departamento } from './pages/Departamento'
import { Comercial } from './pages/Comercial'
import { Proyecto } from './pages/Proyecto'
import { Oportunidad } from './pages/Oportunidad'
import { Asistente } from './pages/Asistente'
import { useAuth } from './stores/auth'

export default function App() {
  const cargarSesion = useAuth((s) => s.cargarSesion)

  // Al arrancar, si hay token guardado, recuperamos el usuario.
  useEffect(() => {
    cargarSesion()
  }, [cargarSesion])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Personal />} />
        <Route path="departamento" element={<Departamento />} />
        <Route path="comercial" element={<Comercial />} />
        <Route path="proyecto/:id" element={<Proyecto />} />
        <Route path="oportunidad/:id" element={<Oportunidad />} />
        <Route path="asistente" element={<Asistente />} />
      </Route>
    </Routes>
  )
}
