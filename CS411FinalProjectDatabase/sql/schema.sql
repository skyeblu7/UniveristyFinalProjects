-- brew install mysql (Mac) or apt-get install mysql (linux)
-- mysql -u root
    -- DROP DATABASE IF EXISTS illi-cc 
-- exit
-- mysql -u root card < /Users/mgartenhaus/Downloads/db_dump.sql


CREATE TABLE Payment_Processors(
    processor_id INT PRIMARY KEY,
    processor_name VARCHAR(255) NOT NULL,
    domestic_accept INT,
    international_accept INT,
    total_cards_us INT,
    total_vol_us INT, -- in billions
    num_trans INT, -- in millions
    avg_proc_fee REAL
);

CREATE TABLE Credit_Cards(
    card_id INT PRIMARY KEY,
    card_name VARCHAR(255) NOT NULL,
    processor_id INT,
    bank VARCHAR(255),
    annual_fee INT,
    credit_limit REAL,
    signup_bonus REAL,
    APR_min REAL,
    APR_max REAL,
    min_rec_credit INT,
    image_url VARCHAR(10000),
    signup_link VARCHAR(255),
    foreign_trans_fee REAL,
    reward_type CHAR(1),
    CONSTRAINT cc_fk_processor_id
        FOREIGN KEY (processor_id) 
        REFERENCES Payment_Processors(processor_id) 
        ON DELETE SET NULL
);


CREATE TABLE Preferred_Vendors(
    vend_id INT PRIMARY KEY,
    vend_name VARCHAR(255) NOT NULL,
    vend_type VARCHAR(255),
    vend_website VARCHAR(255)
);

CREATE TABLE Offers(
    card_id INT,
    vend_id INT,
    CONSTRAINT offer_fk_card_id
        FOREIGN KEY (card_id) 
        REFERENCES Credit_Cards(card_id) 
        ON DELETE CASCADE,
    CONSTRAINT offer_fk_vend_id
        FOREIGN KEY (vend_id) 
        REFERENCES Preferred_Vendors(vend_id) 
        ON DELETE CASCADE
);

CREATE TABLE Categories(
    cat_id INT PRIMARY KEY,
    card_id INT,
    cat_name VARCHAR(255) NOT NULL,
    cat_desc VARCHAR(255) NOT NULL,
    reward REAL,
    CONSTRAINT cat_fk_card_id 
        FOREIGN KEY (card_id)
        REFERENCES Credit_Cards(card_id) 
        ON DELETE CASCADE
);

CREATE TABLE Card_Ratings(
    rating_id INT PRIMARY KEY,
    card_id INT NOT NULL,
    website_name VARCHAR(255),
    rating REAL,
    CONSTRAINT rate_fk_card_id 
        FOREIGN KEY (card_id) 
        REFERENCES Credit_Cards(card_id) 
        ON DELETE CASCADE
);

CREATE TABLE Click_Logs(
    card_id INT,
    date_time DATETIME, 
    ip_addr VARCHAR(255),
    PRIMARY KEY (date_time, ip_addr),
    CONSTRAINT click_fk_card_id
        FOREIGN KEY (card_id)
        REFERENCES Credit_Cards(card_id) 
        ON DELETE CASCADE
);

DROP PROCEDURE IF EXISTS GetCardRecommendation;
DELIMITER //
CREATE PROCEDURE GetCardRecommendation (
    IN vend_name_filter VARCHAR(256),
    IN vend_type_filter VARCHAR(256),
    IN credit_score_min_filter INT,
    IN credit_limit_min_filter INT,
    IN annual_fee_max_filter INT,
    IN payment_processor_filter VARCHAR(256)
)
BEGIN

    DECLARE exit_loop BOOLEAN DEFAULT FALSE;
    DECLARE card_id_var INT;
    DECLARE min_rec_credit_var INT;
    DECLARE credit_limit_var REAL;
    DECLARE annual_fee_var REAL;
    DECLARE processor_name_var VARCHAR(255);
    DECLARE cardcur CURSOR FOR (
        SELECT card_id, min_rec_credit, credit_limit, annual_fee, processor_name FROM credit_cards 
        NATURAL JOIN (SELECT processor_id, processor_name FROM payment_processors) a
    );
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET exit_loop = TRUE;


    DROP TEMPORARY TABLE IF EXISTS creditcardrec;
    CREATE TEMPORARY TABLE creditcardrec AS (
        SELECT * FROM credit_cards NATURAL JOIN (SELECT processor_id, processor_name FROM payment_processors) a
    );
    
    SELECT COUNT(*) FROM creditcardrec;

    OPEN cardcur;

    cloop: LOOP
        FETCH cardcur INTO card_id_var, min_rec_credit_var, credit_limit_var, annual_fee_var, processor_name_var; 
        
        IF (exit_loop) THEN
            LEAVE cloop;
        END IF;

        IF (min_rec_credit_var <= credit_score_min_filter) AND (credit_score_min_filter IS NOT NULL) THEN
            DELETE FROM creditcardrec WHERE card_id = card_id_var;
        ELSEIF (credit_limit_var <= credit_limit_min_filter) AND (credit_limit_min_filter IS NOT NULL) THEN 
            DELETE FROM creditcardrec WHERE card_id = card_id_var;
        ELSEIF (annual_fee_var <= annual_fee_max_filter) AND (annual_fee_max_filter IS NOT NULL) THEN
            DELETE FROM creditcardrec WHERE card_id = card_id_var;
        ELSEIF (payment_processor_filter NOT LIKE CONCAT('%', processor_name_var, '%')) AND (payment_processor_filter IS NOT NULL) THEN
            DELETE FROM creditcardrec WHERE card_id = card_id_var;
        END IF;
        
        -- DELETE FROM creditcardrec AS a WHERE a.card_id = card_id;
        
    END LOOP cloop;

    CLOSE cardcur;

    SELECT COUNT(*) FROM creditcardrec;

    DROP TEMPORARY TABLE IF EXISTS vendorsub;
    CREATE TEMPORARY TABLE vendorsub AS (
        SELECT cc1.card_id, COUNT(pv1.vend_id) AS vendor_requirements_counts
        FROM credit_cards cc1
        NATURAL JOIN offers o1 NATURAL JOIN preferred_vendors pv1
        WHERE (FIND_IN_SET(pv1.vend_type, @vend_type_filter) OR FIND_IN_SET(pv1.vend_name, @vend_name_filter))
        GROUP BY cc1.card_id
    );

    DROP TEMPORARY TABLE IF EXISTS ratingsub;
    CREATE TEMPORARY TABLE ratingsub AS (
        SELECT cc4.card_id, AVG(cr.rating) AS average_rating
        FROM credit_cards cc4
        NATURAL JOIN card_ratings cr
        GROUP BY cc4.card_id
    );

    SELECT cc.card_name FROM creditcardrec cc
    LEFT JOIN vendorsub vs ON cc.card_id = vs.card_id
    LEFT JOIN ratingsub rs ON cc.card_id = rs.card_id
    ORDER BY vendor_requirements_counts DESC, average_rating DESC
    LIMIT 10;

END //
DELIMITER ;
-- CALL GetCardRecommendation(NULL, NULL, 800, NULL, NULL, NULL);

DELIMITER //
CREATE TRIGGER RecordClick
BEFORE INSERT ON click_logs
FOR EACH ROW
BEGIN
    SET @recent_click_count = (
        SELECT COUNT(*) FROM click_logs
        WHERE (card_id = new.card_id) AND (ip_addr = new.ip_addr) AND TIMESTAMPDIFF(MINUTE, date_time, new.date_time) < 5
    );

    -- Trigger body cannot modify the same table that invoked the trigger
    IF @recent_click_count > 0 THEN
        -- UPDATE click_logs SET date_time = new.date_time WHERE (card_id = new.card_id) AND (ip_addr = new.ip_addr);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unique IP address cannot insert multiple timestamps on the same card in under 5 minutes';
    END IF;
END //
DELIMITER ;