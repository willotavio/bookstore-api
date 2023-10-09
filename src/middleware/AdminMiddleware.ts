import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../config';

export interface TokenRequest extends Request{
    token?: string;
    loggedUser?: {
        data: TokenData;
    }
}

interface TokenData{
    id: string,
    email: string,
    role: number
}

export const adminMiddleware = (req: TokenRequest, res: Response, next: NextFunction) => {
    const authToken = req.headers['authorization'];
    if(authToken){
        const token = authToken.split(" ")[1];
        jwt.verify(token, JWT_SECRET.JWT_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
                return;
            }
            const userData = data as TokenData;
            req.token = token;
            req.loggedUser = {data: userData};
            if(userData.role >= 2){
                next();
            }
            else{
                res.status(401).json({message: "Not an admin"});
            }
        });
    }
    else{
        res.status(401).json({message: "Invalid token"});
    }
}