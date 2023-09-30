import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../config';

export interface TokenRequest extends Request{
    token?: string;
    loggedUser?: {}
}

export const authMiddleware = (req: TokenRequest, res: Response, next: NextFunction) => {
    const authToken = req.headers['authorization'];
    if(authToken){
        const token = authToken.split(" ")[1];
        jwt.verify(token, JWT_SECRET.JWT_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
                return;
            }
            req.token = token;
            req.loggedUser = {data};
            console.log(data);
            next();
        });
    }
    else{
        res.status(401).json({message: "Invalid token"});
    }
}