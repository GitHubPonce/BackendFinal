import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'mi_secreto');
    req.userId = decoded.userId;
    console.log('userId extraído:', req.userId);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export default auth;
