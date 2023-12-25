import connection from '../database/connection';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../config';
import nodemailer, { Transporter } from 'nodemailer';
import { ref, getDownloadURL, deleteObject, uploadString } from "firebase/storage";
import { storage } from '../config/firebase';
import { v4 } from 'uuid';

interface LoginResult{
    status: boolean,
    token?: string;
    user?: User;
    message?: string;
}

export interface User{
    id?: string;
    name?: string;
    email: string;
    password?: string;
    role?: number;
    profilePicture?: string;
    isVerified?: number;
}

interface VerificationCode{
    id: string;
    verificationCode: string;
    expirationDate: Date;
    userId: string;
}

class UserService{
    transporter: Transporter;
    constructor(){
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.TRANSPORTER_USER,
                pass: process.env.TRANSPORTER_SECRET
            }
        })
    }

    async getUsers(limit: number, offset: number){
        try{
            let users: User[] = await connection.select().table('users').limit(limit).offset(offset);
            users = users.map((user) => {
                const { password, ...filteredUser } = user
                return filteredUser;
            });
            return {status: true, users};
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async getUserById(id: string){
        try{
            let user = await connection.select().table('users').where('id', id);
            if(user.length > 0){
                const { password, ...filteredUser } = user[0]
                user[0] = filteredUser;
                return { status: true, user: user[0] };
            }
            else{
                return { status: false, message: "User not found" };
            }
        }
        catch(err){
            console.log(err);
            return { status: false, error: err, message: "An error occurred" }
        }
    }

    async getUserByEmail(email: string){
        try{
            const user = await connection.select().table('users').where('email', email);
            if(user.length > 0){
                return {status: true, user: user[0]};
            }
            else{
                return {status: false, message: "User not found"};
            }
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async addUser(user: User){
        try{
            const id = crypto.randomUUID();
            let profilePictureSetted;
            if(user.name && user.profilePicture){
                profilePictureSetted = await this.setProfilePicture(user.name, user.profilePicture);
            }
            if(user.password){
                user.password = await this.hashPassword(user.password);
            }
            await connection.insert({...user, id, profilePicture: profilePictureSetted?.status ? profilePictureSetted.profilePictureUrl : "https://firebasestorage.googleapis.com/v0/b/bookstore-api-b889d.appspot.com/o/profile-pictures%2Fnull.jpg?alt=media&token=0a7059e9-f572-4043-b5f9-7478e52f3234", isVerified: 0 }).table('users');
            const emailSent = await this.sendVerificationEmail(user.email, id);
            if(!emailSent.status){
                return { status: false, message: emailSent.message, error: emailSent.error };
            }
            const { password, ...userResult } = user;
            userResult.profilePicture = profilePictureSetted?.profilePictureUrl;
            return { status: true, message: "User added", user: { ...userResult, id, profilePicture: profilePictureSetted?.status ? profilePictureSetted.profilePictureUrl : "https://firebasestorage.googleapis.com/v0/b/bookstore-api-b889d.appspot.com/o/profile-pictures%2Fnull.jpg?alt=media&token=0a7059e9-f572-4043-b5f9-7478e52f3234" } };
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async login(email: string, password: string){
        const userFound = await this.getUserByEmail(email);
        if(userFound.user){
            if(await this.validatePassword(password, userFound.user.password)){
                const tokenCreated = await this.createToken(userFound.user);
                if(tokenCreated.status){
                    return {status: true, user: tokenCreated.user, token: tokenCreated.token};
                }
                else{
                    return {status: false, message: tokenCreated.message};
                }
            }
            else{
                return {status: false, message: "Invalid password"};
            }
        }
        else{
            return {status: false, message: "Invalid email"};
        }
    }

    async createToken(userInfo: User): Promise<LoginResult>{
        return new Promise((resolve, reject) => {
            jwt.sign({ id: userInfo.id, email: userInfo.email, role: userInfo.role, isVerified: userInfo.isVerified }, JWT_SECRET.JWT_SECRET, { expiresIn: '48h' }, (err, token) => {
                if(token){
                    const { password, ...user } = userInfo;
                    resolve({status: true, user, token: token});
                }
                reject({status: false, error: err, message: "An error occurred during token generation"});
            })
        })
    }

    async updateUser(user: User, id: string){
        const userExists = await this.getUserById(id);
        if(userExists.status){
            let emailExists: boolean = false;
            if(user.email){
                emailExists = (await this.getUserByEmail(user.email)).status;
            }
            if(!user.email || !emailExists || userExists.user.email === user.email){
                try{
                    if(user.password){
                        user.password = await this.hashPassword(user.password);
                    }
                    let profilePictureSetted;
                    if(user.profilePicture){
                        profilePictureSetted = await this.setProfilePicture(userExists.user.name, user.profilePicture);
                        if(userExists.user.profilePicture !== "https://firebasestorage.googleapis.com/v0/b/bookstore-api-b889d.appspot.com/o/profile-pictures%2Fnull.jpg?alt=media&token=0a7059e9-f572-4043-b5f9-7478e52f3234"){
                            const imageDeleted = await this.deleteProfilePicture(userExists.user.profilePicture);
                            if(!imageDeleted.status){
                                return { status: false, message: "Error deleting the image" };
                            }
                        }
                    }
                    if(!user.role){
                        user.role = userExists.user.role;
                    }
                    await connection.update({ ...user, profilePicture: profilePictureSetted?.profilePictureUrl }).table('users').where('id', id);
                    const updatedUser = await this.getUserById(id);
                    return {status: true, user: updatedUser.user, message: "User updated"};
                }
                catch(err){
                    console.log(err);
                    return { status: false, error: err, message: "An error occurred" };
                }
            }
            else{
                return { status: false, message: "Email already in use" };
            }
        }
        else{
            return { status: false, message: "User not found" };
        }
    }

    async changePassword(id: string, newPassword: string, currentPassword: string){
        try{
            const userExists = await connection.select().table("users").where("id", id);
            if(userExists[0]){
                try{
                    if(await this.validatePassword(currentPassword, userExists[0].password)){
                        if((await this.updateUser({password: newPassword} as User, id)).status){
                            return { status: true, message: "Password changed" };
                        }
                        else{
                            return { status: false, message: "An error occurred" };
                        }
                    }
                    else{
                        return { status: false, message: "Wrong password" }
                    }
                }
                catch(err){
                    console.log(err);
                    return { status: false, error: err, message: "An error occurred" };
                }
            }
            else{
                return { status: false, message: "User not found" };
            }
        }
        catch(error){
            console.log(error);
            return { status: false, error, message: "An error occurred" };
        }
        
    }

    async deleteUser(id: string, password?: string){
        try{
            const userExists = await connection.select().table("users").where("id", id);
            if(userExists[0]){
                try{
                    if(password){
                        if(!(await this.validatePassword(password, userExists[0].password))){
                            return { status: false, message: "Invalid password" };
                        }    
                    }
                    if(userExists[0].profilePicture !== "https://firebasestorage.googleapis.com/v0/b/bookstore-api-b889d.appspot.com/o/profile-pictures%2Fnull.jpg?alt=media&token=0a7059e9-f572-4043-b5f9-7478e52f3234"){
                        const imageDeleted = await this.deleteProfilePicture(userExists[0].profilePicture);
                        if(!imageDeleted.status){
                            return { status: false, message: "Error deleting the image" };
                        }
                    }
                    await connection.del().table('users').where("id", id);
                    return { status: true, message: "Deleted successfully" };
                }
                catch(err){
                    console.log(err);
                    return { status: false, error: err, message: "An error occurred" };
                }
            }
            else{
                return { status: false, message: "User not found" };
            }
        }
        catch(error){
            console.log(error);
            return { status: false, message: "An error occurred", error };
        }
        
    }

    async validatePassword(password: string, encryptedPassword: string){
        return await bcrypt.compare(password, encryptedPassword);
    }

    async hashPassword(password: string){
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async setProfilePicture(username: string, profilePicture: string){
        try{
            const profilePicturePath = `profile-pictures/${username}-${v4()}`;
            const storageRef = ref(storage, profilePicturePath);
            await uploadString(storageRef, profilePicture, 'data_url');
            const profilePictureUrl = await getDownloadURL(storageRef);
            return { status: true, message: "Profile picture setted", profilePictureUrl, profilePicturePath };
        }
        catch(error){
            console.log(error);
            return { status: false, message: error };
        }
    }

    async deleteProfilePicture(profilePictureUrl: string){
        try{
            const url = new URL(profilePictureUrl);
            const path = decodeURIComponent(url.pathname).split("o/")[1];
            const deleteRef = ref(storage, path);
            await deleteObject(deleteRef);
            return { status: true, message: "Profile picture deleted" }
        }
        catch(error){
            console.log(error);
            return { status: false, error };
        }
    }

    async createVerificationCode(userId: string){
        try{
            const id = crypto.randomUUID();
            const verificationCode = crypto.randomBytes(32).toString("hex");
            const date = new Date();
            const expirationTime = new Date(date.getTime() + 10 * 60 * 1000);
            const formattedExpirationTime = expirationTime.toISOString().slice(0, 19).replace('T', ' ');
            await connection.insert({ id, verificationCode, expirationDate: formattedExpirationTime, userId }).table("verificationCodes");
            return { status: true, verificationCode, message: "Verification code sent" };
        }
        catch(error){
            console.log(error);
            return { status: false, error };
        }
    }

    async getVerificationCode(code: string){
        try{
            const verificationCode: VerificationCode[] = await connection.select().table("verificationCodes").where("verificationCode", code);
            if(verificationCode.length <= 0){
                return { status: false, message: "Invalid code" };
            }
            const expirationDate = new Date(verificationCode[0].expirationDate.getTime() - 3 * 60 * 60 * 1000);
            if(expirationDate < new Date()){
                return { status: false, message: "Verification code has expired" }
            }
            return { status: true, verificationCode: verificationCode[0], message: "Verification code is valid" }
        }
        catch(error){
            console.log(error);
            return { status: false, message: "Error verifying code", error };
        }
    }

    async sendVerificationEmail(email: string, userId: string){
        try{
            await connection.delete().table("verificationCodes").where("userId", userId);
            const verificationCode = await this.createVerificationCode(userId);
            if(!verificationCode.status){
                return { status: false, message: "Error creating code", error: verificationCode.error };
            }
            const verificationLink = `http://localhost:8080/auth/verify?token=${verificationCode.verificationCode}`;
            await this.transporter.sendMail({
                from: "Bookstore",
                to: email,
                subject: "Bookstore - Email Verification",
                text: "Verify your account",
                html: `<h1>Click to verify</h1>
                        <a style="background-color: #161c5c;
                                color: white; 
                                padding: 1rem;
                                text-decoration: none;
                                padding-bottom: 0.5rem;
                                border-radius: 0.2rem"
                            href="${verificationLink}">
                            Verify
                        </a>`
            });
            return { status: true, message: "Email sent" };
        }
        catch(error){
            console.log(error);
            return { status: false, message: "Error sending email", error };
        }
    }

    async verifyEmail(code: string){
        const isValid = await this.getVerificationCode(code);
        if(!isValid.status){
            return { status: false, message: isValid.message };
        }
        if(isValid.error){
            return { status: false, error: isValid.error, message: isValid.message };
        }
        await connection.update({ isVerified: 1 }).table("users").where("id", isValid.verificationCode?.userId);
        await connection.delete().table("verificationCodes").where("verificationCode", code);
        return { status: true, message: isValid.message };
    }

}

export default new UserService();