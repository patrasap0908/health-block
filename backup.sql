-- MySQL dump 10.13  Distrib 5.7.25, for Linux (x86_64)
--
-- Host: localhost    Database: agathsya
-- ------------------------------------------------------
-- Server version	5.7.25-0ubuntu0.18.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `agathsya`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `agathsya` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `agathsya`;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctor` (
  `id` bigint(20) NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `username` varchar(20) NOT NULL,
  `user_type` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `dob` varchar(10) NOT NULL,
  `gender` text NOT NULL,
  `mobile` text NOT NULL,
  `hospital_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `doctor_ibfk_1` (`hospital_id`),
  CONSTRAINT `doctor_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (2019021,'53a0532b60c0123d45e0af0299b285ab9bf708f8474bd8e34d6c0a35be92742azXWyf7FABObMW++8h9LpQw==','31ef09ff948dd509d10b3f936c1605ddce24dafc4398f2f9675d697abac561b0z5kXGWws0Lo0nqL+4cILrg==','vima','9ec4519560eb733832655d22a5ae085a340ffb4967062c785785f920b0f66901sTy5iZbBGOzs36WVAK3IbA==','7036a3fb539a181da64d5813cdd977f3373ab8383811c4a8d48d339497663d15cpc1c3uT8ETJ9FSvd6tnTQ==','bf100980a99bc043b1a6db4a5c4d8f77711b9eefc08ec400a1939d37b3f7e28dBOHU6m3Xi+v4KqJE4iCVwQ==','2018-01-20','321de449ba2b9c4d4baaa65338b81b1dc7ebec19a99253cec60529c7ca1db97a6aCWxYCtJ1TICJjFEW3e1g==','9d9d11c392503fd1c3878ffaab248765d4552aff91c57a6d8f79885b36d7dd6feSA7A5mEuAeIBkkpHuf4RA==',2019011);
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospital`
--

DROP TABLE IF EXISTS `hospital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hospital` (
  `id` bigint(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospital`
--

LOCK TABLES `hospital` WRITE;
/*!40000 ALTER TABLE `hospital` DISABLE KEYS */;
INSERT INTO `hospital` VALUES (2019011,'Apollo','apollo','apollo');
/*!40000 ALTER TABLE `hospital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log`
--

DROP TABLE IF EXISTS `log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log` (
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transaction` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log`
--

LOCK TABLES `log` WRITE;
/*!40000 ALTER TABLE `log` DISABLE KEYS */;
/*!40000 ALTER TABLE `log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient` (
  `id` bigint(20) NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `username` varchar(20) NOT NULL,
  `user_type` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `dob` varchar(10) NOT NULL,
  `gender` text NOT NULL,
  `mobile` text NOT NULL,
  `hospital_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `patient_ibfk_1` (`hospital_id`),
  CONSTRAINT `patient_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (2019022,'3ae5829a3eb66efc39739384a7dc6ee26dcfd9f8bf61034833eb518144d9bac1y28wND7edmDQcN+Zex555Q==','2f8d9c7ec5b47902ace1eb5b56aad2e4d204194a5fa70a8b5be6713e334defe4AdHP8fOUZIQHSIoLSu8gaQ==','shraddha','65a664982b5979f0aa38606140adbe5ec5bdeb48a5cc2c53993ce4b196e28c29RJepueYDEKbE35KyrFj16g==','b4056f7aa59415be946dc7365d336c2a3ed5b98eae632be568da8f2d9fcf0c12ypc1JsO4IpRIaAot8ZBZhhmEDBHvoQZQbQZVVwnnPlw=','94a1e44acc6dd3936760b048a39e81625d8aa9dfaf767d50b5b00a2e5f1da2cbH8GQptVaKg3jm2TcDv9x1Q==','2018-01-20','2d5cef6cbc2dba0a6cd5b5f24099ca4660796b63b0ce26bacf7e70f64d0dce04RTcRYbVAgwUD3WEfgAYOwg==','d15956246949d78ca69d8a39d091eb4d6c8f10266d3c881755685e182fdc2cc04z3uJ9AEdS6KkbdmFqy7zA==',2019011),(2019023,'97569c1a51d30d9ba9be5084441a252dc56ee5af31ab53f39267532a5468540303kCN/jXV74Q5LVlFrMyLQ==','5afc602840412d4b674debb04e244a39c1db7aedbd2985933bdab194386bb540fhzvPw0eJ1SfBAFs+QA7mQ==','vishal','a929aad14096867d70a31f3753e59251a9510fcc44ff0599a137c56061416ac1nVTnfD6fy9aw5mR26H4N1w==','2ceecb32c3f711c1be0d834459828144b1052705431dd5acb1845251acb73ab4r0IphaVwGQ+stC+lnIps5gb1Au5aSTarVMwPPICyNDY=','2d353dac50fd33159dae5487b2680f54c96dcb005ffc5be9ae112fe4a40abf3d47wle3FbP8BzS2WefOgT4A==','2019-02-06','644c0f60a6d0449d618f78b0a6809bcaacc6252bcb5b6eeac3da50a46c57e66d2TwIHyIRDPomhpuE5wMU9g==','37caaecd9793cea4b4a6543159097e4ba0e073274b2cff5155a201d5d046d180G57w4SgB2kO77ym0iZRQPw==',2019011);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `sender` varchar(20) NOT NULL,
  `receiver` varchar(20) NOT NULL,
  PRIMARY KEY (`sender`,`receiver`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resolved_permission`
--

DROP TABLE IF EXISTS `resolved_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resolved_permission` (
  `sender` varchar(20) NOT NULL,
  `receiver` varchar(20) NOT NULL,
  `access` varchar(5) NOT NULL,
  PRIMARY KEY (`sender`,`receiver`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resolved_permission`
--

LOCK TABLES `resolved_permission` WRITE;
/*!40000 ALTER TABLE `resolved_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `resolved_permission` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-02-06 14:31:57
