const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const genrateToken = require("../config/jwt");
const validateMongodb = require("../utils/validateMongodb");
const genrateRefreshToken = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
// Create new User
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    const newUser = User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exsists");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await genrateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: genrateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = genrateToken(user?._id);
    res.json({ accessToken });
  });
});

//logout

const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No Refresh Token in Cookies");
  }

  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // No Content
  }

  await User.findOneAndUpdate(
    { refreshToken: refreshToken }, // Use the correct filter object
    { refreshToken: "" }
  );

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // No Content
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json({ getUsers });
  } catch (error) {
    throw new Error();
  }
});

// Get Single User
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodb(id);
  try {
    const getUser = await User.findById(id);
    res.json({ getUser });
  } catch (error) {
    throw new Error(error);
  }
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongodb(id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        firstName: req.body?.firstName,
        lastname: req.body?.lastName,
        email: req.body?.email,
        mobile: req.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json({ updateUser });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodb(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updateduser = await user.save();
    res.json(updateduser);
  } else {
    res.json(user);
  }
});

//Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodb(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodb(id);
  try {
    const blockedUser = await User.findByIdAndUpdate(id, {
      blocked: true,
    });
    res.json({ message: "User is blocked" });
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodb(id);
  try {
    const unblockedUser = await User.findByIdAndUpdate(id, {
      blocked: false,
    });
    res.json({ message: "User is unblocked" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser,
  updatePassword,
};
