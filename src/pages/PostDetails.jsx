import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import '../styles.css';

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [id]);

  // Busca os detalhes do post
  async function fetchPostDetails() {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('id_post', id)
      .single();

    if (error) {
      console.error('Erro ao buscar detalhes do post:', error.message);
      return;
    }
    setPost(data);
  }

  // Busca os comentários do post
  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, user_id, usuario(username)')
      .eq('post_id', id);

    if (error) {
      console.error('Erro ao buscar comentários:', error.message);
      return;
    }
    setComments(data);
  }

  // Adiciona um novo comentário
  async function addComment() {
    if (!newComment.trim()) return;

    const token = JSON.parse(sessionStorage.getItem('token'));
    if (!token || !token.user || !token.user.id) {
      console.error('Usuário não autenticado ou ID do usuário não encontrado.');
      return;
    }

    const userId = token.user.id;

    // Verifica se o ID do usuário existe na tabela `usuario`
    const { data: userExists, error: userError } = await supabase
      .from('usuario')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userExists) {
      console.error('Usuário não encontrado na tabela `usuario`.');
      return;
    }

    // Adiciona o comentário na tabela `comments`
    try {
      const { error: insertError } = await supabase.from('comments').insert([
        {
          post_id: id,
          user_id: userId,
          content: newComment,
        },
      ]);

      if (insertError) throw insertError;

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error.message);
    }
  }

  return (
    <div className="containerH">
      <main className="contentH">
        <button className="back-button" onClick={() => navigate(-1)}>
          Voltar
        </button>
        {post ? (
          <article className="cardH">
            <h1>{post.titulo}</h1>
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.descricao }}
            ></div>

            <div className="card-footerH">
              <span>
                <strong>{comments.length}</strong> comentário(s)
              </span>
            </div>

            <section className="comments-section">
              <h3>Comentários</h3>
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <strong>{comment.usuario.username}</strong>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva seu comentário..."
                rows="4"
                className="comment-input"
              />
              <button onClick={addComment} className="comment-button">
                Comentar
              </button>
            </section>
          </article>
        ) : (
          <p>Carregando post...</p>
        )}
      </main>
    </div>
  );
};

export default PostDetails;
