UPDATE credit_cards SET image_url = 'https://creditcards.chase.com/K-Marketplace/images/cardart/freedom_unlimited_card_alt.png' WHERE image_url LIKE 'data:image/%';
UPDATE credit_cards SET image_url = 'https://creditcards.chase.com/K-Marketplace/images/cardart/freedom_unlimited_card_alt.png' WHERE image_url NOT LIKE '%.png' AND image_url NOT LIKE '%.jpeg' AND image_url NOT LIKE '%.jpg';
