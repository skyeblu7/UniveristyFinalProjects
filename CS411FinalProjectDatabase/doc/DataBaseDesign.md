## Database Design

# UML:
<img src="images/Proposal/UML.jpg" alt="drawing" width="750"/>

**UML Assumptions**
1. A credit card may only be processed by exactly one payment processor.
2. A payment processor can process zero or more credit cards.
3. A click event record must be associated with exactly 1 credit card.
4. A credit card can be associated with 0 or more click event records.
5. A credit card can have 0 or more offers from preferred vendors.
6. A preferred vendor can have offers for 0 or more credit cards.
7. A credit card rating reviews exactly 1 credit card.
8. A credit card can be reviewed by multiple raters.
9. A credit card can have offers afflicated with 0 or more categories.
10. A category must be associated with exactly 1 credit card.

# Relational Schema:
![image](https://user-images.githubusercontent.com/38967582/194156311-b71105b3-5441-4dd9-bad5-11a0fee961b4.png)
![image](https://user-images.githubusercontent.com/38967582/194156406-6d8147ae-5d0c-408a-91d6-b3caaae9d91e.png)


## Entities:
Parameter names inside of each table are self-descriptive. Keys and data types are marked on the notepad images above.
# Credit_Cards:
Contains information on a specific credit card offer. Has a foreign key to processor_id.

# Payment_Processors:
Contains details of a payment processor. Every credit_card entry will have a key to exactly one payment processor.

# Click_Logs:
Used for trending data. Contains user information on which cards they clicked on.

# Preferred_Vendors:
Contains information on companies and the type of service they offer. A credit card may or may not have any number of preferred vendors.

# Offers:
A relationship table that links Credit_Card's card_id to Preferred_Vendor's vend_id. This is a many-many relationship.

# Categories:
Includes different spending categories and the type of reward offered for them. A card may or may not have discounts/rewards for different spending categories. Contains a fireign key to card_id.

# Card_Ratings:
Contains rating information from review websites on a credit card. Contains a foreign key to card_id.
