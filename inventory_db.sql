CREATE DATABASE inventory_db;
  USE inventory_db;
  CREATE TABLE items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL UNIQUE,
      category VARCHAR(100) NOT NULL,
      status ENUM('Active','Inactive','Error') NOT NULL DEFAULT 'Active',
      quantity INT NOT NULL DEFAULT 0,
      supplier VARCHAR(255),
      location VARCHAR(255),
      updated DATE,
      notes TEXT
  );