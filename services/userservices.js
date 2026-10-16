
const User = require('../models/user_model');

class UserService {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }
}

module.exports = new UserService();
