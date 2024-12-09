import { useSession } from "next-auth/react";

//Trax os dados de 'função' do usuário se ele é ADMIN/USER
export const useCurrentRole = () => {
  const session = useSession();

  return session.data?.user?.role;
};
