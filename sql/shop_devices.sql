-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: shop
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(300) NOT NULL,
  `company_id` varchar(15) NOT NULL,
  `ram` int NOT NULL,
  `battery_score` int NOT NULL,
  `pref_score` int NOT NULL,
  `camera_score` int NOT NULL,
  `price` int NOT NULL,
  `img_url` varchar(300) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'Galaxy s10','2',8,60,416,89,2400,'https://cdn-files.kimovil.com/devicerender/0003/22/thumb_221858_devicerender_small.jpeg'),(2,'Xiaomi Mi 10','1',8,83,547,96,2300,'https://cdn-files.kimovil.com/phone_front/0004/24/thumb_323504_phone_front_medium.jpeg'),(3,'Redmi Note 8','1',4,72,170,78,650,'https://cdn-files.kimovil.com/devicerender/0003/70/thumb_269266_devicerender_small.jpeg'),(4,'Redmi Note 8 Pro','1',6,79,292,78,800,'https://cdn-files.kimovil.com/devicerender/0003/54/thumb_253879_devicerender_small.jpeg'),(5,'Galaxy S20','2',8,75,515,88,3000,'https://cdn-files.kimovil.com/phone_front/0004/23/thumb_322700_phone_front_medium.jpeg'),(7,'Xiaomi Redmi K30 Pro','1',6,81,588,82,1500,'https://cdn-files.kimovil.com/devicerender/0004/65/thumb_364279_devicerender_small.jpeg'),(8,'Redmi Note 9S','1',6,87,274,78,800,'https://cdn-files.kimovil.com/phone_front/0004/36/thumb_335705_phone_front_medium.jpeg'),(9,'Galaxy A71','2',6,80,265,79,1400,'https://cdn-files.kimovil.com/devicerender/0004/23/thumb_322280_devicerender_small.jpeg'),(10,'Galaxy S10e','2',6,53,389,82,1700,'https://cdn-files.kimovil.com/devicerender/0004/23/thumb_322280_devicerender_small.jpeg'),(12,'Galaxy S10 Plus','2',8,76,417,86,2400,'https://cdn-files.kimovil.com/devicerender/0003/22/thumb_221849_devicerender_small.jpeg'),(13,'Galaxy A70','2',6,79,170,68,1100,'https://cdn-files.kimovil.com/devicerender/0003/22/thumb_221972_devicerender_small.jpeg'),(14,'Redmi K20 / mi 9 t','1',6,73,261,83,1200,'https://cdn-files.kimovil.com/devicerender/0003/22/thumb_221931_devicerender_small.jpeg'),(15,'Galaxy A51','2',6,69,179,77,1000,'https://cdn-files.kimovil.com/devicerender/0004/02/thumb_301123_devicerender_small.jpeg'),(16,'Xiaomi Redmi 8','1',4,84,95,72,530,'https://cdn-files.kimovil.com/devicerender/0003/68/thumb_267578_devicerender_small.jpeg'),(17,'OnePlus 7T','3',8,64,482,86,2100,'https://cdn-files.kimovil.com/phone_front/0003/55/thumb_254189_phone_front_medium.jpeg');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-25 12:03:47
