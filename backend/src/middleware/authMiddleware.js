import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_toko_kelontong_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User tidak ditemukan' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token otorisasi' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user?.role || 'Guest'}) tidak memiliki akses ke fitur ini.`
      });
    }
    next();
  };
};
