import React, { useEffect, useState } from 'react'
import { Login_SignUp, HomePage } from './pages'
import {Routes, Route} from 'react-router-dom';

const App = () => {

  const [token, setToken] = useState(false)

  if(token){
    sessionStorage.setItem('token',JSON.stringify(token))
  }

  useEffect(() => {
    if(sessionStorage.getItem( 'token')){
      let data = JSON.parse(sessionStorage.getItem( 'token'))
      setToken(data)
    }
  
  }, [])
  

  return (
    <div>
      <Routes>
        <Route path={'/'} element={<Login_SignUp setToken={setToken}/>} />
        {token?<Route path={'/home'} element={<HomePage token={token}/>} />:""}
      </Routes>
      
    </div>
  )
}

export default App