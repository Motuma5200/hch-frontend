import { useState } from 'react'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: call signup service
    console.log('signup', { name, email, password })
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card" style={{ width: 480 }}>
        <div className="card-body">
          <h3 className="card-title mb-3">Create an account</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary" type="submit">Create account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
