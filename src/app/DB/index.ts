import * as bcrypt from 'bcrypt';
import config from '../config';
import prisma from '../config/prisma';
import { UserRoleEnum, UserStatusEnum } from '@prisma/client';

const superAdminData = {
  name: "Super Admin",
  email: 'admin@gmail.com',
  password: '123456',
  role: UserRoleEnum.SUPER_ADMIN,
  phone: '1234567890',
  verified: true,
  status: UserStatusEnum.ACTIVE,
  
};

const seedSuperAdmin = async () => {
  try {
    // Check if a super admin already exists
    const isSuperAdminExists = await prisma.user.findFirst({
      where: {
        email: superAdminData.email,
      },
    });

    // If not, create one
    if (!isSuperAdminExists) {
      superAdminData.password = await bcrypt.hash(
        config.super_admin_password as string,
        Number(config.bcrypt_salt_rounds) || 12
      );
      await prisma.user.create({
        data: superAdminData,
      });
      console.log('Super Admin created successfully.');
    } else {
      return;
      //   console.log("Super Admin already exists.");
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  }
};

export default seedSuperAdmin;
