-- לשלוף את כל הרשומות של הטבלה ורק את השם , איי די של השחקן
SELECT id, name FROM players;

-- לשלוף רק את השחקנים שקשורים ל אן ביי איי
SELECT * FROM players WHERE sports = "NBA";

-- שולף שחקנים שנולדו בשנת 1963 , 1962
SELECT * FROM players WHERE birth_year = 1962 OR birth_year = 1963

-- יחזיר לי שחקנים שנולדו בין השנים 1959 ל 1962
SELECT * FROM players WHERE birth_year >= 1959 AND birth_year <= 1962

-- שיציג את כל השחקנים וימיין אותם לפי שנת לידה מהקטן לגדול
SELECT * FROM players ORDER BY birth_year

-- שיציג את כל השחקנים וימיין אותם לפי שנת לידה מהגדול לקטן
SELECT * FROM players ORDER BY birth_year DESC

-- לשלוף רק את ה3 שחקנים הראשונים לפי סדר של איידי
-- playerModel.find({}).limit(3).skip(0)
SELECT * FROM players LIMIT 0,3

-- שולף רק שחקני כדור רגל וממיין לפי גיל מהמבוגר לצעיר ואת ה3 הראשונים
-- SELECT FROM -> WHERE -> ORDER BY -> LIMIT
SELECT * FROM players WHERE sports = "football" ORDER BY birth_year ASC LIMIT 0,3

-- JO חיפוש בשמות של השחקנים שיש להם את הביטוי 
SELECT * FROM players WHERE name LIKE '%jo%'

-- ישלוף את כמות הרשומות של שחקנים של האן בי איי
SELECT COUNT(*) count FROM players WHERE sports = "NBA";