"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";

//cadastrar um novo usuário
export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  //criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  //Busca para saber se já tem um e-mail cadastrado
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  //Cria um novo usuário no banco de dados
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  //cria um token de veficação na tebela verificationToken
  const verificationToken = await generateVerificationToken(email);
  //envia a verificação por e-mail
  await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token,
  );

  return { success: "Confirmation email sent!" };
};
