import { Router } from "express";
import { addReply, createComment, createPost, getAllPosts, getOwnPosts, likesUpdate } from "../controller/post.controller";
import { isAuthenticated } from "../middleware/auth";

const postRouter=Router();

postRouter.post("/create-post",isAuthenticated,createPost);
postRouter.put("/likes/:postId",isAuthenticated,likesUpdate);
postRouter.post("/add-comment/:postId",isAuthenticated,createComment);
postRouter.post("/add-reply/:commentId",isAuthenticated,addReply);
postRouter.get("/getAllPosts/:userId",getAllPosts);
postRouter.get("/getOwnPosts",isAuthenticated,getOwnPosts);