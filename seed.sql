USE pos_practica;
INSERT INTO users (name, email, role) VALUES ('Admin','admin@example.com','admin'),
('Cajero 1','cajero1@example.com','cashier'),
('Cajero 2','cajero2@example.com','cashier'),
('Gerente','gerente@example.com','manager'),
('Soporte','soporte@example.com','manager');
INSERT INTO customers (name, phone, email, address) VALUES ('Cliente 1','477-000-0001','cliente1@mail.com','Calle 1 #123, León'),
('Cliente 2','477-000-0002','cliente2@mail.com','Calle 2 #123, León'),
('Cliente 3','477-000-0003','cliente3@mail.com','Calle 3 #123, León'),
('Cliente 4','477-000-0004','cliente4@mail.com','Calle 4 #123, León'),
('Cliente 5','477-000-0005','cliente5@mail.com','Calle 5 #123, León'),
('Cliente 6','477-000-0006','cliente6@mail.com','Calle 6 #123, León'),
('Cliente 7','477-000-0007','cliente7@mail.com','Calle 7 #123, León'),
('Cliente 8','477-000-0008','cliente8@mail.com','Calle 8 #123, León'),
('Cliente 9','477-000-0009','cliente9@mail.com','Calle 9 #123, León'),
('Cliente 10','477-000-0010','cliente10@mail.com','Calle 10 #123, León'),
('Cliente 11','477-000-0011','cliente11@mail.com','Calle 11 #123, León'),
('Cliente 12','477-000-0012','cliente12@mail.com','Calle 12 #123, León'),
('Cliente 13','477-000-0013','cliente13@mail.com','Calle 13 #123, León'),
('Cliente 14','477-000-0014','cliente14@mail.com','Calle 14 #123, León'),
('Cliente 15','477-000-0015','cliente15@mail.com','Calle 15 #123, León'),
('Cliente 16','477-000-0016','cliente16@mail.com','Calle 16 #123, León'),
('Cliente 17','477-000-0017','cliente17@mail.com','Calle 17 #123, León'),
('Cliente 18','477-000-0018','cliente18@mail.com','Calle 18 #123, León'),
('Cliente 19','477-000-0019','cliente19@mail.com','Calle 19 #123, León'),
('Cliente 20','477-000-0020','cliente20@mail.com','Calle 20 #123, León');
INSERT INTO products (name, sku, price, stock, status) VALUES ('Refresco Cola 600ml','SKU-1001',98.86,24,1),
('Refresco Naranja 600ml','SKU-1002',70.19,31,1),
('Agua 1L','SKU-1003',40.93,44,1),
('Papas Fritas 50g','SKU-1004',23.37,37,1),
('Galletas Chocolate','SKU-1005',62.67,30,1),
('Chocolate Barra','SKU-1006',72.31,43,1),
('Chicle Menta','SKU-1007',79.82,39,1),
('Jugo Manzana 500ml','SKU-1008',53.8,19,1),
('Café Molido 250g','SKU-1009',37.84,29,1),
('Té Verde 20 bolsas','SKU-1010',95.47,9,1),
('Pan Blanco','SKU-1011',75.05,29,1),
('Pan Integral','SKU-1012',112.13,45,1),
('Leche 1L','SKU-1013',119.58,13,1),
('Yogurt Natural 1L','SKU-1014',98.44,49,1),
('Queso Manchego 250g','SKU-1015',67.68,44,1),
('Jamón de Pavo 250g','SKU-1016',41.75,49,1),
('Atún en Agua 140g','SKU-1017',87.52,10,1),
('Aceite 1L','SKU-1018',61.39,41,1),
('Arroz 1kg','SKU-1019',48.16,33,1),
('Frijol 1kg','SKU-1020',81.27,14,1),
('Detergente 1kg','SKU-1021',51.23,45,1),
('Suavizante 1L','SKU-1022',50.15,34,1),
('Shampoo 750ml','SKU-1023',63.15,34,1),
('Jabón de Barra','SKU-1024',26.16,26,1),
('Toallas de Papel','SKU-1025',45.8,39,1);
-- Example sales
INSERT INTO sales (customer_id, total) VALUES (16, 0.00); SET @sale_id = LAST_INSERT_ID();
SET @price := (SELECT price FROM products WHERE id = 11);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 11, 2, @price, @price*2);
UPDATE products SET stock = stock - 2 WHERE id = 11;
SET @price := (SELECT price FROM products WHERE id = 8);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 8, 1, @price, @price*1);
UPDATE products SET stock = stock - 1 WHERE id = 8;
SET @price := (SELECT price FROM products WHERE id = 21);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 21, 2, @price, @price*2);
UPDATE products SET stock = stock - 2 WHERE id = 21;
SET @price := (SELECT price FROM products WHERE id = 18);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 18, 3, @price, @price*3);
UPDATE products SET stock = stock - 3 WHERE id = 18;
UPDATE sales SET total = (SELECT SUM(subtotal) FROM sale_items WHERE sale_id = @sale_id) WHERE id = @sale_id;
INSERT INTO sales (customer_id, total) VALUES (4, 0.00); SET @sale_id = LAST_INSERT_ID();
SET @price := (SELECT price FROM products WHERE id = 17);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 17, 3, @price, @price*3);
UPDATE products SET stock = stock - 3 WHERE id = 17;
SET @price := (SELECT price FROM products WHERE id = 2);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 2, 1, @price, @price*1);
UPDATE products SET stock = stock - 1 WHERE id = 2;
SET @price := (SELECT price FROM products WHERE id = 10);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 10, 1, @price, @price*1);
UPDATE products SET stock = stock - 1 WHERE id = 10;
UPDATE sales SET total = (SELECT SUM(subtotal) FROM sale_items WHERE sale_id = @sale_id) WHERE id = @sale_id;
INSERT INTO sales (customer_id, total) VALUES (16, 0.00); SET @sale_id = LAST_INSERT_ID();
SET @price := (SELECT price FROM products WHERE id = 15);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 15, 3, @price, @price*3);
UPDATE products SET stock = stock - 3 WHERE id = 15;
SET @price := (SELECT price FROM products WHERE id = 4);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 4, 2, @price, @price*2);
UPDATE products SET stock = stock - 2 WHERE id = 4;
SET @price := (SELECT price FROM products WHERE id = 6);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 6, 1, @price, @price*1);
UPDATE products SET stock = stock - 1 WHERE id = 6;
SET @price := (SELECT price FROM products WHERE id = 12);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 12, 2, @price, @price*2);
UPDATE products SET stock = stock - 2 WHERE id = 12;
UPDATE sales SET total = (SELECT SUM(subtotal) FROM sale_items WHERE sale_id = @sale_id) WHERE id = @sale_id;
INSERT INTO sales (customer_id, total) VALUES (8, 0.00); SET @sale_id = LAST_INSERT_ID();
SET @price := (SELECT price FROM products WHERE id = 10);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 10, 3, @price, @price*3);
UPDATE products SET stock = stock - 3 WHERE id = 10;
SET @price := (SELECT price FROM products WHERE id = 22);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 22, 3, @price, @price*3);
UPDATE products SET stock = stock - 3 WHERE id = 22;
UPDATE sales SET total = (SELECT SUM(subtotal) FROM sale_items WHERE sale_id = @sale_id) WHERE id = @sale_id;
INSERT INTO sales (customer_id, total) VALUES (19, 0.00); SET @sale_id = LAST_INSERT_ID();
SET @price := (SELECT price FROM products WHERE id = 17);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 17, 3, @price, @price*3);
UPDATE products SET stock = stock - 3 WHERE id = 17;
SET @price := (SELECT price FROM products WHERE id = 16);
INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (@sale_id, 16, 3, @price, @price*3);
UPDATE products SET stock = stock - 3 WHERE id = 16;
UPDATE sales SET total = (SELECT SUM(subtotal) FROM sale_items WHERE sale_id = @sale_id) WHERE id = @sale_id;