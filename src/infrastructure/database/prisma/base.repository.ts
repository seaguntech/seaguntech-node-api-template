import type { Prisma, PrismaClient } from '@prisma/client';

type Model = Prisma.ModelName;

export type BaseRepository<T extends Uncapitalize<Model>> = {
  create: PrismaClient[T]['create'];
  createMany: PrismaClient[T]['createMany'];
  count: PrismaClient[T]['count'];
  findUnique: PrismaClient[T]['findUnique'];
  findFirst: PrismaClient[T]['findFirst'];
  update: PrismaClient[T]['update'];
  upsert: PrismaClient[T]['upsert'];
  updateMany: PrismaClient[T]['updateMany'];
  delete: PrismaClient[T]['delete'];
  findMany: PrismaClient[T]['findMany'];
  deleteMany: PrismaClient[T]['deleteMany'];
};

export const createBaseRepository = <T extends Model>(
  prisma: PrismaClient,
  model: T,
): BaseRepository<Uncapitalize<T>> => {
  const modelKey = (model.charAt(0).toLowerCase() + model.slice(1)) as Uncapitalize<T>;

  const delegate = prisma[modelKey];

  return {
    create: ((...args) => delegate.create(...args)) as PrismaClient[Uncapitalize<T>]['create'],
    createMany: ((...args) =>
      delegate.createMany(...args)) as PrismaClient[Uncapitalize<T>]['createMany'],
    count: ((...args) => delegate.count(...args)) as PrismaClient[Uncapitalize<T>]['count'],
    findUnique: ((...args) =>
      delegate.findUnique(...args)) as PrismaClient[Uncapitalize<T>]['findUnique'],
    findFirst: ((...args) =>
      delegate.findFirst(...args)) as PrismaClient[Uncapitalize<T>]['findFirst'],
    update: ((...args) => delegate.update(...args)) as PrismaClient[Uncapitalize<T>]['update'],
    upsert: ((...args) => delegate.upsert(...args)) as PrismaClient[Uncapitalize<T>]['upsert'],
    updateMany: ((...args) =>
      delegate.updateMany(...args)) as PrismaClient[Uncapitalize<T>]['updateMany'],
    delete: ((...args) => delegate.delete(...args)) as PrismaClient[Uncapitalize<T>]['delete'],
    findMany: ((...args) =>
      delegate.findMany(...args)) as PrismaClient[Uncapitalize<T>]['findMany'],
    deleteMany: ((...args) =>
      delegate.deleteMany(...args)) as PrismaClient[Uncapitalize<T>]['deleteMany'],
  };
};
