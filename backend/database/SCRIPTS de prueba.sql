DELETE FROM roles;
INSERT INTO roles (nombre)
	VALUES 
	('SysAdmin'),
	('Rooter'),
	('Gerencia'),
	('Cajero'),
	('Administración'),
	('Asesor Coordinador'),
	('Asesor'),
	('Apoderados'),
	('Estudiantes') RETURNING *;

INSERT INTO asignacion_rol(id_usuario,id_rol)
	VALUES
	('1','10');

SELECT * FROM usuarios WHERE nro_carnet = 10 OR correo_electronico = 'abc';