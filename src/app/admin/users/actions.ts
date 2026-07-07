"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function setUserActive(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("אין הרשאה לבצע פעולה זו");
  }
  if (userId === session.user.id) {
    throw new Error("לא ניתן לחסום את המשתמש שלך");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { is_active: isActive },
  });

  revalidatePath("/admin/users");
}
