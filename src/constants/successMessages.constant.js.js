const SUCCESS_MESSAGES = {
    AUTH: {
        REGISTRATION_SUCCESS:
            "Welcome to our green family! 🌿 Your registration blossomed successfully.",
        LOGIN_SUCCESS: "Welcome back! You’ve logged in with the sunshine 🌞",
        PROFILE_FETCHED:
            "Your profile bloomed beautifully 🌸 Here are your details!",
        LOGOUT_SUCCESS: "You've logged out gracefully 🌸 See you again soon!",
        PASSWORD_CHANGED:
            "Your password has been freshly potted 🌸 You're now secure and sprouting!",
        ACCOUNT_VERIFIED:
            "Your account has taken root successfully 🌱 Welcome to the garden!",
        EMAIL_VERIFIED:
            "Your email has been gently confirmed like morning dew 💌🌼"
    },

    ORDERS: {
        ORDER_PLACED:
            "Your order has sprouted! 🌼 We're preparing it with love and care.",
        ORDER_UPDATED: "Your order has been refreshed with new details 🌿",
        ORDER_CANCELLED:
            "Your order has been gently cancelled 🌙 Hope to serve you again soon!",
        ORDER_COMPLETED:
            "Your order has fully bloomed 🌸 Enjoy your green goodies!",
        ORDER_DISPATCHED:
            "Your plant parcel has left the nursery 🌿 It’s en route with sunshine!",
        ORDER_RETURNED:
            "The return was accepted with grace 🌙 We’ll nurture it back into the system.",
        ORDER_FEEDBACK_RECEIVED:
            "Thanks for the feedback 🌼 You help our garden grow better every day!"
    },

    PROMOTIONS: {
        PROMO_APPLIED: "Yay! Your discount has bloomed successfully 🎉"
    },

    PRODUCTS: {
        PLANTS: {
            PRODUCT_ADDED: "A lovely new plant has joined the nursery 🌿",
            PRODUCT_UPDATED:
                "This plant’s details have been refreshed and nurtured 🍃",
            PRODUCT_REMOVED:
                "This plant has been gently removed from the collection 🌾",
            RESTOCKED:
                "Fresh stock of this plant is now available 🌼 Ready to order!",
            PRODUCT_FEATURED:
                "This green beauty is now featured in the spotlight 🌟 Let the admiration bloom!",
            PRODUCT_ARCHIVED:
                "This plant is resting from the display 🌿 Archived with care and roots intact."
        },
        POTS: {
            PRODUCT_ADDED:
                "A beautiful pot has been added to our collection 🪴",
            PRODUCT_UPDATED:
                "This pot’s details are now up-to-date and shining ✨",
            PRODUCT_REMOVED:
                "This pot has been gracefully removed from the shelf 🍂",
            RESTOCKED:
                "This pot is back in stock and ready to pair with your plant 🌿🪴"
        }
    },

    CART: {
        CART_ITEM_ADDED: "Added to your cart with care 🛒🌿",
        CART_ITEM_REMOVED:
            "Removed from your cart 🍂 Safe travels, little leaf!",
        CART_UPDATED:
            "Your cart has been freshly pruned 🌿 Ready to grow again!",
        CART_FETCHED:
            "Here’s your blooming cart 🌼 Let’s check out the goodies!",
        CART_CLEARED:
            "Your cart has been emptied like a fall breeze 🍁 Ready for a new garden haul?",
        QUANTITY_UPDATED: "Quantity updated — more greens coming your way 🌱",
        CART_SAVED_FOR_LATER:
            "Saved for later 🍃 It'll wait patiently like a seedling in shade."
    },

    REVIEWS: {
        REVIEW_SUBMITTED:
            "Thank you for sharing your thoughts! You help our garden grow 🌿",
        REVIEW_UPDATED: "Your review has been lovingly updated 🌼",
        REVIEW_DELETED: "Your review has been removed with care 🍂"
    },

    WAREHOUSES: {
        STOCK_ADDED:
            "New green stock has been added to the warehouse 🌱 Ready for action!",
        STOCK_UPDATED: "The stock has been trimmed and updated 🌿",
        WAREHOUSE_CREATED: "A new warehouse has sprouted successfully 🏡",
        WAREHOUSE_UPDATED:
            "Warehouse details refreshed like a morning breeze 🌬️",
        STOCK_TRANSFERRED: "Stock has been transferred smoothly 🌿🚛",
        STOCK_REPLENISHED:
            "Stock replenished successfully 🌱 The shelves are green again!",
        INVENTORY_COUNTED: "Inventory check complete 🧮 Everything’s in order!",
        WAREHOUSE_ASSIGNED: "Warehouse assigned successfully 🌾",
        WAREHOUSE_SYNCED:
            "Your warehouse data is now fresh as morning dew 🌿 All synced and sprouting!",
        LOW_STOCK_ALERT_HANDLED:
            "The low-stock alert was pruned successfully 🌼 Keep the shelves green!"
    },

    SUPPLIERS: {
        PROFILE_CREATED: "Supplier profile set up and ready to grow 🌱",
        PROFILE_SUBMITTED_FOR_REVIEW:
            "Your profile has been submitted for review 🌼 We'll nurture it with care!",
        PROFILE_UPDATED: "Supplier details updated successfully 🌼",
        PRODUCT_SUBMITTED: "Your product has been submitted for review 🌿",
        INVENTORY_ADDED: "Your inventory has been added to our garden 🌸",
        PAYMENT_CONFIRMED: "Payment received and acknowledged 💸🌿",
        DELIVERY_MARKED:
            "Delivery marked complete 🚚🌿 Thank you for your contribution!",
        APPLICATION_APPROVED:
            "You're officially a grower in our ecosystem 🌱 Let's cultivate success together!",
        DOCUMENTS_VERIFIED:
            "Your credentials are sprouting strong 🌿 All set for blooming business!",
        PAYOUT_PROCESSED:
            "Your green earnings have been sent 🌼 Thank you for growing with us!"
    },

    ADMIN: {
        ACCESS_GRANTED: "Hello Admin 🌿 You’re now in the control garden.",
        USER_VERIFIED: "User has been verified successfully 🔍🌿",
        PRODUCT_APPROVED: "Product approved and listed in the marketplace 🌟",
        ACCOUNT_ACTIVATED: "Account activated and ready for growth 🌱",
        CATEGORY_CREATED: "A new plant category has blossomed 🌼",
        CATEGORY_UPDATED: "Category details pruned and updated 🍃",
        PROMOTION_CREATED: "A fresh promotion is live! 🎉",
        ISSUE_RESOLVED: "Customer issue resolved successfully 🌻",
        FORGOT_PASSWORD_SENT:
            "We've sent password reset steps your way 🌈 Check your inbox!",
        SETTINGS_SAVED:
            "Your settings have been nurtured and planted successfully 🌿",
        ROLE_CREATED:
            "A new role has bloomed 🌱 Ready to assign with love and care."
    },

    SUPER_ADMIN: {
        DASHBOARD_ACCESS: "Super Admin dashboard unlocked. Lead with grace 🌟",
        ROLE_ASSIGNED: "Role assigned with care and responsibility 👑🌿",
        PERMISSIONS_UPDATED: "Permissions updated across the garden 🛠️",
        SYSTEM_SETTINGS_UPDATED: "System settings adjusted successfully 🪴",
        PLATFORM_STATS_FETCHED: "All platform metrics loaded 🌍📊",
        ADMIN_CREATED: "New admin added to the control garden 🧑‍🌾"
    },

    USERS: {
        CUSTOMER: {
            PROFILE_UPDATED:
                "Your details have been refreshed. Looking sharp as a sunflower! 🌻",
            PROFILE_RESTORED: "Your profile is back in bloom 🌱 Welcome again!"
        },
        WAREHOUSE_MANAGER: {
            DASHBOARD_READY:
                "Warehouse tools are all set and ready for action 🚛🌿"
        },
        KEY_AREA_MANAGER: {
            OVERVIEW_READY:
                "Regional insights are here — ready for your green touch 🍀"
        }
    },

    COMMON: {
        ACTION_SUCCESS:
            "All done! That went as smooth as a breeze through leaves 🌸",
        PROFILE_FETCH_SUCCESS: "Here’s your lovely profile, freshly loaded 🍀",
        PROFILE_UPDATED:
            "Your profile has been refreshed and looks wonderful 🌼",
        PROFILE_RESTORED: "Welcome back! Your profile is blooming again 🌱",
        PROFILE_DELETION_SUCCESS:
            "Your profile has been carefully removed. Wishing you sunshine ahead 🌻",
        PROFILE_DEACTIVATED:
            "Your profile has been gently tucked away for a rest 🌙🌾 It’s safe in the garden shed.",
        REQUEST_RECEIVED:
            "We’ve received your request like a falling seed 🌱 Hang tight, we’re tending to it.",
        ACTION_CONFIRMED:
            "Action confirmed 🌼 Everything is blooming as planned!",
        CHANGES_SAVED:
            "Your changes have taken root 🌿 They’re now part of the garden!"
    },

    CLOUDINARY: {
        UPLOAD_SUCCESS:
            "Your file has floated to the cloud like a dandelion seed ☁️🌱 It's safe and sound!",
        DELETE_SUCCESS:
            "The media was gently removed from the cloud 🌤️ All clear in the sky garden!"
    },

    PAYMENTS: {
        PAYMENT_SUCCESSFUL: "Your payment went through like a breeze 💳🌿",
        REFUND_INITIATED: "Refund process initiated 💧 Expect green back soon!",
        PAYMENT_LINK_SENT: "Payment link sent to your inbox 📩",
        TRANSACTION_COMPLETED: "Transaction completed successfully 🌼",
        INVOICE_GENERATED: "Invoice sprouted and sent 🍃 Check your inbox!",
        WALLET_TOPPED_UP:
            "Your garden wallet has been watered 💧 Happy spending!"
    },

    DELIVERIES: {
        PICKUP_SCHEDULED: "Pickup scheduled with care 🚚🌱",
        OUT_FOR_DELIVERY: "Your green friend is out for delivery 🌿📦",
        DELIVERED_SUCCESSFULLY: "Delivered with love 🌼 Hope it brings joy!",
        RETURN_REQUESTED: "Return request noted 🌾 We’ll process it shortly.",
        RETURN_COMPLETED: "Return completed and acknowledged 🍂",
        DELIVERY_PARTNER_ASSIGNED:
            "A delivery partner has picked your green gift 🌿 On the way!",
        DELIVERY_IN_PROGRESS:
            "Your package is leafing the nursery 🌱 It’s heading home soon!"
    },

    REPORTS: {
        SALES_REPORT_READY: "Sales report generated successfully 📈🌻",
        INVENTORY_REPORT_READY:
            "Inventory report fetched 🌿 Everything’s logged!",
        SUPPLIER_PERFORMANCE_FETCHED:
            "Supplier performance data ready for review 📊",
        CUSTOMER_FEEDBACK_ANALYZED: "Customer feedback report available 🌸",
        CUSTOM_REPORT_READY:
            "Your custom report is freshly harvested 🌼 Time to explore insights!",
        DAILY_METRICS_LOADED:
            "Today's garden activity is blooming 📊 Let’s take a look!"
    },

    OTP: {
        SENT: "Your OTP is on its way! 🌱 It's valid for the next 2 minutes.",
        VERIFIED: "OTP verified successfully! You're all set to grow forward 🌼"
    },

    RESET_PASSWORD: {
        SUCCESS:
            "Your password has been reset with care 🌼 You’re ready to log in again!"
    },

    NOTIFICATIONS: {
        NOTIFICATION_SENT: "Your update has been delivered with a breeze 🍃",
        NEWSLETTER_SUBSCRIBED:
            "You’ve subscribed to fresh updates 🌻 Expect some sunshine in your inbox!"
    },

    CART: {
        CART_ITEM_ADDED: "Added to your cart with care 🛒🌿",
        CART_ITEM_REMOVED:
            "Removed from your cart 🍂 Safe travels, little leaf!"
    },

    WISHLIST: {
        WISHLIST_ITEM_ADDED:
            "Added to your wishlist 🌟 One step closer to blooming joy!",
        WISHLIST_ITEM_REMOVED:
            "Removed from your wishlist 🌾 Hope you find something greener!"
    },

    FEEDBACK: {
        FEEDBACK_RECEIVED:
            "Thanks for your thoughts 🌼 We're listening closely.",
        SUPPORT_REQUEST_RECEIVED:
            "Your support request is rooted! 🌿 We’ll reach out shortly.",
        CONTACT_FORM_SUBMITTED:
            "Your message has been planted 🌱 Expect a response soon!"
    },

    SUBSCRIPTION: {
        SUBSCRIBED_SUCCESSFULLY: "You're subscribed to our garden updates 🌻",
        UNSUBSCRIBED_SUCCESSFULLY:
            "Unsubscribed like a leaf on the wind 🍃 Hope to see you again!",
        ALERT_ENABLED: "You'll be the first to know when it’s back in stock 🌼"
    },

    PREFERENCES: {
        PREFERENCES_SAVED:
            "Your preferences are tucked in like roots 🌱 All set!",
        NOTIFICATION_SETTINGS_UPDATED:
            "Your notification petals are now blooming the way you like 🌸"
    },

    BULK_ACTIONS: {
        BULK_UPLOAD_SUCCESS:
            "Your green bunch has been uploaded 🌿 All lined up!",
        BULK_UPDATE_SUCCESS: "All selected items nurtured and updated 🌼"
    }
};

module.exports = SUCCESS_MESSAGES;
