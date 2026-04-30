-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 30, 2026 at 05:05 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campus_locator`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', 'temp123', '2026-04-16 15:20:13');

-- --------------------------------------------------------

--
-- Table structure for table `assistance`
--

DROP TABLE IF EXISTS `assistance`;
CREATE TABLE `assistance` (
  `id` int NOT NULL,
  `building_id` int NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `assistance`
--

INSERT INTO `assistance` (`id`, `building_id`, `question`, `answer`, `created_at`) VALUES
(18, 38, 'Where is the CEA Main Building?', 'Located between Industrial Engineering Building and University Food Center Building', '2026-04-23 06:14:50'),
(19, 35, 'Where is CCS Building located?', 'In front of CEA Ext Building', '2026-04-23 06:19:11'),
(20, 18, 'Where is registrar?', 'Ground Floor inside Admission Building', '2026-04-23 06:30:35'),
(21, 14, 'Where is the Office of Culture and Arts?', 'Located ground floor inside the University Museum Building', '2026-04-23 06:37:23'),
(22, 14, 'Where is the Museum?', 'Located near gate 2 and College of Education Building', '2026-04-23 06:44:36'),
(23, 52, 'Where is Junior Highschool Building located?', 'Located near gate 9 beside CPE, Infront of Auditorium', '2026-04-23 06:53:39'),
(24, 64, 'Where is the Covered Court?', 'Located inside Dubai between CAS Building and Nursing Building, near Dr. Ernesto Nicdao Sport Center', '2026-04-23 06:57:07'),
(26, 30, 'Where is the CPE Faculty Office?', 'Located at 2nd Floor of CPE Building', '2026-04-23 08:09:50'),
(27, 48, 'Where is the Clinic?', 'Located near gate 6, besides College of Business Studies Building', '2026-04-23 08:42:32'),
(28, 15, 'Where is the classrooms of College of Education/COE Building?', 'Located in College of Education Building, Ground Floor - 3rd Floor', '2026-04-23 08:45:51'),
(29, 16, 'Where is the of College of Education/COE Building?', 'Located near gate 2 and gate 3, in the middle of Graduate School Building and College of Education', '2026-04-23 08:49:52'),
(30, 17, 'Where is the Graduate School Building 2?', 'Located near gate 3, beside College of Education Extension 1 Building', '2026-04-23 08:52:35'),
(31, 18, 'Where is the Office of the University President?', 'Located inside the Admin building upper floor', '2026-04-23 08:55:49'),
(32, 18, 'Where is the Office of the Vice President for academic affairs/OVPAA?', 'Located inside the admin building upper floor, near the office of the president', '2026-04-23 08:58:35'),
(33, 18, 'Where is the Office of the Executive Vice President/VP for Administration and finance?', 'Located inside the admin building upper floor, near the office of the Vice President', '2026-04-23 09:00:09'),
(34, 18, 'Where is the Board Secretary Office?', 'Located inside the admin building upper floors, near the administration and finance office', '2026-04-23 09:01:03'),
(35, 18, 'Where is the Office of the Director Administrative Services?', 'Located inside the admin building ground floor, near the registrar', '2026-04-23 09:03:02'),
(36, 18, 'Where is the Administrative Services Office?', 'Located inside the Admin Building ground floor, near Office of the Director of Administrative Services', '2026-04-23 09:04:23'),
(37, 18, 'Where is the Communication of Audit/COA?', 'Located inside the admin building ground floor, near Administrative Services Office', '2026-04-23 09:06:03'),
(38, 18, 'Where is the Planning and Development Office?', 'Located inside the admin building ground floor, near Commission on Audit', '2026-04-23 09:07:28'),
(39, 18, 'Where is the Cashier?', 'Located inside the admin building ground floor, Infront registrar', '2026-04-23 09:08:20'),
(40, 18, 'Where is the Compensation and Benefits Unit?', 'Located inside the admin building upper floor', '2026-04-23 09:09:47'),
(41, 18, 'Where is the Legal Affairs Unit?', 'Located inside the admin building upper floor, near compensation benefits unit', '2026-04-23 09:10:37'),
(42, 18, 'Where is the Internal Audit Unit?', 'Located inside the admin building upper floor, near legal affairs unit', '2026-04-23 09:11:37'),
(43, 19, 'Where is the Office of Admission?', 'Located inside the University near the main gate and gate 4', '2026-04-23 09:13:25'),
(44, 19, 'Where is the Financial Management Service Office?', 'Located inside the University near the main gate and gate 4', '2026-04-23 09:15:06'),
(45, 20, 'Where is the Library?', 'Located near or behind Admin Building', '2026-04-23 09:16:21'),
(46, 21, 'Where is the ICT/MIS Building?', 'Located near Graduate School Building', '2026-04-23 09:17:33'),
(47, 22, 'Where is the VPSAS Office?', 'Located near gate 3 beside Integrated Science Laboratory Building', '2026-04-23 09:20:03'),
(48, 22, 'Where is the Graduate School Faculty Office?', 'Located near gate 3, beside Integrated Science School Building', '2026-04-23 09:22:30'),
(49, 23, 'Where is the Junior High School Faculty Office?', 'Located inside Integrated Science Laboratory Building', '2026-04-23 09:24:14'),
(50, 24, 'Where is the Supply office?', 'Located near gate 3', '2026-04-23 09:27:45'),
(51, 25, 'Where is the General Facility Office?', 'Located near gate 3 beside Supply Office Building', '2026-04-23 09:29:41'),
(52, 26, 'Where is the Electrical Technology Building?', 'Located near gate 3 beside General Services Building', '2026-04-23 09:31:28'),
(53, 27, 'Where is the NSTP (CWTS, LTS, AND ROTC) Office?', 'Located near gate 3 beside electrical technology building', '2026-04-23 09:33:12'),
(54, 28, 'Where is the Motorpool Office?', 'Actually there are two Motorpool facility,\na. Beside NSTP Building\nb. TSO at dubai / extension lot', '2026-04-23 09:35:41'),
(55, 29, 'Where is the Laboraties and Workshop?', 'Located beside Waterpool Building', '2026-04-23 09:45:50'),
(56, 31, 'Where is the General Shoproom Building?', 'Located in front of College of Industrial Technology Building', '2026-04-23 09:48:08'),
(57, 32, 'Where is the Old CAS Faculty?', 'Located behind General Shoproom Building and located in front of Student Services Building', '2026-04-23 09:49:13'),
(58, 33, 'Where is the Office of Student Affairs?', 'Located near USC Office, Infront of Old CAS Building', '2026-04-23 09:51:06'),
(59, 35, 'Where is the College of Computing Studies Building?', 'Located beside Information Communication Technology/ICT Laboratory Building', '2026-04-23 09:56:19'),
(60, 37, 'Where is the Food Center/UFC?', 'Located beside College of Engineering and Architecture Building', '2026-04-23 09:58:55'),
(61, 40, 'Where is the Architecture Deans Office?', 'Located upper floor of CEA Extension', '2026-04-23 10:03:45'),
(62, 41, 'Where is the IE Building?', 'Located beside CEA Extension', '2026-04-23 10:14:58'),
(63, 42, 'Where is the Food Technology Building?', 'Located besides CSSP Building', '2026-04-23 10:31:39'),
(64, 43, 'Where is Technical Vocational Building?', 'Located near CPE Building and near Auditorium', '2026-04-23 10:34:19'),
(65, 46, 'Where is the Engineering Building 1?', 'Located infront of Clinic Building.', '2026-04-23 10:39:54'),
(67, 54, 'Where is the College of Business Studies Building 1?', 'Located Beside Medical Clinic', '2026-04-23 10:47:59'),
(68, 50, 'Where is the College of Business Studies Building 3?', 'Located Infront Electrical Building', '2026-04-23 10:51:12'),
(69, 51, 'Where is the Auditorium?', 'Located Infront of Junior High School Building, beside Technical Vocational Building', '2026-04-23 10:53:18'),
(70, 56, 'Where is the Assessment Center?', 'Located near Gate 5 Beside Junior High School Building', '2026-04-23 10:55:25'),
(71, 49, 'Where is the College of Business Studies Building 2?', 'Located Infront of College of Business Studies Building', '2026-04-23 10:57:06'),
(72, 55, 'Where is Multi-Disciplinary Resource and Tourism Building?', 'Located behind College of Business Studies 3', '2026-04-23 11:00:24'),
(73, 57, 'Where is the Hostel?', 'Located near gate 5', '2026-04-23 11:03:11'),
(74, 58, 'Where is the Executive Lounge?', 'Located beside Hostel Building near gate 5', '2026-04-23 11:04:39'),
(75, 59, 'Where is the Multi-Purpose Hall?', 'Located near gate 5', '2026-04-23 11:07:00'),
(76, 61, 'Where is the College of Arts and Sciences?', 'Located in extension lot/dubai', '2026-04-23 11:09:33'),
(77, 62, 'Where is the Production Center?', 'Located near production center, inside dubai, near gate 7', '2026-04-23 11:15:26'),
(78, 69, 'Where is the Production Center Ext?', 'Located inside the dubai near gate 7', '2026-04-23 11:18:03'),
(79, 63, 'Where is the Health and Sciences Building?', 'Located near parking area', '2026-04-23 11:21:29'),
(81, 65, 'Where is the new IPE Faculty Office?', 'Located Beside the University Pool', '2026-04-23 11:31:09'),
(82, 67, 'Where is the Doctor Ernesto Nicdao Sports Center Building?', 'Located after College of Education Building', '2026-04-23 11:37:48'),
(83, 73, 'Where is the Old IPE Faculty?', 'Located Inside Extension Lot, beside Doctor Nicdao Sports Center Building', '2026-04-23 15:27:38'),
(84, 14, 'Where is the Exhibit?', 'Located inside the University Museum', '2026-04-23 16:07:34'),
(85, 15, 'Where is the faculty of College of Education?', 'Located inside the College of Education Building', '2026-04-23 16:09:47'),
(86, 15, 'Where is the Dean\'s Office of College of Education?', 'Located inside the College of Education Building', '2026-04-23 16:10:37'),
(87, 17, 'Where are the Classroom of Graduate School?', 'Located inside Graduate Building 2', '2026-04-23 16:13:18'),
(88, 24, 'Where is the Janitor room?', 'Located inside the Supply Building', '2026-04-23 16:19:13'),
(89, 24, 'Where is Guard Room', 'Located inside the Supply Building', '2026-04-23 16:20:18'),
(90, 23, 'Where is the Integrated Science Laboratory Building?', 'Located inside the University, beside Graduate School Building', '2026-04-23 16:23:45'),
(91, 21, 'Where is the IT Office?', 'Located inside MIS Building', '2026-04-23 16:26:22'),
(92, 20, 'Where is the AVR Room?', 'Located inside the Library, 3rd Floor', '2026-04-23 16:28:03'),
(93, 20, 'Where is DR/Discussion Room?', 'Located inside the Library, 1st Floor - 3rd Floor', '2026-04-23 16:29:33'),
(94, 29, 'Where is the Industrial Technology Building?', 'Located near Motorpool and infront of General Shoproom', '2026-04-23 16:32:28'),
(95, 32, 'Where is the Old CAS Building?', 'Located Infront of Students Services Unit Building', '2026-04-23 16:34:10'),
(96, 32, 'Where is the Student Services Building?', 'Located Infront of College of Arts and Sciences Building', '2026-04-23 16:36:15'),
(97, 33, 'Where is USC Office/University Student Council?', 'Located near Office of Student Affairs', '2026-04-23 16:40:27'),
(98, 36, 'Where is ICT Laboratory Building?', 'Located near CCS Building', '2026-04-23 16:42:21'),
(99, 35, 'Where is the CCS Building?', 'Located beside the ICT Laboratory Building', '2026-04-23 16:44:20'),
(100, 70, 'Where is the CSSP Deans Office?', 'Located inside CSSP Building, Ground Floor', '2026-04-23 16:45:00'),
(101, 70, 'Where is the CSSP Building?', 'Located between CCS Building and Food Tech Building', '2026-04-23 16:46:05'),
(102, 70, 'Where is CSSP Faculty?', 'Located inside CSSP Building, Ground Floor', '2026-04-23 16:47:17'),
(103, 70, 'Where are the Classroom of College of Social Sciences?', 'Located inside the CSSP Building, Ground Floor - 2nd Floor', '2026-04-23 16:49:45'),
(104, 35, 'Where is the Classroom of IT Students?', 'Located inside CCS Building, Ground Floor - 2nd Floor', '2026-04-23 16:51:52'),
(105, 42, 'Where is the Food Technology Classroom?', 'Located inside the Food Technology Building', '2026-04-23 16:54:32'),
(106, 42, 'Where is the Food Technology Faculty Office?', 'Located inside Food Technology Building', '2026-04-23 16:55:50'),
(107, 71, 'Where is BAC Office?', 'Located upstairs of UFC Building', '2026-04-23 16:57:46'),
(108, 72, 'Where is the Occupational Safety and Health Office?', 'Located upstairs of UFC Building, beside BAC Office', '2026-04-23 16:59:09'),
(109, 40, 'Where is the CEA Ext?', 'Located in CEA Main Building', '2026-04-23 17:03:17'),
(110, 38, 'Where is CEA Main?', 'Located between UFC and Clinic', '2026-04-23 17:04:24'),
(111, 38, 'Where is the Computer Laboratory?', 'Located inside CEA Main Building', '2026-04-23 17:05:47'),
(112, 38, 'Where is the Engineering Laboratory?', 'Located near Medical and Clinic Building', '2026-04-23 17:07:21'),
(113, 38, 'Where is the Civil Engineering Faculty?', 'Located at 3rd Floor of CEA Main Building', '2026-04-23 17:08:05'),
(114, 38, 'Where is the Electrical Engineering Faculty?', 'Located at 3rd Floor CEA Main Building', '2026-04-23 17:09:46'),
(115, 38, 'Where is the Electronics Engineering Faculty?', 'Located at 3rd Floor of CEA Main Building', '2026-04-23 17:10:39'),
(116, 38, 'Where is the A-CAD Laboratory?', 'Located at 2nd Floor of CEA Main Building', '2026-04-23 17:11:59'),
(117, 41, 'Where is the Industrial Engineering Faculty?', 'Located at Ground Floor of IE Building', '2026-04-23 17:13:40'),
(118, 41, 'Where is Mechanical Engineering Faculty?', 'Located at Ground Floor of IE Building', '2026-04-23 17:15:16'),
(119, 54, 'Where are the Classrooms of College of Business Studies Students', 'Located in CBS 1, CBS 2, CBS 3 Building', '2026-04-23 17:21:45'),
(120, 52, 'Where are the Junior High School Classrooms?', 'Located inside the Junior High School Building', '2026-04-23 17:25:58'),
(121, 74, 'Where is the COOP?', 'Located near gate 5 and beside Multi-Purpose Hall Building', '2026-04-23 17:39:21'),
(122, 76, 'Where is the EE Building?', 'Located near Engineering Building 1', '2026-04-23 17:43:07'),
(123, 76, 'Where is Electrical Engineering Classrooms?', 'Located inside Electrical Engineering Building', '2026-04-23 17:46:28'),
(124, 46, 'Where are the Engineering Classrooms?', 'Located inside CEA Main Building, CEA Main Extension Building, Industrial Engineering Building, Electrical Engineering Building, Engineering Building 1, Engineering Laboratory Building', '2026-04-23 17:49:51'),
(125, 61, 'Where are the College of Arts and Sciences Classroom?', 'Located at Old CAS and Dubai College of Arts and Sciences Building', '2026-04-23 17:53:27'),
(126, 35, 'Where is the Computer Science Students Classroom?', 'Located inside the College of Computing Studies Building', '2026-04-23 17:56:58'),
(127, 61, 'Where is the Dean\'s Office of CAS?', 'Located inside the College of Arts and Sciences Building', '2026-04-23 17:59:54'),
(128, 63, 'Where is the Nursing Building?', 'Located near Parking Area', '2026-04-23 18:02:24'),
(129, 63, 'Where is the Classroom of Nursing Students?', 'Located at Ground Floor - 3rd Floor of Nursing Building', '2026-04-23 18:03:32'),
(130, 63, 'Where is the Faculty Office of Nursing?', 'Located at Ground Floor of Nursing Building', '2026-04-23 18:04:47'),
(131, 77, 'Where is the TSO?', 'Located near Parking Area', '2026-04-23 18:18:53'),
(132, 66, 'Where is Cafe Honorio?', 'Located in Dubai, near Swimming Pool', '2026-04-23 18:23:01'),
(133, 66, 'Where is the University Pool?', 'Located near Physical Education Covered Court', '2026-04-23 18:27:09'),
(134, 61, 'Where is Psych Classrooms?', 'Located Inside CAS Building', '2026-04-23 18:29:38'),
(135, 61, 'Where is the Classroom of BS Mathematics?', 'Located inside CAS Building', '2026-04-23 18:33:07'),
(136, 61, 'Where is the Classroom of Social Sciences?', 'Located inside CAS Building', '2026-04-23 18:34:43'),
(137, 61, 'Where is the Classroom of BS in English Student?', 'Located inside CAS Building', '2026-04-23 18:35:23'),
(138, 54, 'Where is the Classroom of BS in Economics?', 'Located in CBS 1, CBS 2, CBS 3', '2026-04-23 18:36:38'),
(139, 54, 'Where is the Classroom of BS in Accountancy?', 'Located in CBS 1, CBS 2, CBS 3 Building', '2026-04-23 18:37:45'),
(140, 54, 'Where is the Classroom of BS Marketing Students?', 'Located in CBS 1, CBS 2, CBS 3 Building', '2026-04-23 18:39:30'),
(141, 54, 'Where is the Classroom of BS Entreprenurship?', 'Located at CBS 1, CBS 2, CBS 3 Building', '2026-04-23 18:40:22'),
(142, 78, 'Where is the CE and ME Laboratory Building?', 'Located beside IE Building', '2026-04-25 17:44:31'),
(143, 79, 'Where is Merchandise?', 'Located in Dubai, near Physical Education Covered Court.', '2026-04-27 03:29:46'),
(144, 79, 'Where is Cafe Honorio?', 'Located near by University Pool, Besides Merchandise.', '2026-04-27 03:30:37');

-- --------------------------------------------------------

--
-- Table structure for table `buildings`
--

DROP TABLE IF EXISTS `buildings`;
CREATE TABLE `buildings` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_featured` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `buildings`
--

INSERT INTO `buildings` (`id`, `name`, `code`, `description`, `created_at`, `is_featured`) VALUES
(14, 'University Museum Building', 'Museum', 'Located inside university', '2026-04-20 13:18:34', 0),
(15, 'College of Education Building', 'COE Building', 'Inside the university', '2026-04-20 13:21:12', 0),
(16, 'College of Education Building Extension 1', 'COE Extension 1', 'Lecture and Class use', '2026-04-20 13:32:20', 0),
(17, 'Graduate School Building 2', 'Grad School 2', '·Dedicated classrooms for postgraduate studies.', '2026-04-20 13:35:20', 0),
(18, 'Administration Building', 'Admin Building', 'An Admin Building is a Central Hub where the leadership and major offices are located. it is responsible for managing the overall operations policies and services of the institution', '2026-04-20 13:42:00', 1),
(19, 'Three Storey Academic Building 2', 'Acad Building', 'Inside the University', '2026-04-20 14:19:58', 0),
(20, 'Three Storey Learning Resource Center', 'Library', '·  Application of library card\n·  Student and Faculty\n·  Barrowing and Returning Book\n·  Reserve room', '2026-04-20 14:28:53', 0),
(21, 'Management Information System Building', 'ICT/MIS Building', 'Inside the University', '2026-04-20 14:31:44', 0),
(22, 'Graduate School Building', 'Grad School', 'Inside the University', '2026-04-20 14:36:23', 0),
(23, 'Integrated Science Laboratory Building', 'Science Laboratory', 'Faculty office for JHS educators.', '2026-04-22 13:33:05', 0),
(24, 'Procurement and Supply Building', 'Procurement Building', 'Handles university supply acquisition.', '2026-04-22 13:38:54', 0),
(25, 'Security and General Services Building', 'Genservice Building', 'Ensures safety and order in campus', '2026-04-22 13:59:06', 0),
(26, 'Electrical Technology Building', 'EE Building', 'Facility for electrical technology courses.', '2026-04-22 14:08:53', 0),
(27, 'NSTP Building', 'NSTP Office', 'Manages national service training programs.', '2026-04-22 14:11:31', 0),
(28, 'Motorpool Building', 'Motor Building', 'Handles university transport services.', '2026-04-22 14:17:47', 0),
(29, 'College of Industrial Technology Building', 'CIT Building', 'Practical learning facility for industrial tech students.', '2026-04-22 14:19:53', 0),
(30, 'Information and Technology, Computer Engineering Building', 'IT & CPE Building', 'Inside University Campus', '2026-04-22 14:32:14', 0),
(31, 'General Shoproom Building', 'Genshoproom Building', 'Office for industrial technology educators.', '2026-04-22 14:38:17', 0),
(32, 'Old Building of College of Arts and Sciences', 'Old CAS Building', 'Former CAS faculty office building.', '2026-04-22 14:44:51', 0),
(33, 'Student Services Building', 'Student Services', 'Manages student development programs.', '2026-04-22 14:48:15', 0),
(34, 'Integrated HRM Laboratory Building', 'HRM Laboratory', 'Training lab for HRM students', '2026-04-22 14:50:37', 0),
(35, 'College of Computing Studies Building', 'CCS', 'Lecture rooms for CCS students.', '2026-04-22 14:53:38', 0),
(36, 'ICT Laboratory Building', 'ICT Laboratory', 'Administrative office for CCS.', '2026-04-22 14:58:44', 0),
(37, 'University Food Center', 'Food Center/UFC', 'Manages award and procurement processes.', '2026-04-22 15:01:20', 0),
(38, 'CEA Main Building', 'CEA Main', 'Building for Cea faculty and students', '2026-04-22 15:17:15', 0),
(40, 'CEA Extension Building', 'CEA EXT', 'Extension academic building for CEA.', '2026-04-22 15:21:16', 0),
(41, 'IE Laboratory Building', 'IE Building', 'Laboratory and Classrooms', '2026-04-22 15:29:58', 0),
(42, 'Food Technology Building', 'Food Tech', 'Facility for food tech studies.', '2026-04-22 15:43:11', 0),
(43, 'Technical Vocational Building', 'Vocational Building', 'Skills training facility.', '2026-04-22 15:50:22', 0),
(44, 'Comfort Room Building', 'Comfort Room/CR', 'Sanitation facility for campus users.', '2026-04-22 16:08:41', 0),
(45, 'Engineering Building 2', 'ENG-2', 'Engineering academic buildings.', '2026-04-22 16:21:53', 0),
(46, 'Engineering Building 1', 'ENG-1', 'Laboratory, Lecture and Class use.', '2026-04-22 16:34:17', 0),
(48, 'Medical and Dental Clinic', 'Medical Clinic', 'Campus health facility.', '2026-04-22 16:50:44', 0),
(49, 'College of Business Studies Building 2', 'CBS-2', 'College of Business Studies building, used for related classes  offices, and learning facilities.', '2026-04-22 16:56:28', 0),
(50, 'College of Business Studies Building 3', 'CBS 3', 'College of Business Studies building, used for related classes, offices, and learning facilities.', '2026-04-22 17:00:08', 0),
(51, 'University Auditorium', 'Auditorium', 'Primary venue for university events, assemblies, performances, and academic performances.', '2026-04-22 17:53:30', 0),
(52, 'Junior High School Building', 'JHS-BLDG', 'An academic facility for junior high school students, housing classrooms and learning spaces.', '2026-04-22 18:02:26', 0),
(54, 'College of Business Studies Building 1', 'CBS-1', 'Primary building for the College of Business Studies, containing classrooms, offices, and academic facilities.', '2026-04-22 18:26:55', 0),
(55, 'Multi Disciplinary Resource And Tourism Building', 'Tourism Center', 'Hospitality and Tourism Learning Center is a modern academic facility designed to support students in developing skills and knowledge in the fields of hospitality management and tourism.', '2026-04-22 18:41:40', 0),
(56, 'Academic Assessment Center', 'Assessment Center', 'Facility for assessments and exams.', '2026-04-23 02:26:26', 0),
(57, 'University Hostel', 'Hostel', 'On-campus lodging facility.', '2026-04-23 02:28:36', 0),
(58, 'Executive Lounge', 'Lounge', 'Reserved administrative lounge.', '2026-04-23 02:29:42', 0),
(59, 'Multi-Purpose Hall', 'Hall', 'Flexible event venue.', '2026-04-23 02:30:58', 0),
(60, 'College of Education Building 3 (Ext Lot)', 'COE-3', 'Extension facility for COE.', '2026-04-23 02:34:46', 0),
(61, 'College of Arts and Sciences Building', 'CAS Building', 'Main CAS academic building.', '2026-04-23 02:35:42', 0),
(62, 'Integrated Research, Training Production Center Building', 'Production Center', 'Central research facility.', '2026-04-23 02:38:28', 0),
(63, 'Three Storey Health and Sciences Building', 'Nursing Building', 'Facility for nursing program.', '2026-04-23 03:19:22', 0),
(64, 'Physical Education Covered Court', 'PE Covered Court', 'Indoor/Outdoor sports court.', '2026-04-23 03:31:28', 0),
(65, 'Instructor Physical Education New Building', 'New IPE', 'Administrative Office for IPE Faculty Members', '2026-04-23 03:33:25', 0),
(66, 'University of Physical Education facilities and wellness Center Building', 'PE Wellness Center', 'Swimming classes, training, and recreational activities., Located in Dubai near University Swimming Pool.', '2026-04-23 03:42:25', 0),
(67, 'Doctor Ernesto Nicdao Sports Center Building', 'Sports Center', 'Sports training, Physical Education activities, and campus athletic events.', '2026-04-23 03:47:06', 0),
(69, 'Integrated Research Training and Production Center Extension Building', 'Production Extension', 'Provides additional office and working space for research activities, supporting faculty and student research projects, extension programs, data gathering, and community-based studies.', '2026-04-23 03:50:58', 0),
(70, 'College of Social Sciences and Philosophy Building', 'CSSP', 'Building for Social Science Courses', '2026-04-23 10:20:00', 0),
(71, 'Bids and Awards Committee Office', 'BAC Office', 'Manages award and procurement processes.', '2026-04-23 14:40:18', 0),
(72, 'Occupational Safety and Health Office Building', 'OSHO Building', 'Ensures workplace safety compliance.', '2026-04-23 14:48:39', 0),
(73, 'Instructor Physical Education Old Building', 'Old IPE', 'Located of the last side of the GZ Faculty', '2026-04-23 15:24:37', 0),
(74, 'Cooperative Education Building', 'COOP', 'The COOP building/store is a campus-based cooperative shop and service center that provides affordable goods and basic services for students, faculty, and staff—such as school supplies, uniforms, snacks, and sometimes financial services (like savings or loans for members). It operates as a member-owned organization that supports the university community.', '2026-04-23 17:33:29', 1),
(76, 'Electrical Engineering Building', 'Electrical Building', 'Laboratory, Lecture and Class use', '2026-04-23 17:42:03', 0),
(77, 'Trasportation Services Office Building', 'TSO', 'Providing the transportation to the employer\'s offices of the Pampanga State University', '2026-04-23 18:16:02', 0),
(78, 'Civil Engineering and Mechanical Engineering Laboratory Building', 'CE and ME Laboratory', 'Engineering Lab Faculty', '2026-04-25 17:40:04', 0),
(79, 'University Physical Education Facilities and University Pool', 'University Pool', 'University Area.', '2026-04-27 03:24:35', 0);

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
CREATE TABLE `facilities` (
  `id` int NOT NULL,
  `building_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `description` text,
  `floor` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`id`, `building_id`, `name`, `type`, `description`, `floor`, `created_at`) VALUES
(25, 14, 'Office of Culture and Arts', 'Office', 'Organizes cultural events, arts programs and student creative development activities', 'Ground Floor', '2026-04-20 13:19:59'),
(26, 14, 'Exhibit and Collection Area', 'Exhibit', 'Area inside museum', 'Ground Floor', '2026-04-20 13:22:58'),
(27, 15, 'COE Deans Office', 'Office', '·  Supervises teacher education programs \n·  Handles practicum and internship coordination \n·  Assists students for licensure (board exam) preparation \n·  Manages academic advising and curriculum implementation', 'Ground Floor', '2026-04-20 13:25:30'),
(28, 15, 'COE Faculty Office', 'Office', 'N/A\n·  Delivers teacher education instruction and training \n·  Supervises student teaching (practicum) \n·  Prepares students for licensure examinations \n·  Conducts educational research and seminars', 'Ground Floor', '2026-04-20 13:27:52'),
(29, 15, 'Classroom Area', 'Classroom', 'Lecture and Class use', 'Ground Floor - 3rd Floor', '2026-04-20 13:30:00'),
(30, 16, 'Classroom Area', 'Classroom', 'Lecture and Class use', 'Ground Floor - 3rd Floor', '2026-04-20 13:33:02'),
(31, 18, 'Office of the University President', 'Office', '·  Provides overall leadership and direction of the university \n·  Approves and implements university-wide policies and major decisions \n·  Oversees all colleges, campuses, and administrative units \n·  Handles strategic planning and institutional development \n·  Represents the university in external partnerships and official engagements\n\n\n·  Oversees all academic programs and instruction across the university \n·  Implements and monitors academic policies, standards, and curriculum \n·  Coordinates with deans, program chairs, and faculty for academic quality \n·  Reviews and supports program development and accreditation requirements \n·  Supervises academic planning, evaluation, and improvement initiatives \n· Ensures quality assurance in teaching, learning, and student outcomes', 'Upper Floor', '2026-04-20 13:52:48'),
(32, 18, 'Office of the Vice President for Academic Affairs', 'Office', '·  Oversees all academic programs and instruction across the university \n·  Implements and monitors academic policies, standards, and curriculum \n·  Coordinates with deans, program chairs, and faculty for academic quality \n·  Reviews and supports program development and accreditation requirements \n· Supervises academic planning, evaluation, and improvement initiatives \n· Ensures quality assurance in teaching, learning, and student outcomes', 'Upper Floor', '2026-04-20 13:59:47'),
(33, 18, 'Board Secretary Office', 'Office', '·  Prepares and manages agenda and minutes of Board of Regents (BOR) meetings \n· Handles official documentation of board resolutions and decisions \n· Coordinates communication between the University and the Board of Regents \n· Maintains records of official BOR actions, policies, and approvals \n· Ensures proper filing and safekeeping of governance documents \n· Facilitates submission of proposals, reports, and endorsements to the Board', 'Upper Floor', '2026-04-20 14:03:01'),
(34, 18, 'Office of the Director, Administrative services', 'Office', '· Oversees administrative operations, personnel management, records handling, and coordination of support services across university offices.', 'Ground Floor', '2026-04-20 14:05:34'),
(35, 18, 'Administrative Services Office', 'Office', '· Manages general administrative support services of the university \n· Oversees records management and official documentation flow\n· Coordinates front line services and internal office transactions \n· Handles facilities coordination and office space management support \n· Assists in implementation of administrative policies and procedures \n· Provides support for communication, scheduling, and office operations', 'Ground Floor', '2026-04-20 14:06:14'),
(36, 18, 'Commission on Audit', 'Office', '·  Conducts independent audit of university financial records and transactions \n·  Reviews budget utilization, expenditures, and financial compliance \n·  Ensures adherence to government accounting and auditing rules and regulations \n·  Evaluates procurement processes and use of public funds \n·  Issues audit findings, reports, and recommendations for improvements \n·  Monitors proper and lawful use of government resources', 'Ground Floor', '2026-04-20 14:07:44'),
(37, 18, 'Planning and Development Office', 'Office', '·  Prepares short-term and long-term university development plans \n·  Conducts institutional research and planning studies \n·  Monitors and evaluates project implementation and performance \n·  Coordinates infrastructure and campus development projects \n·  Assists in budget planning and resource allocation proposals \n·  Prepares reports required for government agencies (e.g., CHED, DBM) \n·  Supports accreditation and quality assurance documentation', 'Ground Floor', '2026-04-20 14:08:54'),
(38, 18, 'Registers Office', 'Office', '·  Handles student enrollment and registration of subjects \n·  Maintains official student records and academic files \n·  Processes transcripts of records (TOR) and certifications \n·  Issues certificates (enrollment, graduation, good moral, etc.) \n·  Manages grading system and submission of grades from faculty \n·  Processes academic requests (shifting, transfer, evaluation of records) \n·  Verifies and authenticates academic documents', 'Ground Floor', '2026-04-20 14:10:34'),
(39, 18, 'Cashier Office', 'Office', '·  Processes payment of tuition and other school fees \n·  Issues official receipts for all transactions \n·  Handles collections for enrollment, graduation, and miscellaneous fees \n·  Assists in verification of payment records and balances \n·  Coordinates with the Registrar and Accounting Office for financial clearance \n·  Facilitates refunds and other approved financial adjustments (if applicable)', 'Ground Floor', '2026-04-20 14:13:43'),
(40, 18, 'Compensation and benefit unit', 'Office', '·  Processes salaries, wages, and payroll distribution for employees \n·  Manages employee benefits such as allowances, bonuses, and incentives \n·  Handles mandatory government contributions (e.g., SSS, PhilHealth, Pag-IBIG where applicable) \n·  Assists in leave credits, deductions, and payroll adjustments \n·  Prepares and verifies payroll reports and records \n·  Coordinates with HR and Accounting for employee compensation concerns', 'Upper Floor', '2026-04-20 14:14:24'),
(41, 18, 'Legal Affairs Unit', 'Office', '·  Provides legal advice and guidance to university officials and offices \n·  Reviews and drafts contracts, agreements, and legal documents \n·  Handles legal concerns, complaints, and administrative cases involving the university \n·  Ensures compliance with laws, rules, and government regulations \n·  Represents or assists the university in legal proceedings (when necessary) \n·  Issues legal opinions and recommendations for institutional decisions \n·  Supports policy development to ensure legal soundness', 'Upper Floor', '2026-04-20 14:16:55'),
(42, 18, 'Internal Audit Unit', 'Office', '·  Conducts internal reviews of financial and operational processes \n·  Evaluates compliance with university policies, laws, and regulations \n·  Assesses risk management and internal control systems \n·  Audits transactions, records, and administrative procedures \n·  Prepares audit reports with findings and recommendations \n·  Monitors implementation of corrective actions from audit results \n·  Supports transparency and accountability in university operations', 'Upper Floor', '2026-04-20 14:17:30'),
(43, 18, 'Internal Audit Unit', 'Office', '·  Conducts internal reviews of financial and operational processes \n·  Evaluates compliance with university policies, laws, and regulations \n·  Assesses risk management and internal control systems \n·  Audits transactions, records, and administrative procedures \n·  Prepares audit reports with findings and recommendations \n·  Monitors implementation of corrective actions from audit results \n·  Supports transparency and accountability in university operations', 'Upper Floor', '2026-04-20 14:18:22'),
(44, 19, 'Office of Admission', 'Office', '·  Handles application and admission of new students \n·  Manages entrance examinations and screening processes \n·  Evaluates applicant requirements and credentials \n·  Releases admission results and enrollment instructions \n·  Coordinates with colleges for program placement and slots availability \n·  Assists in transfer student admission and credential evaluation \n·  Provides information on admission requirements and procedures', 'Ground Floor', '2026-04-20 14:22:01'),
(45, 19, 'Financial Management Service Office', 'Office', '·  Prepares and manages the university’s annual budget proposals and financial plans \n·  Monitors budget utilization and fund disbursement across offices and colleges \n·  Reviews and processes financial transactions and supporting documents \n·  Ensures compliance with government accounting and financial regulations \n·  Coordinates with units like the Cashier, Accounting, and COA for financial reporting \n·  Prepares financial reports, statements, and budget performance reports \n·  Supports resource allocation and fiscal planning decisions', 'Ground Floor', '2026-04-20 14:24:26'),
(46, 21, 'MIS Office', 'Office', '·  Manages and maintains the university’s information systems and databases \n·  Supports student and employee data management systems \n·  Provides technical support for online enrollment and academic systems \n·  Ensures data security, backup, and system maintenance \n·  Generates reports and data analytic for decision-making \n·  Assists offices in digital processes and system automation \n·  Attends to all IT technical issues across all university campuses (hardware, software, network, and system concerns) \n·  Handles printing and issuance of  ID cards for students and employees \n·  Provides IT support follow-ups and user assistance for system-related concerns', 'Ground Floor', '2026-04-20 14:33:36'),
(47, 22, 'VPSAS Office', 'Office', '·  Oversees overall student affairs and student services programs \n·  Implements student discipline policies and case management \n·  Provides guidance and counseling services for student concerns \n·  Manages and supports student organizations and campus activities \n·  Administers scholarships and financial assistance programs \n·  Coordinates student welfare, development, and engagement programs \n·  Supervises health services and basic student medical support \n·  Handles student complaints, concerns, and welfare-related issues', '2nd floor', '2026-04-20 14:38:27'),
(48, 22, 'Graduate School Building', 'Office', '·  Manages graduate faculty records and teaching assignments \n·  Coordinates class schedules for master’s and doctoral programs \n·  Assists in thesis and dissertation advising assignments \n·  Supports faculty load monitoring and academic workload distribution \n·  Handles faculty-related concerns in the Graduate School \n·  Coordinates with the Graduate School for academic policies and implementation \n·  Assists in faculty evaluation and performance monitoring', '2nd floor', '2026-04-22 13:23:37'),
(49, 23, 'Junior High School Faculty Office', 'Laboratory', 'Manages teaching assignments and class schedules of Junior High School faculty \n·  Coordinates instructional delivery and curriculum implementation \n·  Monitors faculty performance, attendance, and workload \n·  Assists in lesson planning and academic coordination among teachers \n·  Handles faculty concerns and administrative support needs \n·  Supports student learning monitoring through faculty reports \n·  Ensures compliance with Junior High School academic standards and policies', '2nd floor', '2026-04-22 13:35:07'),
(50, 24, 'Procuremnets and Office', 'Office', 'Manages maintenance and upkeep of university buildings and facilities \n·  Coordinates repair of classrooms, offices, and equipment \n·  Ensures cleanliness, safety, and usability of campus facilities \n·  Handles facility requests (room use, events, and reservations) \n·  Oversees utilities management (electricity, water, basic infrastructure support) \n·  Monitors campus grounds, security coordination, and physical resources \n·  Supports logistics for university events and activities', '2nd floor', '2026-04-22 13:56:00'),
(51, 25, 'General Facility/Office', 'Office', 'handles campus safety, guards, and security operations \n· handles cleanliness repairs, and daily facility support', 'Ground Floor', '2026-04-22 14:01:35'),
(52, 26, 'General Facility/Office', 'Office', '· Lecture classrooms for Electrical Technology subjects, sometimes used for other engineering courses as well\n·  Laboratory rooms for hands-on electrical wiring and installation \n·  Training areas for practical skill demonstrations and assessments \n·  Workshop spaces for technical experiments and applied learning', 'Ground Floor', '2026-04-22 14:10:32'),
(53, 27, 'NSTP(CWTS, LTS, ROTC) Office', 'Office', '·  Implements NSTP program (CWTS, LTS, ROTC) \n·  Manages student enrollment and training activities \n·  Conducts community service and leadership development programs \n·  Monitors student attendance, performance and completion requirements\nEnsures compliance with NSTP laws, CHED guidelines, and university policies \n·  Maintains NSTP records and program reports', '2nd floor', '2026-04-22 14:15:33'),
(54, 28, 'Motorpool Office', 'Office', '· Manages university vehicles and transport requests', 'Ground Floor', '2026-04-22 14:18:43'),
(55, 29, 'Laboratories and workshops', 'Office', 'Provide hands-on training spaces for industrial technology students \n·  Used for machine operation, fabrication, and technical skills practice \n·  Equipped for electrical, mechanical, automotive, and related trade activities (depending on program) \n·  Support competency-based learning and skill assessments \n·  Used for demonstrations, practical exams, and project\nproduction work', 'Ground Floor', '2026-04-22 14:25:28'),
(56, 30, 'CPE Faculty Office', 'Office', 'Serves as the work and coordination area for Computer Engineering (CPE) faculty \n·  Handles class coordination, schedules, and teaching loads \n·  Provides space for student consultations and academic advising \n·  Manages course materials, records, and instructional planning \n·  Supports capstone/thesis mentoring and faculty collaboration', '2nd floor', '2026-04-22 14:36:17'),
(57, 31, 'Industrial Technology Faculty Office', 'Office', '·  Serves as the work and coordination area for Industrial Technology faculty \n·  Handles class schedules, teaching loads, and subject coordination \n·  Provides student consultation and academic advising \n·  Manages course materials, records, and instructional planning \n·  Supports laboratory coordination and hands-on training activities', '2nd floor', '2026-04-22 14:42:12'),
(58, 32, 'Old CAS Faculty', 'Office', 'This area serves as office space for faculty members of the College of Arts and Sciences. It provides services such as student consultations, academic advising, subject-related guidance, coordination of class requirements, and assistance with academic concerns.', 'Ground Floor', '2026-04-22 14:45:47'),
(59, 33, 'Office of Student Affairs', 'Office', 'This office provides student support services such as guidance and counseling, handling student concerns and discipline cases, issuing clearances and student records assistance, and coordinating campus activities, organizations, and student development programs.', 'Ground Floor', '2026-04-22 14:49:37'),
(60, 34, 'HRM Laboratory', 'Laboratory', 'This facility provides hands-on training and practical learning for Hospitality and Restaurant Management students. It offers services such as food preparation practice, culinary demonstrations, kitchen operations training, baking and pastry activities, and development of hospitality skills in a simulated industry setting.', 'Ground Floor, 2nd Floor', '2026-04-22 14:53:01'),
(61, 35, 'Classrooms', 'Classroom', 'These are designated learning spaces where students attend lectures, discussions, and activities. They support daily academic instruction, group work, presentations, and other classroom-based learning activities guided by faculty members.', '2nd floor', '2026-04-22 14:57:48'),
(62, 36, 'CCS Faculty/ Deans Office', 'Office', 'This office provides academic and administrative support for the College of Computing Studies. It offers services such as student consultation, academic advising, enrollment and scheduling assistance, coordination of faculty concerns, and handling of college-related documents and academic matters.', 'Ground Floor', '2026-04-22 15:00:17'),
(63, 37, 'General Facility', 'Canteen', 'This facility provides food and dining services for students, faculty, and staff. It offers a variety of meals and snacks, serving as a common area for eating, rest, and social interaction within the campus.', 'Ground Floor', '2026-04-22 15:03:15'),
(64, 37, 'Bids and Awards Committee Office', 'Office', 'This office is responsible for managing the university’s procurement processes in accordance with government procurement policies. It handles the purchase of supplies, equipment, and services needed by the university, processes purchase requests and bidding documents, coordinates with accredited suppliers, and ensures transparency, efficiency, and compliance with applicable procurement, laws and regulations\n- Upper floor of UFC', '2nd floor', '2026-04-22 15:09:35'),
(65, 37, 'UDRRMO Office', 'Office', 'This office is responsible for ensuring a safe and healthy working and learning environment across the university. It conducts safety inspections, risk assessments, and accident prevention programs, promotes health and safety awareness, monitors compliance with safety standards, and responds to campus emergencies to protect students, faculty, and staff.', '2nd floor', '2026-04-22 15:14:20'),
(66, 38, 'Architecture Chairperson Office', 'Office', 'This office provides academic and administrative support for the College of Architecture. It handles student concerns, academic advising, enrollment and scheduling coordination, faculty consultation, and management of college records and requirements to ensure smooth delivery of architectural education programs', '2nd floor', '2026-04-22 15:19:20'),
(67, 38, 'CEA Deans Office', 'Office', 'Documentation, central essential administration, coordinating unit if the college it ensures smooth implementation of academic administrative and operational function', '2nd floor', '2026-04-22 15:28:52'),
(68, 41, 'Industrial Engineering Faculty', 'Office', 'This facility is used by Industrial Engineering students for laboratory classes and hands-on training. It supports technical activities, simulations, and practical exercises that help students apply industrial engineering concepts in real-world and industry-based settings.', 'Ground Floor', '2026-04-22 15:33:04'),
(69, 41, 'Mechanical Engineering Faculty', 'Office', '', 'Ground Floor', '2026-04-22 15:36:51'),
(70, 42, 'Food Tech Office', 'Office', '· This facility is used for the instruction and training of Food Technology students. It provides classrooms, laboratories, and practical learning spaces for food processing, product development, quality control, and other food science-related activities.', 'Ground Floor', '2026-04-22 15:48:54'),
(72, 44, 'Comfort Room', 'Restrooms', 'This facility provides clean and accessible restrooms for students, faculty, staff, and visitors. It supports campus sanitation and hygiene needs and is maintained to ensure comfort and proper use for everyone on campus.', 'Ground Floor/ 2nd FLoor', '2026-04-22 16:11:02'),
(73, 43, 'Technical Vocational Office', 'Office', 'This facility is used for technical-vocational training and skills development programs. It provides classrooms and workshop areas for hands-on learning in various technical and vocational fields, supporting practical skills application, competency-based training, and industry-aligned instruction for students.', 'Ground Floor/ 2nd FLoor', '2026-04-22 16:17:43'),
(74, 45, 'Engineering Classrooms', 'Classroom', 'Laboratory, Lecture and Class use.', 'Ground Floor/ 2nd Floor', '2026-04-22 16:29:12'),
(75, 46, 'Data Center', 'Laboratory', 'Laboratory, Lecture and Class use.', '2nd Floor', '2026-04-22 16:35:51'),
(76, 38, 'CE and ME laboratory', 'Laboratory', 'For Engineering students and laboratory use.', 'Ground Floor/ 2nd Floor', '2026-04-22 16:47:01'),
(77, 48, 'Medical and Dental Clinic', 'Office', '· This facility provides basic health and dental services for students, faculty, and staff. It offers medical consultations, first aid, routine check-ups, dental care, and health monitoring to promote overall campus wellness and support emergency health needs.', 'Ground Floor', '2026-04-22 16:54:09'),
(78, 49, 'CBS Faculty 1', 'Office', 'This building serves the College of Business and Systems programs by providing classrooms, faculty offices, and learning spaces. It supports academic instruction, consultations, and activities related to business, management, and information systems courses.', '2nd Floor', '2026-04-22 16:57:47'),
(79, 50, 'CBS-3', 'Office', 'This building is part of the College of Business and Systems facilities, providing classrooms and learning spaces for students. It supports lectures, academic activities, and other instructional needs for business, management, and related programs.', 'ground Floor-3rd Floor', '2026-04-22 17:03:48'),
(80, 51, 'Auditorium', 'Function Hall/Assembly Hall', '· This facility is a large venue used for official university events and gatherings. It accommodates programs such as assemblies, seminars, conferences, cultural performances, and other academic or institutional activities involving students, faculty, and staff.', 'Ground Floor', '2026-04-22 17:57:31'),
(81, 52, 'Classrooms', 'Classroom', '· Provides classrooms and learning spaces for junior high school students, supporting daily instruction and academic activities.', 'Ground floor- 2nd floor', '2026-04-22 18:08:15'),
(82, 49, 'CBS-2', 'Classroom', 'Provides classrooms and learning spaces for the College of Business and Systems, supporting lectures, academic activities, and instructional needs of business and related programs.', 'Ground Floor-2nd Floor', '2026-04-22 18:20:48'),
(83, 63, 'Health and Sciences Classrooms', 'Classroom', 'Lecture and Class use.', 'Ground Floor-3rd Floor', '2026-04-23 03:21:43'),
(84, 63, 'Health and Sciences Faculty', 'Office', 'Provides office space for nursing faculty members, supporting student consultations, academic advising, subject coordination, and other instructional and administrative activities related to the nursing program.', 'Ground Floor', '2026-04-23 03:24:06'),
(85, 65, 'IPE Faculty', 'Office', '· Provides office space for Industrial and Production Engineering faculty and staff, supporting student consultations, academic advising, coordination of program activities, and handling of departmental concerns and requirements.', 'Ground Floor', '2026-04-23 03:35:05'),
(86, 70, 'CSSP', 'Office', 'This building houses the College of Social Sciences and Philosophy. It serves as a center for academic instruction, faculty offices, and student consultations, supporting learning activities, discussions, and programs related to social sciences and philosophy courses.', 'Ground Floor/ 2nd FLoor', '2026-04-23 10:26:47'),
(87, 74, 'Auxiliary Service Office Unit', 'Office', 'provides basic services and supplies to support students and staff in their daily needs.', '2nd floor', '2026-04-23 17:37:58'),
(88, 78, 'CE and ME laboratory', 'Laboratory', 'This facility is used by Civil Engineering and Mechanical Engineering students for laboratory classes and practical training. It provides spaces for experiments, technical simulations, and hands-on activities that support engineering concepts and industry-based applications.', 'Ground Floor/ 2nd Floor', '2026-04-25 17:41:57'),
(89, 79, 'Merchandise', 'Facility', 'Building where students can buy merchandise.', 'Ground Floor', '2026-04-27 03:26:15'),
(90, 79, 'Cafe Honorio', 'Shop', 'Cafe\'', 'Ground Floor', '2026-04-27 03:28:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `assistance`
--
ALTER TABLE `assistance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `building_id` (`building_id`);

--
-- Indexes for table `buildings`
--
ALTER TABLE `buildings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `building_id` (`building_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `assistance`
--
ALTER TABLE `assistance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT for table `buildings`
--
ALTER TABLE `buildings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assistance`
--
ALTER TABLE `assistance`
  ADD CONSTRAINT `assistance_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `facilities`
--
ALTER TABLE `facilities`
  ADD CONSTRAINT `facilities_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
