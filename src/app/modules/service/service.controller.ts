import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ServiceServices } from "./service.service";


const createService = catchAsync(async (req, res) => {
  const payload = req.body
    
  const result = await ServiceServices.createService(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Service created successfully',
    data: result,
  });
});



export const ServiceControllers = {
  createService,
};
