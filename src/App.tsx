import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Sesión cerrada con éxito!');
    }
  };

  return (
    <>
      <Toaster />
      {session ? (
        <div className="container mt-5">
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
          <Calendar />
        </div>
      ) : (
        <Auth onAuthSuccess={() => supabase.auth.getSession().then(({ data: { session } }) => setSession(session))} />
      )}
    </>
  );
}

export default App;