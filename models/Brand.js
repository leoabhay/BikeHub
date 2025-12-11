const pool = require('../config/db'); 
class Brand {
  // Create a new brand
  static async create(name, logo) {
    const query = 'INSERT INTO brands (name, logo) VALUES (?, ?)';
    const [result] = await pool.execute(query, [name, logo]);
    return result.insertId;
  }

  static async findAllForBikes() {
    const query = 'SELECT * FROM brands';
    const [rows] = await pool.execute(query);
    return rows; 
  }

  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const numericLimit = Number(limit);
      const numericOffset = Number(offset);

      const query = `SELECT * FROM brands ORDER BY id DESC LIMIT ${numericLimit} OFFSET ${numericOffset} `;
      const countQuery = "SELECT COUNT(*) as total FROM brands";

      const [rows] = await pool.execute(query);
      const [totalRows] = await pool.execute(countQuery);

      return {
        data: rows,
        total: totalRows[0].total,
        page: Number(page),
        limit: numericLimit,
        totalPages: Math.ceil(totalRows[0].total / numericLimit),
      };
    } catch (error) {
      console.error("Error in Brand.findAll:", error);
      throw error;
    }
  }

  // Find a brand by ID
  static async findById(id) {
    const query = 'SELECT * FROM brands WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  // Update a brand by ID
  static async update(id, name, logo) {
    const query = 'UPDATE brands SET name = ?, logo = ? WHERE id = ?';
    await pool.execute(query, [name, logo, id]);
  }

  static async delete(id) {
    const query = 'DELETE FROM brands WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows; 
  }
  
}

module.exports = Brand;