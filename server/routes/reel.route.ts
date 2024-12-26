import { Router } from "express";
import { addReply, createComment, createReel, deleteReel, dislikesUpdate,getAllReels, getOwnPosts, likesUpdate, updateDescription } from "../controller/reel.controller";
import { isAuthenticated } from "../middleware/auth";
import { isOwner } from "../middleware/owner";
import upload from "../utils/multer";
import { isPrivate } from "../middleware/isPrivate";

const reelRouter=Router();

reelRouter.post("/create-post",isAuthenticated,upload.single("reel"),createReel);
reelRouter.put("/updateDescription/:reelId",isAuthenticated,isOwner,updateDescription)
reelRouter.put("/likes/:reelId",isAuthenticated,likesUpdate);
reelRouter.put("/dislikes/:reelId",isAuthenticated,dislikesUpdate);
reelRouter.post("/add-comment/:rel;Id",isAuthenticated,createComment);  // delete comment features
reelRouter.post("/add-reply/:commentId",isAuthenticated,addReply);     // delete reply features
reelRouter.get("/getAllPosts/:userId",isPrivate,getAllReels); // follower can see the posts only
reelRouter.get("/getOwnPosts",isAuthenticated,getOwnPosts);
reelRouter.delete("/deletePost/:reelId",isAuthenticated,isOwner,deleteReel);

export default reelRouter;