import express from "express"
import { activeUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registrationUser, updateAccessToken, updateBio, updatePassword, updatePrivacy, updateProfilePicture } from "../controller/user.controller";
import { isAuthenticated } from "../middleware/auth";

const userRouter=express.Router();


userRouter.post("/registration",registrationUser);
userRouter.post("/active-user",activeUser);
userRouter.post("/login",loginUser);
userRouter.get("/logout",logoutUser);
userRouter.get("/refresh",updateAccessToken);
userRouter.get("/me",isAuthenticated,getUserInfo);
userRouter.put("/update-password",isAuthenticated,updatePassword);
userRouter.put("/update-profilePic",isAuthenticated,updateProfilePicture);
userRouter.get("/allUser",isAuthenticated,getAllUsers);
userRouter.put("/update-bio",isAuthenticated,updateBio);
userRouter.put("/update-privacy",updatePrivacy);
userRouter.delete("/delete-me",isAuthenticated,deleteUser);

export default userRouter;