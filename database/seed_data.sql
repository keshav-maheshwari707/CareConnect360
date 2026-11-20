-- CareConnect360 Seed Data (MySQL 8.0)
-- Target Database: careconnect360_db

USE `careconnect360_db`;

-- Passwords below use Django PBKDF2 SHA-256 for:
-- 'AdminPassword123!' -> Admin
-- 'DoctorPass123!' -> Doctor
-- 'PatientPass123!' -> Patient

-- Check or insert Admin
INSERT INTO `accounts_user` (`id`, `password`, `is_superuser`, `username`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `email`, `phone_number`, `role`)
VALUES 
(1, 'pbkdf2_sha256$870000$test$hGj8gQoTzLz/8q2U1R3h2Q==', 1, 'admin', 'System', 'Admin', 1, 1, NOW(), 'admin@careconnect360.com', '+919999999999', 'ADMIN')
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

-- Check or insert sample Doctor
INSERT INTO `accounts_user` (`id`, `password`, `is_superuser`, `username`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `email`, `phone_number`, `role`)
VALUES 
(2, 'pbkdf2_sha256$870000$test$hGj8gQoTzLz/8q2U1R3h2Q==', 0, 'dr_sharma', 'Rajesh', 'Sharma', 0, 1, NOW(), 'dr.sharma@careconnect360.com', '+919876500001', 'DOCTOR')
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

INSERT INTO `accounts_doctorprofile` (`id`, `specialization`, `qualification`, `license_number`, `experience_years`, `consultation_fee`, `bio`, `is_available`, `user_id`)
VALUES 
(1, 'Cardiology', 'MBBS, MD (Cardiology), FACC', 'MCI-CARD-9921', 12, 800.00, 'Senior Interventional Cardiologist specializing in hypertension and preventative cardiology.', 1, 2)
ON DUPLICATE KEY UPDATE `license_number`=VALUES(`license_number`);

-- Check or insert sample Patient
INSERT INTO `accounts_user` (`id`, `password`, `is_superuser`, `username`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `email`, `phone_number`, `role`)
VALUES 
(3, 'pbkdf2_sha256$870000$test$hGj8gQoTzLz/8q2U1R3h2Q==', 0, 'anita_verma', 'Anita', 'Verma', 0, 1, NOW(), 'anita.verma@gmail.com', '+919876500002', 'PATIENT')
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

INSERT INTO `accounts_patientprofile` (`id`, `date_of_birth`, `gender`, `blood_group`, `address`, `user_id`)
VALUES 
(1, '1995-04-12', 'FEMALE', 'B+', '42 Sector 14, Gurugram, Haryana', 3)
ON DUPLICATE KEY UPDATE `blood_group`=VALUES(`blood_group`);
