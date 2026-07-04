-- ====================================================================
-- JAMESY STORE MANAGEMENT SYSTEM
-- Fresh Installation Script (3NF Normalized)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS jamesystore_db;
USE jamesystore_db;

-- 1. USERS TABLE
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Seed Admin Account (Password: admin@123)
INSERT INTO users (name, username, email, phone, email_verified_at, password, created_at, updated_at) 
VALUES (
    'Jamesy Acolicol', 
    'jamesy', 
    'jamesyacolicol@gmail.com', 
    '09289230563', 
    NOW(), 
    '$2y$12$clZ8AExm62gB0PzZ3XQvbeRAnp366/8.n3mNBywF6V2b7pY2L7Omi', 
    NOW(), 
    NOW()
);

-- 2. CUSTOMER TABLE
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) NULL,
    email VARCHAR(100) UNIQUE NULL
);

-- 3. CATEGORY TABLE
CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255) NULL
);

-- 4. PRODUCT TABLE
CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON UPDATE CASCADE
);

-- 5. ORDER TABLE
CREATE TABLE `order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL, 
    user_id BIGINT NOT NULL, 
    total_amount DECIMAL(10, 2) NOT NULL, 
    payment_amount DECIMAL(10, 2) NOT NULL, 
    change_amount DECIMAL(10, 2) NOT NULL,  
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
);

-- 6. ORDER LINE ITEM TABLE
CREATE TABLE order_line_item (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    ordered_price DECIMAL(10, 2) NOT NULL, 
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES `order`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON UPDATE CASCADE
);
