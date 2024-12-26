import express from "express"
import { activeUser, deleteUser, follow, getAllUsers, getUser, getUserInfo, loginUser, logoutUser, registrationUser, unFollow, updateAccessToken, updateBio, updateIsVerified, updatePassword, updatePrivacy, updateProfilePicture } from "../controller/user.controller";
import { isAuthenticated } from "../middleware/auth";
import { isOwner } from "../middleware/owner";


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
userRouter.put("/update-verified",isAuthenticated,updateIsVerified);
userRouter.delete("/delete-me",isAuthenticated,deleteUser);
//yet to test
userRouter.get("/getUser/:userId",getUser);
userRouter.put("/follow",isAuthenticated,follow);
userRouter.put("/follow",isAuthenticated,unFollow);

export default userRouter;