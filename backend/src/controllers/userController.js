import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { nama, username, password, role } = req.body;
    if (!nama || !username || !password) {
      return res.status(400).json({ message: 'Nama, username, dan password wajib diisi' });
    }

    const userExists = await User.findOne({ username: username.trim() });
    if (userExists) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const user = await User.create({
      nama: nama.trim(),
      username: username.trim(),
      password,
      role: role || 'kasir'
    });

    res.status(201).json({
      _id: user._id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, password, role, status } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    if (nama) user.nama = nama.trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) user.password = password;

    await user.save();

    res.json({
      _id: user._id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun Anda sendiri' });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: 'Akun berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
