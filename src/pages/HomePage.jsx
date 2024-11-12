import React from 'react'
import { useNavigate } from 'react-router-dom'

const HomePage = ({token}) => {
  let navigate = useNavigate()

  function handleLogout(){
    sessionStorage.removeItem('token')
    navigate('/')

  }
  
  return (
    <div>
      <h3>Boas vindas, {token.user.user_metadata.fullName}</h3>
      <button onClick={handleLogout}>Logout  </button>
    </div>
    
  )
}

export default HomePage