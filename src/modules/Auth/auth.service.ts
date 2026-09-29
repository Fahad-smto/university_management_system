// import prisma from '../../lib/prisma';
// import { IAuthFilters } from './auth.interface';
// import { IPaginationOptions } from '../../interface/common';

import { OAuth2Client } from "google-auth-library/build/src/auth/oauth2client";
import { IgoogleLoginpayload } from "./auth.interface";
import { googleClient } from "../../lib/googleAuth";


const googleLogin=async(payload:IgoogleLoginpayload)=>{
 

	

	const result = await googleClient.verifyIdToken({
		idToken: payload.idToken,
		
	})

	const googleInfo = result.getPayload();

}
 


// TODO: implement Auth business logic / Prisma queries here
export const AuthService = {

	googleLogin
	// create: async (payload: any) => {},
	// getAll: async (filters: IAuthFilters, options: IPaginationOptions) => {},
	// getSingle: async (id: string) => {},
	// update: async (id: string, payload: any) => {},
	// softDelete: async (id: string) => {},
};


