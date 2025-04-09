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

const changeServiceStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  console.log(6366, req.query);
  
    
  const result = await ServiceServices.changeServiceStatus(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Change Service Status successfully',
    data: result,
  });
});




export const ServiceControllers = {
  createService,
  changeServiceStatus
};
