-- CareConnect360 Database Schema Dump (MySQL 8.0)
-- Target Database: careconnect360_db

CREATE DATABASE IF NOT EXISTS `careconnect360_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `careconnect360_db`;

-- Accounts User Table
CREATE TABLE IF NOT EXISTS `accounts_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL UNIQUE,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `email` varchar(254) NOT NULL UNIQUE,
  `phone_number` varchar(15) NOT NULL,
  `role` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Doctor Profile Table
CREATE TABLE IF NOT EXISTS `accounts_doctorprofile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `specialization` varchar(100) NOT NULL,
  `qualification` varchar(150) NOT NULL,
  `license_number` varchar(50) NOT NULL UNIQUE,
  `experience_years` int unsigned NOT NULL,
  `consultation_fee` decimal(10,2) NOT NULL,
  `bio` longtext NOT NULL,
  `is_available` tinyint(1) NOT NULL,
  `user_id` bigint NOT NULL UNIQUE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_doctor_user` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Patient Profile Table
CREATE TABLE IF NOT EXISTS `accounts_patientprofile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(10) NOT NULL,
  `blood_group` varchar(5) NOT NULL,
  `address` longtext NOT NULL,
  `user_id` bigint NOT NULL UNIQUE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Appointments Table
CREATE TABLE IF NOT EXISTS `appointments_appointment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_date` date NOT NULL,
  `appointment_time` time(6) NOT NULL,
  `symptoms` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `doctor_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_appt_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Consultations Table
CREATE TABLE IF NOT EXISTS `appointments_consultation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `room_name` varchar(120) NOT NULL UNIQUE,
  `is_active` tinyint(1) NOT NULL,
  `doctor_joined` tinyint(1) NOT NULL,
  `patient_joined` tinyint(1) NOT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `ended_at` datetime(6) DEFAULT NULL,
  `notes` longtext NOT NULL,
  `appointment_id` bigint NOT NULL UNIQUE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cons_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments_appointment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS `prescriptions_prescription` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `diagnosis` longtext NOT NULL,
  `general_advice` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `appointment_id` bigint DEFAULT NULL UNIQUE,
  `doctor_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rx_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments_appointment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rx_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rx_patient` FOREIGN KEY (`patient_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Prescription Medicines Table
CREATE TABLE IF NOT EXISTS `prescriptions_prescriptionmedicine` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `medicine_name` varchar(200) NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `frequency` varchar(100) NOT NULL,
  `duration` varchar(100) NOT NULL,
  `instructions` varchar(255) NOT NULL,
  `prescription_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rx_med` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions_prescription` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Invoices Table
CREATE TABLE IF NOT EXISTS `billing_invoice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(64) NOT NULL UNIQUE,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(15) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `appointment_id` bigint NOT NULL UNIQUE,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_inv_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments_appointment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_patient` FOREIGN KEY (`patient_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments Table
CREATE TABLE IF NOT EXISTS `billing_payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(100) NOT NULL UNIQUE,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `payment_status` varchar(15) NOT NULL,
  `payment_date` datetime(6) NOT NULL,
  `payment_notes` longtext NOT NULL,
  `invoice_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pay_inv` FOREIGN KEY (`invoice_id`) REFERENCES `billing_invoice` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_patient` FOREIGN KEY (`patient_id`) REFERENCES `accounts_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
