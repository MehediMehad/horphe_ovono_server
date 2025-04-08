import { User as User, UserRoleEnum } from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import config from "../../config";
import {
  generateOTP,
  saveOrUpdateOTP,
  sendOTPEmail,
} from "../auth/auth.constant";

const createNeeder = async (payload: User, file: any) => {
  // if user already exists
  console.log({file});
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "An account already exists with this email. Please try to log in or use a different email address."
    );
  }
  const hash = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );
  const { otpCode, expiry, hexCode } = generateOTP();

  const [userData, otp] = await prisma.$transaction(async (prisma) => {
    const createUser = await prisma.user.create({
      data: {
        name: payload.name,
        password: hash,
        email: payload.email,
        role: UserRoleEnum.NEEDER,
        isNeeder: true,
        profilePicture: file ? file.path : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const saveOTPToDatabase = await saveOrUpdateOTP(
      createUser.email,
      otpCode,
      expiry,
      hexCode,
      prisma
    );

    return [createUser, saveOTPToDatabase];
  });

  // Send OTP via email (Outside transaction)
  sendOTPEmail(userData.email, otpCode);

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    hexCode,
    otpCode,
  };
};
const createHelper = async (payload: User) => {
  // if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "An account already exists with this email. Please try to log in or use a different email address."
    );
  }
  const hash = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );
  const { otpCode, expiry, hexCode } = generateOTP();

  const [userData, otp] = await prisma.$transaction(async (prisma) => {
    const createUser = await prisma.user.create({
      data: {
        name: payload.name,
        password: hash,
        email: payload.email,
        role: UserRoleEnum.HELPER,
        isHelper: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isNeeder: true
      },
    });

    const saveOTPToDatabase = await saveOrUpdateOTP(
      createUser.email,
      otpCode,
      expiry,
      hexCode,
      prisma
    );

    return [createUser, saveOTPToDatabase];
  });
  // Send OTP via email (Outside transaction)
  sendOTPEmail(userData.email, otpCode);

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    hexCode,
    otpCode,
  };
};

const getAllUsersFromDB = async (
  options: IPaginationOptions & { email?: string }
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const emailFilter: any = options.email
    ? {
        email: {
          contains: options.email, // Case-insensitive search
          mode: "insensitive",
        },
      }
    : {};

  const [result, total, totalTerms] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      where: {
        role: {
          not: "SUPER_ADMIN",
        },
        ...emailFilter,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({
      where: {
        role: {
          not: "SUPER_ADMIN",
        },
        ...emailFilter,
      },
    }),
    prisma.terms.count({}),
  ]);

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Profile;
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const updateMyProfileIntoDB = async (id: string, payload: any, file: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  // Handle profile image upload
  // const profileImage = file?.originalname
  //   ? `${prodyacess.env.BACKEND_BASE_URL}/uploads/${file.originalname}`
  //   : existingUser.profileImage;

  // Prepare the updated data object
  const updatedData = {
    ...payload, // Include fields from payload
    //profileImage, // Update or retain profile image
  };

  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: updatedData,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,

      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const updateUserRoleStatusIntoDB = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return result;
};

export const UserServices = {
  createNeeder,
  createHelper,
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  updateMyProfileIntoDB,
  updateUserRoleStatusIntoDB,
};
