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
const changeServiceStatus = async (id: string, payload: { name: string }) => {
  console.log(22, payload);

  const result = await prisma.service.update({
    where: {
      id: id,
    },
    data: {
      name: payload.name, 
    },
  });
  return result;
};

export const ServiceServices = {
  createService,
  changeServiceStatus
};
