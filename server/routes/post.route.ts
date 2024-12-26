import { Router } from "express";
import { addReply, createComment, createPost, deletePost, dislikesUpdate, getAllPosts, getOwnPosts, likesUpdate, updateDescription } from "../controller/post.controller";
import { isAuthenticated } from "../middleware/auth";
import { isOwner } from "../middleware/owner";
import upload from "../utils/multer";
import { isPrivate } from "../middleware/isPrivate";

const postRouter=Router();

postRouter.post("/create-post",isAuthenticated,upload.single("photo"),createPost);
postRouter.put("/updateDescription/:postId",isAuthenticated,isOwner,updateDescription)
postRouter.put("/likes/:postId",isAuthenticated,likesUpdate);
postRouter.put("/dislikes/:postId",isAuthenticated,dislikesUpdate);
postRouter.post("/add-comment/:postId",isAuthenticated,createComment);  // delete comment features
postRouter.post("/add-reply/:commentId",isAuthenticated,addReply);     // delete reply features
postRouter.get("/getAllPosts/:userId",isPrivate,getAllPosts); // follower can see the posts only
postRouter.get("/getOwnPosts",isAuthenticated,getOwnPosts);
postRouter.delete("/deletePost/:postId",isAuthenticated,isOwner,deletePost);

export default postRouter;