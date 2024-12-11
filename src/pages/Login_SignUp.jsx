import React, { useState } from 'react';
import '../styles.css';
import { supabase } from '../client';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs'


function App({setToken}) {
  let navigate = useNavigate()
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [username, setUsername] = useState('');

  const [formDataSignUp,setFormDataSignUp] = useState({
    userName:'', email:'', password:''
  })

  const [formDataSignIn,setFormDataSignIn] = useState({
    email:'', password:''
  })



// handleChange para cadastro
  function handleChangeSignUp(event){
    setFormDataSignUp((prevFormDataSignUp) =>{
      return{
        ...prevFormDataSignUp,
        [event.target.name]:event.target.value
      }
    }
    )
  }

// handleChange para login
  function handleChangeSignIn(event){
    {(e) => setEmail(e.target.value)};
    setFormDataSignIn((prevFormDataSignIn) =>{
      return{
        ...prevFormDataSignIn,
        [event.target.name]:event.target.value
      }
    }
    )
  }

  // Função para registrar um usuário
  const handleSignUp = async (e) => {
    e.preventDefault();
  
    try {
      // Cria o hash da senha
      const hashedPassword = bcrypt.hashSync(formDataSignUp.password, 10);
  
      // Cria o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formDataSignUp.email,
        password: formDataSignUp.password,
        options: {
          data: {
            username: formDataSignUp.userName,
          },
        },
      });
  
      if (authError) {
        throw new Error('Erro no cadastro: ' + authError.message);
      }
  
      // Insere os dados do usuário na tabela personalizada
      const { error: insertError } = await supabase
        .from('usuario')
        .insert({
          email: formDataSignUp.email,
          username: formDataSignUp.userName,
          senha_hash: hashedPassword,
          data_cadastro: new Date(),
          permissao: 'viewer', // Define a permissão padrão
        });
  
      if (insertError) {
        throw new Error('Erro ao inserir na tabela personalizada: ' + insertError.message);
      }
  
      alert('Usuário cadastrado com sucesso!');
    } catch (error) {
      alert(error.message);
    }
  };
  
  

  // NÃO UTILIZADA - Função para fazer login
  // const handleSignIn = async (e) => {
  //   e.preventDefault();
  //   const { data, error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });
  //   if (error) {
  //     alert('Erro no login: ' + error.message);
  //   } else {
  //     alert('Login realizado com sucesso!');
  //     navigate('/home')
  //   }
    
  // };

  async function handleSubmitSignIn(e) {
    e.preventDefault();
  
    try {
      // Faz login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formDataSignIn.email,
        password: formDataSignIn.password,
      });
  
      if (authError) throw new Error('Erro no login: ' + authError.message);
  
      // Busca o usuário na tabela `usuario` usando o email
      const { data: userInfo, error: userError } = await supabase
        .from('usuario')
        .select('id, permissao, username') // Inclui o ID da tabela `usuario`
        .eq('email', formDataSignIn.email)
        .single();
  
      if (userError || !userInfo) {
        throw new Error('Usuário não encontrado na tabela `usuario`.');
      }
  
      // Atualiza o token para incluir o ID da tabela `usuario`
      const updatedToken = {
        ...authData,
        user: {
          ...authData.user,
          id_usuario: userInfo.id, // Adiciona o ID da tabela `usuario`
          role: userInfo.permissao, // Adiciona a permissão
          username: userInfo.username, // Adiciona o nome de usuário
        },
      };
  
      sessionStorage.setItem('token', JSON.stringify(updatedToken)); // Salva o token no navegador
      setToken(updatedToken);
  
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  }
  
  
  
  

  return (
    <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          
          {/* Formulário de Login */}
          <form onSubmit={handleSubmitSignIn} className="sign-in-form">
            <h2 className="title">Entrar</h2>
            
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                name='email'
                onChange={handleChangeSignIn}
                onInput={(e) => setEmail(e.target.value)}
                
              />
            
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
                type="password" 
                placeholder="Senha" 
                value={password} 
                name='password'
                onInput={(e) => setPassword(e.target.value)}
                onChange={handleChangeSignIn}
              />
            </div>
            <input type="submit" value="Entrar" className="btn solid" />
            <button
              type="button"
              className="btn-visitor"
              onClick={() => {
                sessionStorage.setItem("role", "visitor");
                window.location.href = "/home";
              }}
              style={{ marginTop: "10px" }}
            >
              Continuar como Visitante
            </button>

          </form>

          {/* Formulário de Cadastro */}
          <form onSubmit={handleSignUp} className="sign-up-form">
            <h2 className="title">Cadastro</h2>
            
            {/* Input de usuário */}
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input 
              type="text" 
              placeholder="Usuário"
              name='userName'
              onChange={handleChangeSignUp} />
            </div>
            
            {/* Input de Email */}
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input type="email" 
              placeholder="Email"
              name='email'
              onChange={handleChangeSignUp}
              />          
            </div>
            
            {/* Input de senha */}
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
              placeholder="Senha" 
              name='password'
              type='password'
              onChange={handleChangeSignUp}
              />
            </div>
            
            {/* Botão de cadastro */}
            <input type="submit" className="btn" value="Cadastre-se" />

            <p className="social-text">Cadastre-se com o Google</p>
            <div className="social-media">
              <a href="#" className="social-icon">
                <i className="fab fa-google"></i>
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Painéis de alternância */}
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>Novo por aqui?</h3>
            <p>Informe-se, defenda-se, e consuma com consciência.</p>
            <button className="btn transparent" onClick={() => setIsSignUpMode(true)}>
              Cadastre-se
            </button>
          </div>
          <img src="/src/img/undraw_judge_katerina_limpitsouni_ny-1-q.svg" className="image" alt="Cadastro" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>Já tem uma conta?</h3>
            <p>Informe-se, defenda-se e consuma com consciência.</p>
            <button className="btn transparent" onClick={() => setIsSignUpMode(false)}>
              Entrar
            </button>
          </div>
          <img src="\src\img\undraw_undraw_undraw_undraw_businessman_e7v0_qrld_-1-_hvmv_-1-_ik9c.svg" className="image" alt="Login" />
        </div>
      </div>
    </div>
  );
}

export default App;
