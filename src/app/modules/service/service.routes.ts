import express from "express";
import auth from "../../middlewares/auth";
import { ServiceControllers} from "./service.controller";
import { UserRoleEnum } from "@prisma/client";
const router = express.Router();

router.post("/create",auth(UserRoleEnum.SUPER_ADMIN), ServiceControllers.createService);

router.put(
  "/change-status/:id",
  auth("SUPER_ADMIN"),
  ServiceControllers.changeServiceStatus
);

export const ServiceRouters = router;
