import { Router } from "express";
import { getMessage, sendMessage } from "../controller/message.controller";
import { isAuthenticated } from "../middleware/auth";


const messageRouter=Router();


messageRouter.post("/sendMessage",isAuthenticated,sendMessage);
messageRouter.get("/getAllMessage",isAuthenticated,getMessage);

export default messageRouter;