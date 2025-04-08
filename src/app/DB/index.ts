import * as bcrypt from 'bcrypt';
import config from '../config';
import prisma from '../config/prisma';
import { UserRoleEnum, UserStatusEnum } from '@prisma/client';

const seedSuperAdmin = async () => {
  const plainPassword = "123456"
  const hashPassword = await bcrypt.hash(
    plainPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const superAdminData = {
    name: "Super Admin",
    email: 'admin@gmail.com',
    password: hashPassword,
    role: UserRoleEnum.SUPER_ADMIN,
    phone: '1234567890',
    verified: true,
    status: UserStatusEnum.ACTIVE,
  };
  try {
    // Check if a super admin already exists
    const isSuperAdminExists = await prisma.user.findFirst({
      where: {
        email: superAdminData.email,
      },
    });

    // If not, create one
    if (!isSuperAdminExists) {
      superAdminData.password = superAdminData.password
      await prisma.user.create({
        data: superAdminData,
      });
      console.log('Super Admin created successfully.', superAdminData);
    } else {
      return;
      //   console.log("Super Admin already exists.");
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  }
};

export default seedSuperAdmin;
