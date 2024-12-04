"use server";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verificiation-token";

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  //verifica se existe um token
  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  //verifica se o token não foi expirado após as 1h
  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  //busca os dados do usuário no banco de dados se existir
  const existingUser = await getUserByEmail(existingToken.email);

  //verifica se existe um usuário
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  // atualiza os dados do usuário colocando uma data de verificação do usuário
  await db.user.update({
    where: { id: existingUser.id },
    data: { 
      emailVerified: new Date(),
      email: existingToken.email,
    }
  });

  //deleta o token de vericicação, pois já foi utilizado
  await db.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Email verified!" };
};
