const User = require('./user.model');

const getUserById = async (userId) => {
  return await User.findById(userId).select('-password');
};

const getAllUsers = async (query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);
  
  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

const updateUserStatus = async (userId, status) => {
  const user = await User.findByIdAndUpdate(userId, { status }, { new: true, runValidators: true });
  if (!user) throw new Error('User not found');
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');
};

const addUserAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (addressData.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  // Format GeoJSON if coords provided
  if (addressData.longitude && addressData.latitude) {
    addressData.location = {
      type: 'Point',
      coordinates: [addressData.longitude, addressData.latitude]
    };
  }

  user.addresses.push(addressData);
  await user.save();
  return user.addresses;
};

const updateUserAddress = async (userId, addressId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const address = user.addresses.id(addressId);
  if (!address) throw new Error('Address not found');

  if (addressData.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  if (addressData.longitude && addressData.latitude) {
    addressData.location = {
      type: 'Point',
      coordinates: [addressData.longitude, addressData.latitude]
    };
  }

  Object.assign(address, addressData);
  await user.save();
  return user.addresses;
};

const deleteUserAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.addresses.pull({ _id: addressId });
  await user.save();
  return user.addresses;
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUserStatus,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress
};
