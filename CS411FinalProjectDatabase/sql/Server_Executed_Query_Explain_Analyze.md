***Server Query 1 - Baseline***

```
| -> Sort: total_requests DESC, cc.card_name  (actual time=65.893..65.915 rows=227 loops=1)
    -> Stream results  (cost=13894.66 rows=30181) (actual time=1.415..65.678 rows=227 loops=1)
        -> Group aggregate: count(cl.card_id)  (cost=13894.66 rows=30181) (actual time=1.406..65.492 rows=227 loops=1)
            -> Nested loop inner join  (cost=10876.59 rows=30181) (actual time=0.393..65.331 rows=233 loops=1)
                -> Index scan on cc using PRIMARY  (cost=313.35 rows=3066) (actual time=0.093..1.326 rows=3000 loops=1)
                -> Filter: (timestampdiff(DAY,<cache>(now()),cl.date_time) < 7)  (cost=2.46 rows=10) (actual time=0.021..0.021 rows=0 loops=3000)
                    -> Index lookup on cl using click_fk_card_id (card_id=cc.card_id)  (cost=2.46 rows=10) (actual time=0.015..0.017 rows=10 loops=3000)
 |
```


***Server Query 1 - Index on click_logs(date_time)***

```
CREATE INDEX click_logs_time_index ON click_logs(date_time);
| -> Sort: total_requests DESC, cc.card_name  (actual time=58.378..58.391 rows=227 loops=1)
    -> Stream results  (cost=13894.66 rows=30181) (actual time=0.757..58.220 rows=227 loops=1)
        -> Group aggregate: count(cl.card_id)  (cost=13894.66 rows=30181) (actual time=0.753..58.088 rows=227 loops=1)
            -> Nested loop inner join  (cost=10876.59 rows=30181) (actual time=0.208..57.968 rows=233 loops=1)
                -> Index scan on cc using PRIMARY  (cost=313.35 rows=3066) (actual time=0.057..1.108 rows=3000 loops=1)
                -> Filter: (timestampdiff(DAY,<cache>(now()),cl.date_time) < 7)  (cost=2.46 rows=10) (actual time=0.019..0.019 rows=0 loops=3000)
                    -> Index lookup on cl using click_fk_card_id (card_id=cc.card_id)  (cost=2.46 rows=10) (actual time=0.013..0.015 rows=10 loops=3000)
 |
```

***Server Query 1 - Index on click_logs(card_id)***

```
CREATE INDEX click_logs_card ON click_logs(card_id);
| -> Sort: total_requests DESC, cc.card_name  (actual time=56.342..56.357 rows=227 loops=1)
    -> Stream results  (cost=13894.66 rows=30181) (actual time=0.700..56.165 rows=227 loops=1)
        -> Group aggregate: count(cl.card_id)  (cost=13894.66 rows=30181) (actual time=0.695..56.005 rows=227 loops=1)
            -> Nested loop inner join  (cost=10876.59 rows=30181) (actual time=0.183..55.863 rows=233 loops=1)
                -> Index scan on cc using PRIMARY  (cost=313.35 rows=3066) (actual time=0.058..1.115 rows=3000 loops=1)
                -> Filter: (timestampdiff(DAY,<cache>(now()),cl.date_time) < 7)  (cost=2.46 rows=10) (actual time=0.018..0.018 rows=0 loops=3000)
                    -> Index lookup on cl using click_fk_card_id (card_id=cc.card_id)  (cost=2.46 rows=10) (actual time=0.013..0.014 rows=10 loops=3000)
 |
```


***Server Query 1 - Index on credit_cards(card_name)***

```
 CREATE INDEX card_name ON credit_cards(card_name);
 | -> Sort: total_requests DESC, cc.card_name  (actual time=59.410..59.424 rows=227 loops=1)
    -> Stream results  (cost=13894.66 rows=30181) (actual time=0.823..59.257 rows=227 loops=1)
        -> Group aggregate: count(cl.card_id)  (cost=13894.66 rows=30181) (actual time=0.819..59.136 rows=227 loops=1)
            -> Nested loop inner join  (cost=10876.59 rows=30181) (actual time=0.200..59.023 rows=233 loops=1)
                -> Index scan on cc using PRIMARY  (cost=313.35 rows=3066) (actual time=0.049..1.024 rows=3000 loops=1)
                -> Filter: (timestampdiff(DAY,<cache>(now()),cl.date_time) < 7)  (cost=2.46 rows=10) (actual time=0.019..0.019 rows=0 loops=3000)
                    -> Index lookup on cl using click_fk_card_id (card_id=cc.card_id)  (cost=2.46 rows=10) (actual time=0.014..0.015 rows=10 loops=3000)
 |
```

***Server Query 2 - Baseline***

```
mysql> SET @vend_name_filter = "udukjemrx,ehmoqgkgt,yaulwjrlp,yhoszxcmw";
Query OK, 0 rows affected (0.00 sec)

mysql> SET @vend_type_filter = "rpikaoxq,kmcppyba,xsxkvxxu";
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_score_min_filter = 300;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_limit_min_filter = 1000;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @annual_fee_max_filter = 0;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @payment_processor_filter = "lzufuua,yytgtej,rmlyjku";
Query OK, 0 rows affected (0.00 sec)

mysql>
mysql> EXPLAIN ANALYZE SELECT cc.card_name,
    ->     -- use this aggregation to get weighted number to select appropriate ranking
    ->     -- flags with higher multipliers indicate greater importance in our ranking metric
    ->     (400 * credit_score_flag + 300 * credit_limit_flag + 200 * payment_processor_flag +
    ->             100 * annual_fee_flag + COALESCE(vendor_requirements_counts, 0)) AS user_specification_card_rating,
    ->     average_rating
    -> FROM credit_cards cc
    -> -- determine number of vendor matches a card has
    -> LEFT JOIN (
    ->     SELECT cc1.card_id, COUNT(pv1.vend_id) AS vendor_requirements_counts
    ->     FROM credit_cards cc1
    ->     NATURAL JOIN offers o1 NATURAL JOIN preferred_vendors pv1
    ->     WHERE (FIND_IN_SET(pv1.vend_type, @vend_type_filter) OR FIND_IN_SET(pv1.vend_name, @vend_name_filter))
    ->     GROUP BY cc1.card_id
    -> ) vendorsub ON cc.card_id = vendorsub.card_id
    -> -- determine if credit card meets certain requirements, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT
    ->         cc2.card_id,
    ->         IF (cc2.min_rec_credit >= @credit_score_min_filter, 1, 0) AS credit_score_flag,
    ->         IF(cc2.credit_limit >= @credit_limit_min_filter, 1, 0) AS credit_limit_flag,
    ->         IF(cc2.annual_fee <= @annual_fee_max_filter, 1, 0) AS annual_fee_flag
    ->     FROM credit_cards cc2
    -> ) cardsub ON cc.card_id = cardsub.card_id
    -> -- determine if credit card uses one of specified payment processors, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT cc3.card_id, IF(FIND_IN_SET(pp3.processor_name, @payment_processor_filter), 1, 0) AS payment_processor_flag
    ->     FROM credit_cards cc3 NATURAL JOIN payment_processors pp3
    -> ) processorsub ON cc.card_id = processorsub.card_id
    -> -- get average rating to use as tiebreaker if we still have multiple cards
    -> LEFT JOIN (
    ->     SELECT cc4.card_id, AVG(cr.rating) AS average_rating
    ->     FROM credit_cards cc4
    ->     NATURAL JOIN card_ratings cr
    ->     GROUP BY cc4.card_id
    -> ) ratingsub ON cc.card_id = ratingsub.card_id
    -> ORDER BY user_specification_card_rating DESC, average_rating DESC;
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| EXPLAIN  |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| -> Sort: user_specification_card_rating DESC, ratingsub.average_rating DESC  (actual time=44.758..44.965 rows=3000 loops=1)
    -> Stream results  (cost=87152.76 rows=0) (actual time=23.118..43.739 rows=3000 loops=1)
        -> Nested loop left join  (cost=87152.76 rows=0) (actual time=23.076..40.100 rows=3000 loops=1)
            -> Nested loop left join  (cost=10469.87 rows=0) (actual time=1.098..14.505 rows=3000 loops=1)
                -> Nested loop inner join  (cost=2804.87 rows=3066) (actual time=0.130..11.694 rows=3000 loops=1)
                    -> Nested loop inner join  (cost=1731.77 rows=3066) (actual time=0.125..8.031 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=658.67 rows=3066) (actual time=0.113..3.263 rows=3000 loops=1)
                            -> Table scan on pp3  (cost=101.50 rows=1000) (actual time=0.097..0.381 rows=1000 loops=1)
                            -> Index lookup on cc3 using cc_fk_processor_id (processor_id=pp3.processor_id)  (cost=0.25 rows=3) (actual time=0.002..0.003 rows=3 loops=1000)
                        -> Single-row index lookup on cc using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                    -> Single-row index lookup on cc2 using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                -> Index lookup on vendorsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.000..0.000 rows=0 loops=3000)
                    -> Materialize  (cost=0.00..0.00 rows=0) (actual time=2.326..2.328 rows=12 loops=1)
                        -> Table scan on <temporary>  (actual time=0.000..0.001 rows=12 loops=1)
                            -> Aggregate using temporary table  (actual time=0.942..0.944 rows=12 loops=1)
                                -> Nested loop inner join  (cost=2201.50 rows=3000) (actual time=0.071..0.922 rows=12 loops=1)
                                    -> Nested loop inner join  (cost=1151.50 rows=3000) (actual time=0.063..0.879 rows=12 loops=1)
                                        -> Filter: ((0 <> find_in_set(pv1.vend_type,<cache>((@vend_type_filter)))) or (0 <> find_in_set(pv1.vend_name,<cache>((@vend_name_filter)))))  (cost=101.50 rows=1000) (actual time=0.038..0.816 rows=4 loops=1)
                                            -> Table scan on pv1  (cost=101.50 rows=1000) (actual time=0.026..0.308 rows=1000 loops=1)
                                        -> Filter: (o1.card_id is not null)  (cost=0.75 rows=3) (actual time=0.010..0.015 rows=3 loops=4)
                                            -> Index lookup on o1 using offer_fk_vend_id (vend_id=pv1.vend_id)  (cost=0.75 rows=3) (actual time=0.010..0.015 rows=3 loops=4)
                                    -> Single-row index lookup on cc1 using PRIMARY (card_id=o1.card_id)  (cost=0.25 rows=1) (actual time=0.003..0.003 rows=1 loops=12)
            -> Index lookup on ratingsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.001..0.001 rows=1 loops=3000)
                -> Materialize  (cost=5441.95..5441.95 rows=9325) (actual time=24.391..24.971 rows=3000 loops=1)
                    -> Group aggregate: avg(cr.rating)  (cost=4509.48 rows=9325) (actual time=0.070..19.370 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=3577.00 rows=9325) (actual time=0.051..18.105 rows=9000 loops=1)
                            -> Index scan on cc4 using PRIMARY  (cost=313.35 rows=3066) (actual time=0.025..0.895 rows=3000 loops=1)
                            -> Index lookup on cr using rate_fk_card_id (card_id=cc4.card_id)  (cost=0.76 rows=3) (actual time=0.005..0.005 rows=3 loops=3000)
 |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.05 sec)

mysql> 
```



***Server Query 2 - index on preferred_vendors(vend_type)***

```
mysql> CREATE INDEX vendor_type ON preferred_vendors(vend_type);
Query OK, 0 rows affected (0.12 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> SET @vend_name_filter = "udukjemrx,ehmoqgkgt,yaulwjrlp,yhoszxcmw";
Query OK, 0 rows affected (0.01 sec)

mysql> SET @vend_type_filter = "rpikaoxq,kmcppyba,xsxkvxxu";
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_score_min_filter = 300;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_limit_min_filter = 1000;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @annual_fee_max_filter = 0;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @payment_processor_filter = "lzufuua,yytgtej,rmlyjku";
Query OK, 0 rows affected (0.00 sec)

mysql>
mysql> EXPLAIN ANALYZE SELECT cc.card_name,
    ->     -- use this aggregation to get weighted number to select appropriate ranking
    ->     -- flags with higher multipliers indicate greater importance in our ranking metric
    ->     (400 * credit_score_flag + 300 * credit_limit_flag + 200 * payment_processor_flag +
    ->             100 * annual_fee_flag + COALESCE(vendor_requirements_counts, 0)) AS user_specification_card_rating,
    ->     average_rating
    -> FROM credit_cards cc
    -> -- determine number of vendor matches a card has
    -> LEFT JOIN (
    ->     SELECT cc1.card_id, COUNT(pv1.vend_id) AS vendor_requirements_counts
    ->     FROM credit_cards cc1
    ->     NATURAL JOIN offers o1 NATURAL JOIN preferred_vendors pv1
    ->     WHERE (FIND_IN_SET(pv1.vend_type, @vend_type_filter) OR FIND_IN_SET(pv1.vend_name, @vend_name_filter))
    ->     GROUP BY cc1.card_id
    -> ) vendorsub ON cc.card_id = vendorsub.card_id
    -> -- determine if credit card meets certain requirements, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT
    ->         cc2.card_id,
    ->         IF (cc2.min_rec_credit >= @credit_score_min_filter, 1, 0) AS credit_score_flag,
    ->         IF(cc2.credit_limit >= @credit_limit_min_filter, 1, 0) AS credit_limit_flag,
    ->         IF(cc2.annual_fee <= @annual_fee_max_filter, 1, 0) AS annual_fee_flag
    ->     FROM credit_cards cc2
    -> ) cardsub ON cc.card_id = cardsub.card_id
    -> -- determine if credit card uses one of specified payment processors, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT cc3.card_id, IF(FIND_IN_SET(pp3.processor_name, @payment_processor_filter), 1, 0) AS payment_processor_flag
    ->     FROM credit_cards cc3 NATURAL JOIN payment_processors pp3
    -> ) processorsub ON cc.card_id = processorsub.card_id
    -> -- get average rating to use as tiebreaker if we still have multiple cards
    -> LEFT JOIN (
    ->     SELECT cc4.card_id, AVG(cr.rating) AS average_rating
    ->     FROM credit_cards cc4
    ->     NATURAL JOIN card_ratings cr
    ->     GROUP BY cc4.card_id
    -> ) ratingsub ON cc.card_id = ratingsub.card_id
    -> ORDER BY user_specification_card_rating DESC, average_rating DESC;
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| EXPLAIN |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| -> Sort: user_specification_card_rating DESC, ratingsub.average_rating DESC  (actual time=43.675..43.898 rows=3000 loops=1)
    -> Stream results  (cost=87152.76 rows=0) (actual time=21.801..42.441 rows=3000 loops=1)
        -> Nested loop left join  (cost=87152.76 rows=0) (actual time=21.761..38.772 rows=3000 loops=1)
            -> Nested loop left join  (cost=10469.87 rows=0) (actual time=1.133..14.247 rows=3000 loops=1)
                -> Nested loop inner join  (cost=2804.87 rows=3066) (actual time=0.093..11.342 rows=3000 loops=1)
                    -> Nested loop inner join  (cost=1731.77 rows=3066) (actual time=0.089..7.751 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=658.67 rows=3066) (actual time=0.082..3.162 rows=3000 loops=1)
                            -> Table scan on pp3  (cost=101.50 rows=1000) (actual time=0.048..0.346 rows=1000 loops=1)
                            -> Index lookup on cc3 using cc_fk_processor_id (processor_id=pp3.processor_id)  (cost=0.25 rows=3) (actual time=0.002..0.002 rows=3 loops=1000)
                        -> Single-row index lookup on cc using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                    -> Single-row index lookup on cc2 using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                -> Index lookup on vendorsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.000..0.000 rows=0 loops=3000)
                    -> Materialize  (cost=0.00..0.00 rows=0) (actual time=2.416..2.418 rows=12 loops=1)
                        -> Table scan on <temporary>  (actual time=0.000..0.001 rows=12 loops=1)
                            -> Aggregate using temporary table  (actual time=1.011..1.013 rows=12 loops=1)
                                -> Nested loop inner join  (cost=2201.50 rows=3000) (actual time=0.071..0.995 rows=12 loops=1)
                                    -> Nested loop inner join  (cost=1151.50 rows=3000) (actual time=0.057..0.924 rows=12 loops=1)
                                        -> Filter: ((0 <> find_in_set(pv1.vend_type,<cache>((@vend_type_filter)))) or (0 <> find_in_set(pv1.vend_name,<cache>((@vend_name_filter)))))  (cost=101.50 rows=1000) (actual time=0.035..0.852 rows=4 loops=1)
                                            -> Table scan on pv1  (cost=101.50 rows=1000) (actual time=0.024..0.307 rows=1000 loops=1)
                                        -> Filter: (o1.card_id is not null)  (cost=0.75 rows=3) (actual time=0.013..0.017 rows=3 loops=4)
                                            -> Index lookup on o1 using offer_fk_vend_id (vend_id=pv1.vend_id)  (cost=0.75 rows=3) (actual time=0.013..0.017 rows=3 loops=4)
                                    -> Single-row index lookup on cc1 using PRIMARY (card_id=o1.card_id)  (cost=0.25 rows=1) (actual time=0.006..0.006 rows=1 loops=12)
            -> Index lookup on ratingsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.001..0.001 rows=1 loops=3000)
                -> Materialize  (cost=5441.95..5441.95 rows=9325) (actual time=23.274..23.872 rows=3000 loops=1)
                    -> Group aggregate: avg(cr.rating)  (cost=4509.48 rows=9325) (actual time=0.088..17.982 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=3577.00 rows=9325) (actual time=0.068..16.656 rows=9000 loops=1)
                            -> Index scan on cc4 using PRIMARY  (cost=313.35 rows=3066) (actual time=0.039..0.906 rows=3000 loops=1)
                            -> Index lookup on cr using rate_fk_card_id (card_id=cc4.card_id)  (cost=0.76 rows=3) (actual time=0.004..0.005 rows=3 loops=3000)
 |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.05 sec)

mysql>
```


***Server Query 2 - index on preferred_vendors(vend_name)***

```
mysql> CREATE INDEX vendor_name ON preferred_vendors(vend_name);
Query OK, 0 rows affected (0.05 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> SET @vend_name_filter = "udukjemrx,ehmoqgkgt,yaulwjrlp,yhoszxcmw";
Query OK, 0 rows affected (0.00 sec)

mysql> SET @vend_type_filter = "rpikaoxq,kmcppyba,xsxkvxxu";
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_score_min_filter = 300;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_limit_min_filter = 1000;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @annual_fee_max_filter = 0;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @payment_processor_filter = "lzufuua,yytgtej,rmlyjku";
Query OK, 0 rows affected (0.00 sec)

mysql>
mysql> EXPLAIN ANALYZE SELECT cc.card_name,
    ->     -- use this aggregation to get weighted number to select appropriate ranking
    ->     -- flags with higher multipliers indicate greater importance in our ranking metric
    ->     (400 * credit_score_flag + 300 * credit_limit_flag + 200 * payment_processor_flag +
    ->             100 * annual_fee_flag + COALESCE(vendor_requirements_counts, 0)) AS user_specification_card_rating,
    ->     average_rating
    -> FROM credit_cards cc
    -> -- determine number of vendor matches a card has
    -> LEFT JOIN (
    ->     SELECT cc1.card_id, COUNT(pv1.vend_id) AS vendor_requirements_counts
    ->     FROM credit_cards cc1
    ->     NATURAL JOIN offers o1 NATURAL JOIN preferred_vendors pv1
    ->     WHERE (FIND_IN_SET(pv1.vend_type, @vend_type_filter) OR FIND_IN_SET(pv1.vend_name, @vend_name_filter))
    ->     GROUP BY cc1.card_id
    -> ) vendorsub ON cc.card_id = vendorsub.card_id
    -> -- determine if credit card meets certain requirements, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT
    ->         cc2.card_id,
    ->         IF (cc2.min_rec_credit >= @credit_score_min_filter, 1, 0) AS credit_score_flag,
    ->         IF(cc2.credit_limit >= @credit_limit_min_filter, 1, 0) AS credit_limit_flag,
    ->         IF(cc2.annual_fee <= @annual_fee_max_filter, 1, 0) AS annual_fee_flag
    ->     FROM credit_cards cc2
    -> ) cardsub ON cc.card_id = cardsub.card_id
    -> -- determine if credit card uses one of specified payment processors, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT cc3.card_id, IF(FIND_IN_SET(pp3.processor_name, @payment_processor_filter), 1, 0) AS payment_processor_flag
    ->     FROM credit_cards cc3 NATURAL JOIN payment_processors pp3
    -> ) processorsub ON cc.card_id = processorsub.card_id
    -> -- get average rating to use as tiebreaker if we still have multiple cards
    -> LEFT JOIN (
    ->     SELECT cc4.card_id, AVG(cr.rating) AS average_rating
    ->     FROM credit_cards cc4
    ->     NATURAL JOIN card_ratings cr
    ->     GROUP BY cc4.card_id
    -> ) ratingsub ON cc.card_id = ratingsub.card_id
    -> ORDER BY user_specification_card_rating DESC, average_rating DESC;
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| EXPLAIN |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| -> Sort: user_specification_card_rating DESC, ratingsub.average_rating DESC  (actual time=44.103..44.309 rows=3000 loops=1)
    -> Stream results  (cost=87152.76 rows=0) (actual time=21.665..43.014 rows=3000 loops=1)
        -> Nested loop left join  (cost=87152.76 rows=0) (actual time=21.624..39.227 rows=3000 loops=1)
            -> Nested loop left join  (cost=10469.87 rows=0) (actual time=0.953..14.582 rows=3000 loops=1)
                -> Nested loop inner join  (cost=2804.87 rows=3066) (actual time=0.062..11.748 rows=3000 loops=1)
                    -> Nested loop inner join  (cost=1731.77 rows=3066) (actual time=0.058..8.050 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=658.67 rows=3066) (actual time=0.051..3.202 rows=3000 loops=1)
                            -> Table scan on pp3  (cost=101.50 rows=1000) (actual time=0.037..0.340 rows=1000 loops=1)
                            -> Index lookup on cc3 using cc_fk_processor_id (processor_id=pp3.processor_id)  (cost=0.25 rows=3) (actual time=0.002..0.002 rows=3 loops=1000)
                        -> Single-row index lookup on cc using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                    -> Single-row index lookup on cc2 using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                -> Index lookup on vendorsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.000..0.000 rows=0 loops=3000)
                    -> Materialize  (cost=0.00..0.00 rows=0) (actual time=2.298..2.305 rows=12 loops=1)
                        -> Table scan on <temporary>  (actual time=0.000..0.001 rows=12 loops=1)
                            -> Aggregate using temporary table  (actual time=0.874..0.875 rows=12 loops=1)
                                -> Nested loop inner join  (cost=2201.50 rows=3000) (actual time=0.055..0.858 rows=12 loops=1)
                                    -> Nested loop inner join  (cost=1151.50 rows=3000) (actual time=0.049..0.824 rows=12 loops=1)
                                        -> Filter: ((0 <> find_in_set(pv1.vend_type,<cache>((@vend_type_filter)))) or (0 <> find_in_set(pv1.vend_name,<cache>((@vend_name_filter)))))  (cost=101.50 rows=1000) (actual time=0.033..0.773 rows=4 loops=1)
                                            -> Table scan on pv1  (cost=101.50 rows=1000) (actual time=0.025..0.300 rows=1000 loops=1)
                                        -> Filter: (o1.card_id is not null)  (cost=0.75 rows=3) (actual time=0.008..0.012 rows=3 loops=4)
                                            -> Index lookup on o1 using offer_fk_vend_id (vend_id=pv1.vend_id)  (cost=0.75 rows=3) (actual time=0.008..0.012 rows=3 loops=4)
                                    -> Single-row index lookup on cc1 using PRIMARY (card_id=o1.card_id)  (cost=0.25 rows=1) (actual time=0.003..0.003 rows=1 loops=12)
            -> Index lookup on ratingsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.001..0.001 rows=1 loops=3000)
                -> Materialize  (cost=5441.95..5441.95 rows=9325) (actual time=23.383..23.974 rows=3000 loops=1)
                    -> Group aggregate: avg(cr.rating)  (cost=4509.48 rows=9325) (actual time=0.057..18.115 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=3577.00 rows=9325) (actual time=0.040..16.726 rows=9000 loops=1)
                            -> Index scan on cc4 using PRIMARY  (cost=313.35 rows=3066) (actual time=0.023..0.854 rows=3000 loops=1)
                            -> Index lookup on cr using rate_fk_card_id (card_id=cc4.card_id)  (cost=0.76 rows=3) (actual time=0.004..0.005 rows=3 loops=3000)
 |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.05 sec)

mysql>
```



***Server Query 2 - index on payment_processors(processor_name)***

```
mysql> CREATE INDEX proc_name ON payment_processors(processor_name);
Query OK, 0 rows affected (0.09 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> SET @vend_name_filter = "udukjemrx,ehmoqgkgt,yaulwjrlp,yhoszxcmw";
Query OK, 0 rows affected (0.00 sec)

mysql> SET @vend_type_filter = "rpikaoxq,kmcppyba,xsxkvxxu";
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_score_min_filter = 300;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @credit_limit_min_filter = 1000;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @annual_fee_max_filter = 0;
Query OK, 0 rows affected (0.00 sec)

mysql> SET @payment_processor_filter = "lzufuua,yytgtej,rmlyjku";
Query OK, 0 rows affected (0.01 sec)

mysql>
mysql> EXPLAIN ANALYZE SELECT cc.card_name,
    ->     -- use this aggregation to get weighted number to select appropriate ranking
    ->     -- flags with higher multipliers indicate greater importance in our ranking metric
    ->     (400 * credit_score_flag + 300 * credit_limit_flag + 200 * payment_processor_flag +
    ->             100 * annual_fee_flag + COALESCE(vendor_requirements_counts, 0)) AS user_specification_card_rating,
    ->     average_rating
    -> FROM credit_cards cc
    -> -- determine number of vendor matches a card has
    -> LEFT JOIN (
    ->     SELECT cc1.card_id, COUNT(pv1.vend_id) AS vendor_requirements_counts
    ->     FROM credit_cards cc1
    ->     NATURAL JOIN offers o1 NATURAL JOIN preferred_vendors pv1
    ->     WHERE (FIND_IN_SET(pv1.vend_type, @vend_type_filter) OR FIND_IN_SET(pv1.vend_name, @vend_name_filter))
    ->     GROUP BY cc1.card_id
    -> ) vendorsub ON cc.card_id = vendorsub.card_id
    -> -- determine if credit card meets certain requirements, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT
    ->         cc2.card_id,
    ->         IF (cc2.min_rec_credit >= @credit_score_min_filter, 1, 0) AS credit_score_flag,
    ->         IF(cc2.credit_limit >= @credit_limit_min_filter, 1, 0) AS credit_limit_flag,
    ->         IF(cc2.annual_fee <= @annual_fee_max_filter, 1, 0) AS annual_fee_flag
    ->     FROM credit_cards cc2
    -> ) cardsub ON cc.card_id = cardsub.card_id
    -> -- determine if credit card uses one of specified payment processors, use numbers for aggregation formula
    -> JOIN (
    ->     SELECT cc3.card_id, IF(FIND_IN_SET(pp3.processor_name, @payment_processor_filter), 1, 0) AS payment_processor_flag
    ->     FROM credit_cards cc3 NATURAL JOIN payment_processors pp3
    -> ) processorsub ON cc.card_id = processorsub.card_id
    -> -- get average rating to use as tiebreaker if we still have multiple cards
    -> LEFT JOIN (
    ->     SELECT cc4.card_id, AVG(cr.rating) AS average_rating
    ->     FROM credit_cards cc4
    ->     NATURAL JOIN card_ratings cr
    ->     GROUP BY cc4.card_id
    -> ) ratingsub ON cc.card_id = ratingsub.card_id
    -> ORDER BY user_specification_card_rating DESC, average_rating DESC;
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| EXPLAIN |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| -> Sort: user_specification_card_rating DESC, ratingsub.average_rating DESC  (actual time=47.368..47.577 rows=3000 loops=1)
    -> Stream results  (cost=87152.76 rows=0) (actual time=24.286..46.066 rows=3000 loops=1)
        -> Nested loop left join  (cost=87152.76 rows=0) (actual time=24.228..42.450 rows=3000 loops=1)
            -> Nested loop left join  (cost=10469.87 rows=0) (actual time=1.098..15.050 rows=3000 loops=1)
                -> Nested loop inner join  (cost=2804.87 rows=3066) (actual time=0.126..12.152 rows=3000 loops=1)
                    -> Nested loop inner join  (cost=1731.77 rows=3066) (actual time=0.122..8.452 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=658.67 rows=3066) (actual time=0.109..3.416 rows=3000 loops=1)
                            -> Index scan on pp3 using proc_name  (cost=101.50 rows=1000) (actual time=0.090..0.357 rows=1000 loops=1)
                            -> Index lookup on cc3 using cc_fk_processor_id (processor_id=pp3.processor_id)  (cost=0.25 rows=3) (actual time=0.002..0.003 rows=3 loops=1000)
                        -> Single-row index lookup on cc using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                    -> Single-row index lookup on cc2 using PRIMARY (card_id=cc3.card_id)  (cost=0.25 rows=1) (actual time=0.001..0.001 rows=1 loops=3000)
                -> Index lookup on vendorsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.000..0.000 rows=0 loops=3000)
                    -> Materialize  (cost=0.00..0.00 rows=0) (actual time=2.404..2.406 rows=12 loops=1)
                        -> Table scan on <temporary>  (actual time=0.001..0.001 rows=12 loops=1)
                            -> Aggregate using temporary table  (actual time=0.948..0.949 rows=12 loops=1)
                                -> Nested loop inner join  (cost=2201.50 rows=3000) (actual time=0.092..0.928 rows=12 loops=1)
                                    -> Nested loop inner join  (cost=1151.50 rows=3000) (actual time=0.080..0.876 rows=12 loops=1)
                                        -> Filter: ((0 <> find_in_set(pv1.vend_type,<cache>((@vend_type_filter)))) or (0 <> find_in_set(pv1.vend_name,<cache>((@vend_name_filter)))))  (cost=101.50 rows=1000) (actual time=0.056..0.812 rows=4 loops=1)
                                            -> Table scan on pv1  (cost=101.50 rows=1000) (actual time=0.042..0.317 rows=1000 loops=1)
                                        -> Filter: (o1.card_id is not null)  (cost=0.75 rows=3) (actual time=0.010..0.015 rows=3 loops=4)
                                            -> Index lookup on o1 using offer_fk_vend_id (vend_id=pv1.vend_id)  (cost=0.75 rows=3) (actual time=0.010..0.015 rows=3 loops=4)
                                    -> Single-row index lookup on cc1 using PRIMARY (card_id=o1.card_id)  (cost=0.25 rows=1) (actual time=0.004..0.004 rows=1 loops=12)
            -> Index lookup on ratingsub using <auto_key0> (card_id=cc3.card_id)  (actual time=0.001..0.001 rows=1 loops=3000)
                -> Materialize  (cost=5441.95..5441.95 rows=9325) (actual time=26.011..26.659 rows=3000 loops=1)
                    -> Group aggregate: avg(cr.rating)  (cost=4509.48 rows=9325) (actual time=0.072..20.485 rows=3000 loops=1)
                        -> Nested loop inner join  (cost=3577.00 rows=9325) (actual time=0.051..19.095 rows=9000 loops=1)
                            -> Index scan on cc4 using PRIMARY  (cost=313.35 rows=3066) (actual time=0.026..0.899 rows=3000 loops=1)
                            -> Index lookup on cr using rate_fk_card_id (card_id=cc4.card_id)  (cost=0.76 rows=3) (actual time=0.005..0.006 rows=3 loops=3000)
 |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.05 sec)

mysql>
```


