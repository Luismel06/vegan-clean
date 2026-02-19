import { create } from "zustand";
import { supabase } from "../supabase/supabase.config.jsx";

export const useAuthStore = create((set) => ({
  user: null,
  rol: "none",
  loading: true,

  // --- Login Google ---
  loginGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.log("Error iniciando Google:", error);
    }
  },

  // --- Cargar sesión al iniciar App ---
  cargarSesion: async () => {
    try {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        set({ user: null, rol: "none", loading: false });
        return;
      }

      // Buscar en tabla usuarios
      const { data: usuarioBD } = await supabase
        .from("usuarios")
        .select("id, rol")
        .eq("email", data.user.email)
        .single();

      // Si NO existe → no tiene permisos
      if (!usuarioBD) {
        set({
          user: data.user,
          rol: "none",
          loading: false,
        });
        return;
      }

      // Si existe → asignar rol real
      set({
        user: data.user,
        rol: usuarioBD.rol || "none",
        loading: false,
      });

    } catch (error) {
      console.log("Error cargando sesión:", error);
      set({ user: null, rol: "none", loading: false });
    }
  },

  // --- Logout ---
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, rol: "none", loading: false });
  },
}));
