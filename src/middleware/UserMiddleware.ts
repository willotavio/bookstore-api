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
    role: number,
    isVerified: number
}

export const userMiddleware = (req: TokenRequest, res: Response, next: NextFunction) => {
    const authToken = req.cookies.token;
    if(authToken){
        try{
            const verifiedToken = jwt.verify(authToken, JWT_SECRET.JWT_SECRET);
            const userData = verifiedToken as TokenData;
            req.loggedUser = {data: userData};
            if(userData.id === req.params.userId){
                next();
            }
            else{
                res.status(401).json({message: "Unauthorized"});
            }
        }
        catch(err){
            console.log(err);
            res.status(401).json({message: "Unauthorized"});
            return;
        }
    }
    else{
        res.status(401).json({message: "Invalid token"});
    }
}