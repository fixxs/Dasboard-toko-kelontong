import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me')
};

export const userAPI = {
  getAll: () => API.get('/users'),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`)
};

export const barangAPI = {
  getAll: (params) => API.get('/barang', { params }),
  getById: (id) => API.get(`/barang/${id}`),
  create: (data) => API.post('/barang', data),
  update: (id, data) => API.put(`/barang/${id}`, data),
  delete: (id) => API.delete(`/barang/${id}`)
};

export const kategoriAPI = {
  getAll: () => API.get('/kategori'),
  create: (data) => API.post('/kategori', data),
  update: (id, data) => API.put(`/kategori/${id}`, data),
  delete: (id) => API.delete(`/kategori/${id}`)
};

export const supplierAPI = {
  getAll: () => API.get('/supplier'),
  create: (data) => API.post('/supplier', data),
  update: (id, data) => API.put(`/supplier/${id}`, data),
  delete: (id) => API.delete(`/supplier/${id}`)
};

export const transaksiAPI = {
  getAll: (params) => API.get('/transaksi', { params }),
  create: (data) => API.post('/transaksi', data),
  delete: (id) => API.delete(`/transaksi/${id}`)
};

export const kasHarianAPI = {
  getToday: (date) => API.get('/kas-harian/today', { params: { date } }),
  getHistory: () => API.get('/kas-harian/history'),
  tutupToko: (data) => API.post('/kas-harian/tutup-toko', data)
};

export const biayaOperasionalAPI = {
  getAll: (params) => API.get('/biaya-operasional', { params }),
  create: (data) => API.post('/biaya-operasional', data),
  update: (id, data) => API.put(`/biaya-operasional/${id}`, data),
  delete: (id) => API.delete(`/biaya-operasional/${id}`)
};

export const laporanAPI = {
  getLabaRugi: (params) => API.get('/laporan/laba-rugi', { params }),
  getMonthlyPreview: (year) => API.get('/laporan/laba-rugi/monthly-preview', { params: { year } })
};

export const stokOpnameAPI = {
  getAll: (params) => API.get('/stok-opname', { params }),
  create: (data) => API.post('/stok-opname', data)
};

export const exportAPI = {
  download: (params) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    window.open(`http://localhost:5000/api/export?${queryString}`, '_blank');
  }
};

export default API;
