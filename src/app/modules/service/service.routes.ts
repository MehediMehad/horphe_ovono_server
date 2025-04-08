import express from "express";
import auth from "../../middlewares/auth";
import { ServiceControllers} from "./service.controller";
import { UserRoleEnum } from "@prisma/client";
const router = express.Router();

router.post("/create",auth(UserRoleEnum.SUPER_ADMIN), ServiceControllers.createService);


// router.put(
//   "/update-user/:id",
//   auth("ADMIN"),
//   UserControllers.updateUserRoleStatus
// );

export const ServiceRouters = router;
