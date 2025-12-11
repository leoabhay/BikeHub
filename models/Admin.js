const pool = require('../config/db');

class Admin {
  // Create a new admin
  static async create(username, password, phone_number, address, role = 'admin') {
    const query = 'INSERT INTO admins (username, password, phone_number, address, role) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [username, password, phone_number, address, role]);
    return result.insertId;
  }

  // Find an admin by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM admins WHERE username = ?';
    const [rows] = await pool.execute(query, [username]);
    return rows[0];
  }

  // Find an admin by ID
  static async findById(id) {
    const query = 'SELECT * FROM admins WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  // Update an admin's password
  static async updatePassword(id, newPassword) {
    const query = 'UPDATE admins SET password = ? WHERE id = ?';
    await pool.execute(query, [newPassword, id]);
  }

  // Update an admin's phone number and address
  static async updateProfile(id, phone_number, address) {
    const query = 'UPDATE admins SET phone_number = ?, address = ? WHERE id = ?';
    await pool.execute(query, [phone_number, address, id]);
  }

  // Delete an admin by ID
  static async delete(id) {
    const query = 'DELETE FROM admins WHERE id = ?';
    await pool.execute(query, [id]);
  }
}

module.exports = Admin;