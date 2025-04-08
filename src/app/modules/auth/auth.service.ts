import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import AppError from "../../errors/ApiError";
// import { generateResetPasswordToken, generateToken } from '../../helpers/generateToken';
import prisma from "../../config/prisma";

import { UserStatusEnum } from "@prisma/client";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { generateOTP, saveOrUpdateOTP, sendOTPEmail } from "./auth.constant";

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
  fcmToken?: string;
}) => {
  // Find the user by email
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  // Check if the password is correct
  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password incorrect");
  }

  // Update the FCM token if provided
  if (payload?.fcmToken) {
    await prisma.user.update({
      where: {
        email: payload.email, // Use email as the unique identifier for updating
      },
      data: {
        fcmToken: payload.fcmToken,
      },
    });
  }

  // Generate an access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email as string,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in
  );

  // Return user details and access token
  return {
    id: userData.id,
    email: userData.email,
    role: userData.role,
    accessToken: accessToken,
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    );
  }

  // GenerateOTP expiry (time 10 minute)
  const { otpCode, expiry, hexCode } = generateOTP();

  // Create or Update OTP
  const otpData = await saveOrUpdateOTP(
    user.email,
    otpCode,
    expiry,
    hexCode,
    prisma
  );

  // Send OTP Email
  sendOTPEmail(otpData.email, otpCode);
  return {
    hexCode: otpData.hexCode,
  };
};

const verifyOtpCode = async (payload: { hexCode: string; otpCode: string }) => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      hexCode: payload.hexCode,
      otp: payload.otpCode,
    },
  });

  if (!otpRecord) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP");
  }

  // Check if OTP is expired
  if (new Date() > otpRecord.expiry) {
    // If valid, delete the OTP from the database
    await prisma.otp.delete({
      where: {
        id: otpRecord.id,
      },
    });

    throw new AppError(
      httpStatus.GONE,
      "The OTP has expired. Please request a new one."
    );
  }
  // Perform multiple operations in a transaction
  const [user, _] = await prisma.$transaction([
    // First: Find the user based on OTP email
    prisma.user.findUnique({
      where: { email: otpRecord.email },
      select: {
        id: true,
        email: true,
        role: true,
        verified: true,
      },
    }),

    // Second: Delete OTP record from database
    prisma.otp.delete({
      where: {
        id: otpRecord.id,
      },
    }),
  ]);

  // Ensure the user is found
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found! The user may have been deleted by mistake. Please register."
    );
  }

  // Third: Update the user's verified status
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verified: true,
    },
  });

  // Generate an access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: updatedUser.id,
      email: updatedUser.email as string,
      role: [...updatedUser.role],
    },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_expires_in as string
  );

  return { accessToken };
};

const resetPassword = async (
  userId: string,
  payload: {
    password: string;
  }
) => {
  const userToUpdate = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userToUpdate) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found in the database.");
  }

  // If valid, delete the OTP from the database
  const updatedUser = await prisma.user.update({
    where: { id: userToUpdate.id },
    data: {
      password: await bcrypt.hash(
        payload.password,
        Number(config.bcrypt_salt_rounds)
      ),
    },
  });

  if (!updatedUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User not found in the database."
    );
  }
  return {
    message: "password updated successfully",
  };
};
const changePassword = async (payload: {
  id: string;
  newPassword: string;
  oldPassword: string;
}) => {
  const userData = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      password: true,
      email: true,
      id: true,
      status: true,
    },
  });

  if (!userData) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found!, If you have already have account please reset your password"
    );
  }

  // Check if the user status is BLOCKED
  if (userData.status === UserStatusEnum.BLOCK) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support."
    );
  }

  // Check if the password is correct
  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password as string
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password incorrect");
  }
  // Hash the user's password

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  // Update the user's password in the database template
  const updatedUser = await prisma.user.update({
    where: { id: payload.id },
    data: {
      password: hashedPassword,
    },
  });
  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found in the database.");
  }
  return {
    message: "password updated successfully",
  };
};

export const AuthServices = {
  loginUserFromDB,
  forgotPassword,
  verifyOtpCode,
  resetPassword,
  changePassword,
};
