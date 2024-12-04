"use server";

import * as z from "zod";

import { ResetSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";

//enviando link para resetar a senha do usuário
export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  //verificando se os dados estão validos
  if (!validatedFields.success) {
    return { error: "Invalid emaiL!" };
  }

  const { email } = validatedFields.data;

  //buscando usuário pelo e-mail
  const existingUser = await getUserByEmail(email);

  //verificando se usuário existe
  if (!existingUser) {
    return { error: "Email not found!" };
  }

  //gerando um token de reset de senha
  const passwordResetToken = await generatePasswordResetToken(email);

  //enviando e-mail para resetar a senha
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "Reset email sent!" };
}