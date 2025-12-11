const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new admin
const registerAdmin = async (req, res) => {
  try {
    const { username, password, phone_number, address } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin
    const adminId = await Admin.create(
      username,
      hashedPassword,
      phone_number,
      address
    );

    res
      .status(201)
      .json({ message: "Admin registered successfully", id: adminId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering admin", error: error.message });
  }
};

// Login an admin
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const { password, ...adminData } = admin;

    res.status(200).json(adminData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin profile", error: error.message });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { phone_number, address } = req.body;

    // Update the admin's profile
    await Admin.updateProfile(adminId, phone_number, address);

    res.status(200).json({ message: "Admin profile updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating admin profile", error: error.message });
  }
};

// Delete an admin
const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    await Admin.delete(adminId);

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  deleteAdmin,
};