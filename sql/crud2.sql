-- הוספת שחקן חדש
INSERT INTO players (name,birth_year,sports) VALUES ("Koko akof", 1980,"FOOTBALL")

-- הוספת 2 שחקנים
INSERT INTO players (name,birth_year,sports) VALUES 
("Black Jack", 1983,"CARDS"),
("Shaquille O'Neal", 1972, "NBA");

-- הוספת שחקן ללא כתיבת המאפיינים של הטבלה, יש לשים לב במיוחד באיי די וערכים שנוספים
-- NULL אוטומטי להוסיף את הערך 
INSERT INTO players VALUES (NULL,"OMRI KASPI", 1998, "NBA")

-- מחיקת רשומה עם איי די שווה 10
DELETE FROM players WHERE id = 10

-- עריכת שורה 12 את שנת הלידה
UPDATE players SET birth_year = 1988, name="Omri Kaspi" WHERE id = 12