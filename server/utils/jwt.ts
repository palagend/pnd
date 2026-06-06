import { jwtVerify, SignJWT } from 'jose'

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!)

export const signToken = async (payload: any) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey)
}

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}
