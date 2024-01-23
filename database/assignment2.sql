SELECT * FROM public.account;		

-- Creating a new Client called "Tony Stark"
INSERT INTO public.account (account_firstname, 
							account_lastname,
						    account_email, 
							account_password)
VALUES ('Tony', 
	'Stark', 
	'tony@starkent.com', 
	'Iam1ronM@n'); 	

-- Updating the account_type

UPDATE public.account SET account_type = 'Admin' 
WHERE account_id = 1;

-- Deleting the account where id = 1

DELETE FROM public.account
WHERE account_id = 1;

-- Updating part of the description
UPDATE 
   public.inventory
SET 
   inv_description = REPLACE (
  	inv_description,
	'small interiors',
	'a huge interior'
   );

-- Testing if it worked
SELECT * FROM public.inventory;		

--  Making an Inner JOIN to retrieve the make, model and classification name 
-- from 2 different tables that have in common the classification_id.
SELECT 	inv_make,
		inv_model,
		classification_name
FROM
	public.classification
INNER JOIN public.inventory
	ON classification.classification_id = inventory.classification_id
WHERE classification.classification_id = 2;

-- Updating the inv_image and inv_thumbnail columns so every url have "/vehicles" as part of the url
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');