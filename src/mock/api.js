// 模拟后端API的响应
const mockAPI = {
  // 模拟登录API
  login: (username, password) => {
    // 检查用户名和密码
    if (username === '18880880808' && password === '123456') {
      // 生成一个模拟的JWT token
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwidXNlcm5hbWUiOiJkb2N0b3IxMjMiLCJuYW1lIjoi5Li05rCR5Y2OIiwiaWF0IjoxNjE5NTc2MjMwLCJleHAiOjE2MTk2NjI2MzB9.3yTJzm8Qb9yBjJ0VFVf5d1j1RNS1m9zxMUI1gZNTUiI';
      
      // 返回成功响应
      return {
        code: 200,
        data: {
          token,
          doctorId: 9,
          name: '李医生',
          username: 'doctor123',
          phoneNumber: '18880880808',
          email: '20423969@qq.com',
          department: '眼科中心',
          doctorTitle: '主任医师',
          image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        msg: '登录成功'
      };
    } else {
      // 返回失败响应
      return {
        code: 401,
        data: null,
        msg: '用户名或密码错误'
      };
    }
  },
  
  // 模拟获取医生信息API
  getDoctorInfo: (doctorId) => {
    // 检查医生ID
    if (doctorId) {
      return {
        code: 200,
        data: {
          doctorId: 9,
          name: '李医生',
          username: 'doctor123',
          phoneNumber: '18880880808',
          email: '20423969@qq.com',
          department: '眼科中心',
          doctorTitle: '主任医师',
          image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        msg: '获取医生信息成功'
      };
    } else {
      return {
        code: 404,
        data: null,
        msg: '医生不存在'
      };
    }
  },
  
  // 模拟更新医生信息API
  updateDoctorInfo: (doctorData) => {
    // 检查医生数据
    if (doctorData && doctorData.doctorId) {
      return {
        code: 200,
        data: {
          ...doctorData,
          // 我们假设后端已经更新了数据
          image: doctorData.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        msg: '更新医生信息成功'
      };
    } else {
      return {
        code: 400,
        data: null,
        msg: '更新医生信息失败，数据不完整'
      };
    }
  }
};

export default mockAPI; 