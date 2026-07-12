## MVP

users
customers
work_orders
work_order_status_histories
work_order_attachments

## 1. Rancang tabel users
users
--------
id ---> primary key
name
email ---> harus unik
password_hash
phone
role ---> hanya admin atau technician
is_active
created_at
updated_at

## 2. Rancang tabel customers
customers
-----------
id ---> PRIMARY KEY
name
phone
email
address
notes
created_at
updated_at

## 3. Rancang tabel work_orders
work_orders
------------
id ---> PRIMARY KEY
work_order_number ---> UNIQUE
customer_id ---> FK --> customers.id
technician_id ---FK --> users.id NULLABLE
title
description
scheduled_at
status
completed_at ---> NULLABLE
created_by ---> FK --> users.id
created_at
updated_at

## 4. Rancang tabel work_order_status_histories
work_order_status_histories
----------------------------
id ---> PRIMARY KEY
work_order_id ---> FK --> work_orders.id
previous_status ---> NULLABLE
new_status
changed_by ---> FK --> users.id
notes ---> NULLABLE
created_at

## 5. Rancang tabel work_order_attachments
work_order_attachments
-----------------------
id ---> PRIMARY KEY
work_order_id ---> FK --> work_orders.id
uploaded_by ---> FK --> users.id
file_url
file_name
file_type
file_size
attachment_type
description ---> NULLABLE
created_at


