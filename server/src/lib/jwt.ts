import jwt, { JwtPayload, Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';

const signAccessToken = (payload: string | object | Buffer, options?: SignOptions | undefined) => {
	const accessToken: string = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY as Secret, options);
	return accessToken;
};

const signRefreshToken = (payload: string | object | Buffer, options?: SignOptions | undefined) => {
	const refreshToken: string = jwt.sign(payload, process.env.REFRESH_TOKEN_KEY as Secret, options);
	return refreshToken;
};

const verifyAccessToken = (token: string, options?: VerifyOptions | undefined) => {
	const accessToken: string | JwtPayload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY as Secret, options);
	return accessToken;
};
const verifyRefreshToken = (token: string, options?: VerifyOptions | undefined) => {
	const refreshToken: string | JwtPayload = jwt.verify(token, process.env.REFRESH_TOKEN_KEY as Secret, options);
	return refreshToken;
};

export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
