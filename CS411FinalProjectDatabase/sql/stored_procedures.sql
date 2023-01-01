-- query trending data
SELECT cc.card_name, COUNT(cl.card_id) AS total_requests
FROM credit_cards cc NATURAL JOIN click_logs cl
-- user requests from last 7 days
WHERE TIMESTAMPDIFF(DAY, CURRENT_TIMESTAMP(), cl.date_time) < 7
GROUP BY cc.card_id
-- get 10 records with most requests
ORDER BY total_requests DESC, cc.card_name;

-- recommend card

SET @vend_name_filter = "udukjemrx,ehmoqgkgt,yaulwjrlp,yhoszxcmw";
SET @vend_type_filter = "rpikaoxq,kmcppyba,xsxkvxxu";
SET @credit_score_min_filter = 300;
SET @credit_limit_min_filter = 1000;
SET @annual_fee_max_filter = 0;
SET @payment_processor_filter = "lzufuua,yytgtej,rmlyjku";


SELECT cc.card_name,
    -- use this aggregation to get weighted number to select appropriate ranking
    -- flags with higher multipliers indicate greater importance in our ranking metric
    (400 * credit_score_flag + 300 * credit_limit_flag + 200 * payment_processor_flag +
            100 * annual_fee_flag + COALESCE(vendor_requirements_counts, 0)) AS user_specification_card_rating,
    average_rating
FROM credit_cards cc
-- determine number of vendor matches a card has
LEFT JOIN (
    SELECT cc1.card_id, COUNT(pv1.vend_id) AS vendor_requirements_counts
    FROM credit_cards cc1
    NATURAL JOIN offers o1 NATURAL JOIN preferred_vendors pv1
    WHERE (FIND_IN_SET(pv1.vend_type, @vend_type_filter) OR FIND_IN_SET(pv1.vend_name, @vend_name_filter))
    GROUP BY cc1.card_id
) vendorsub ON cc.card_id = vendorsub.card_id
-- determine if credit card meets certain requirements, use numbers for aggregation formula
JOIN (
    SELECT 
        cc2.card_id, 
        IF (cc2.min_rec_credit >= @credit_score_min_filter, 1, 0) AS credit_score_flag,
        IF(cc2.credit_limit >= @credit_limit_min_filter, 1, 0) AS credit_limit_flag,
        IF(cc2.annual_fee <= @annual_fee_max_filter, 1, 0) AS annual_fee_flag
    FROM credit_cards cc2
) cardsub ON cc.card_id = cardsub.card_id
-- determine if credit card uses one of specified payment processors, use numbers for aggregation formula
JOIN (
    SELECT cc3.card_id, IF(FIND_IN_SET(pp3.processor_name, @payment_processor_filter), 1, 0) AS payment_processor_flag
    FROM credit_cards cc3 NATURAL JOIN payment_processors pp3
) processorsub ON cc.card_id = processorsub.card_id
-- get average rating to use as tiebreaker if we still have multiple cards
LEFT JOIN (
    SELECT cc4.card_id, AVG(cr.rating) AS average_rating
    FROM credit_cards cc4
    NATURAL JOIN card_ratings cr
    GROUP BY cc4.card_id
) ratingsub ON cc.card_id = ratingsub.card_id
ORDER BY user_specification_card_rating DESC, average_rating DESC;