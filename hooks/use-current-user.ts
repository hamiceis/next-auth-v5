import { useSession } from "next-auth/react";

//Mostra os dados do usuário logado/autenticado ne sessão
export const useCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
};
