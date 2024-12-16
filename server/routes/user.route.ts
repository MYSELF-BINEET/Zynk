import express from "express"
import { activeUser, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken, updatePassword } from "../controller/user.controller";
import { isAuthenticated } from "../middleware/auth";

const userRouter=express.Router();


userRouter.post("/registration",registrationUser);
userRouter.post("/active-user",activeUser);
userRouter.post("/login",loginUser);
userRouter.get("/logout",logoutUser);
userRouter.get("/refresh",updateAccessToken);
userRouter.get("/me",isAuthenticated,getUserInfo);
userRouter.put("/update-password",updatePassword);

export default userRouter;