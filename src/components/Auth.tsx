import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Sesión iniciada con éxito!');
      onAuthSuccess();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
      // Optionally, you might want to log in the user automatically after registration
      // or redirect them to a confirmation page.
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h3>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@ejemplo.com"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="passwordInput" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <button
                  className="btn btn-link"
                  onClick={() => setIsRegistering(!isRegistering)}
                  disabled={loading}
                >
                  {isRegistering ? 'Ya tienes cuenta? Inicia Sesión' : 'No tienes cuenta? Regístrate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
