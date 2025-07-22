import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJURUNITklDSUFOIiwiaWF0IjoxNzUzMTYyMjIxLCJleHAiOjE3NTMyNDg2MjF9.EXJyC26xnpS68409YjmFp69gJ5hj546Ar6crOxdVtdc";

try {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  console.log('Token:', token);
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('解码后的token:', decoded);
  
  console.log('用户ID:', decoded.userId);
  console.log('角色:', decoded.role);
  
} catch (error) {
  console.error('JWT验证失败:', error);
}
