const pool = require("../config/db");
const Brand = require("./Brand");

class Vehicle {
  static async create(vehicleData) {
    const {
      name,
      description = null,
      price = null,
      image = null,
      model_year = null,
      mileage = null,
      engine_cc = null,
      fuel_type = null,
      transmission = null,
      color = null,
      abs = 0, 
      brand_id,
    } = vehicleData;
  
 
    if (!name || !brand_id ) {
      throw new Error("Name and Brand are required");
    }
  
    const query = `
      INSERT INTO vehicles 
      (name, description, price, image, model_year, mileage, engine_cc, 
       fuel_type, transmission, color, abs, brand_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      name,
      description,
      price,
      image,
      model_year,
      mileage,
      engine_cc,
      fuel_type,
      transmission,
      color,
      abs ? 1 : 0,
      brand_id,
    ]);
    
    return result.insertId;
  }

  static async findAll(page=1,limit=10) {
    try {
      const offset=(page-1)*limit;
      const numericLimit=Number(limit);
      const numericOffset=Number(offset);

      const query = `
      SELECT v.*, ABS(v.abs) as abs, b.name as brand_name 
      FROM vehicles v 
      LEFT JOIN brands b ON v.brand_id = b.id
      ORDER BY v.id DESC LIMIT ${numericLimit} OFFSET ${numericOffset}
    `;
    const countQuery="SELECT COUNT(*) as total from vehicles";
    const [rows] = await pool.execute(query);
    const [totalRows]=await pool.execute(countQuery);
     return {
      data: rows.map((vehicle) => ({
        ...vehicle,
        abs: Boolean(vehicle.abs),
      })),
      total: totalRows[0].total,
      page: Number(page),
      limit: numericLimit,
      totalPages: Math.ceil(totalRows[0].total / numericLimit),
    };
    } catch (error) {
      console.error("Error in Vehicle.findAll: ",error);
      throw error;
    }
   
  }

  // Find a vehicle by ID
  static async findById(id) {
    const query = "SELECT *,ABS(abs) as abs FROM vehicles WHERE id = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows.length ? { ...rows[0], abs: Boolean(rows[0].abs) } : null;
  }

  static async update(id, vehicleData) {
    const fields = [];
    const values = [];

    // Loop through the vehicleData and build the query dynamically
    for (const [key, value] of Object.entries(vehicleData)) {
      if (value !== undefined) {
        // Only include fields that are provided
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    // Add the ID to the values array for the WHERE clause
    values.push(id);

    const query = `
      UPDATE vehicles
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await pool.execute(query, values);
  }
  // Delete a vehicle by ID
  static async delete(id) {
    const query = "DELETE FROM vehicles WHERE id = ?";
    await pool.execute(query, [id]);
  }

  static async findByBrandId(brandId) {
    const query = `
      SELECT * FROM vehicles
      WHERE brand_id = ?
    `;
    const [rows] = await pool.execute(query, [brandId]);
    return rows;
  }
}

module.exports = Vehicle;