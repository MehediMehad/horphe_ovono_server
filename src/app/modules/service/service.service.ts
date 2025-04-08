import { PrismaClient, Service } from "@prisma/client";


const prisma = new PrismaClient()

const createService = async (payload: Service) => {

  const result = await prisma.service.create({
    data: {
      name: payload.name
    },
    select: {
      id: true,
      name: true,
    }
  })

  return result



};

export const ServiceServices = {
  createService,
};
