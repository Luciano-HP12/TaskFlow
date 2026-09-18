import { db } from "../../src/prisma/db.ts";

export async function cleanDatabase() {
  const users = await db.orm.public.User.all();

  for (const user of users) {
    await db.orm.public.User.where({
      id: user.id,
    }).delete();
  }
}