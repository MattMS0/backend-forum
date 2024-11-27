import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles.css';

const HomePage = ({ token }) => {
  let navigate = useNavigate()

  function handleLogout() {
    sessionStorage.removeItem('token')
    navigate('/')

  }

  return (

      <body class="bodyH">

        <div class="containerH">

          <aside class="sidebarH">
            <div class="logoH">JD JUSTICA</div>
            <nav>
              <h3 class="h3H">Boas vindas, {token.user.user_metadata.fullName}</h3>
              <ul>
                <li>Leis</li>
                <li>Categorias</li>
                <li>Perguntas</li>
              </ul>
            </nav>
            <div class="personal-navigationH">
              <h4>NAVEGAÇÃO PESSOAL</h4>
              <ul>
                <li>Suas perguntas</li>
                <li>Suas respostas</li>
                <li>Curtidas e comentarios</li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            </div>
          </aside>

          <main class="contentH">
            <header>
              <h1>Leis</h1>
              <div class="filter-buttonsH">
                <button>Novo</button>
                <button>Principal</button>
                <button>Seleção</button>
              </div>
            </header>
            <section class="articlesH">
              <article class="cardH">
                <h2>Código de Defesa do Consumidor (CDC) - Lei nº 8.078/1990</h2>
                <p>O Código de Defesa do Consumidor (CDC) é a principal legislação brasileira que regulamenta as relações de consumo. Ele estabelece os direitos básicos dos consumidores...</p>
                <div class="tagsH">
                  <span>#ProteçãoAoConsumidor</span>
                  <span>#LeiDosConsumidores</span>
                  <span>#DefesaDoConsumidor</span>
                </div>
                <div class="card-footerH">
                  <span>👁️ 125</span>
                  <span>💬 15</span>
                  <span>❤️ 155</span>
                </div>
              </article>


              <article class="cardH">
                <h2>Lei do Arrependimento - Art. 49 do CDC</h2>
                <p>Esta lei permite que o consumidor desista de uma compra realizada fora do estabelecimento comercial (como pela internet ou por telefone) dentro de um prazo de 7 dias...</p>
                <div class="tagsH">
                  <span>#LeiDoArrependimento</span>
                  <span>#DireitoDeDesistir</span>
                  <span>#ProteçãoAoConsumidor</span>
                </div>
                <div class="card-footerH">
                  <span>👁️ 125</span>
                  <span>💬 15</span>
                  <span>❤️ 155</span>
                </div>
              </article>
            </section>
          </main>


          <aside class="right-sidebarH">
            <div class="suggestionsH">
              <h4>Postagens que talvez você queria ver</h4>
              <ul>
                <li>Post 1</li>
                <li>Post 2</li>
              </ul>
            </div>
            <div class="linksH">
              <h4>Links em destaque</h4>
              <ul>
                <li>link 1</li>
                <li>link 2</li>
                <li>link 3</li>
              </ul>
            </div>
          </aside>
        </div>
      </body>
  );
}

export default HomePage