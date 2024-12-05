"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";

//função para enviar o reset de senha 
export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema> ,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  //verifica se os campos foram preenchidos
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  //busca no banco de dados um token existente
  const existingToken = await getPasswordResetTokenByToken(token);

  //verifica se o token existe
  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  //verifica se o token ainda está válido pelo tempo de 1h
  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  //busca no banco de dados um usuário 
  const existingUser = await getUserByEmail(existingToken.email);

  //verifica se o usuário existe
  if (!existingUser) {
    return { error: "Email does not exist!" }
  }

  //criptografa a nova senha
  const hashedPassword = await bcrypt.hash(password, 10);

  //atualiza a senha no banco de dados
  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  //deleta o token antigo 
  await db.passwordResetToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Password updated!" };
};
