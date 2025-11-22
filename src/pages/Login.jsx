import { useState } from 'react'
import axios from '../services/Api.jsx'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async(e) => {
    e.preventDefault()
     
     try{
      // For session-based auth with Laravel (Sanctum), request the CSRF cookie first
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true })

      // Read the XSRF-TOKEN cookie and send it explicitly in the header to avoid mismatch
      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '=([^;]+)'))
        return match ? match[2] : null
      }

      const rawXsrf = getCookie('XSRF-TOKEN')
      const xsrf = rawXsrf ? decodeURIComponent(rawXsrf) : null
      console.log('XSRF-TOKEN cookie:', rawXsrf)

      await axios.post('/login', { email, password }, {
        withCredentials: true,
        headers: xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}
      })
      navigate('/')

     }catch(e){
      // Improved error logging for easier debugging
      if (e.response) {
        console.error('Login error response:', e.response.status, e.response.data)
        console.error('Response headers:', e.response.headers)
      } else if (e.request) {
        console.error('No response received:', e.request)
      } else {
        console.error('Error setting up request:', e.message)
      }

     }

    console.log('login', { email, password })
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card" style={{ width: 480 }}>
        <div className="card-body">
          <h3 className="card-title mb-3">Login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <button className="btn btn-primary" type="submit">Login</button>
              <a href="#" className="small">Forgot password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
