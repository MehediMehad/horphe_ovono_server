import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../helpers/catchAsync';
import { Request, Response } from 'express';
import pickValidFields from '../../utils/pickValidFields';

const createNeeder = catchAsync(async (req, res) => {
  const payload = req.body.bodyData;
  const profileImage = req.file;
  
console.log(11, {payload}, {profileImage});
  
  const result = await UserServices.createNeeder(payload, profileImage);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: result,
  });
});

const createHelper = catchAsync(async (req, res) => {
  const result = await UserServices.createHelper(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pickValidFields(req.query, ['limit', 'page', 'email']);

  const result = await UserServices.getAllUsersFromDB(options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users Retrieve successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await UserServices.getMyProfileFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const getUserDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getUserDetailsFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User details retrieved successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const payload = req.body.bodyData;
  const file = req.file as any;
  const result = await UserServices.updateMyProfileIntoDB(id, payload, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});

const updateUserRoleStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserRoleStatusIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

export const UserControllers = {
  createNeeder,
  createHelper,
  getAllUsers,
  getMyProfile,
  getUserDetails,
  updateMyProfile,
  updateUserRoleStatus,
};
