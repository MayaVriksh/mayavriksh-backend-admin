const ERROR_MESSAGES = {
    AUTH: {
        REGISTRATION_FAILED:
            "Oops! We couldn’t complete your registration this time 🌧️ Let’s try again.",
        EMAIL_ALREADY_REGISTERED:
            "This email is already part of our garden 🌷 Try signing in instead.",
        EMAIL_ALREADY_EXISTS:
            "A blooming email like this is already rooted here 🌼 Try using a different one.",
        PHONE_ALREADY_EXISTS:
            "This phone number is already sprouting in our system 🌾 Please try another.",
        EMAIL_NOT_EXISTS:
            "We couldn’t find this email in our garden 🌱 Try a different one or register first.",
        PHONE_NOT_EXISTS:
            "This phone number hasn’t taken root here yet 🌿 Please check again or sign up first.",
        PASSWORD_WRONG:
            "The password doesn’t match the garden gate key 🌒 Please try again.",
        INVALID_REGISTRATION:
            "Something seems out of place ✂️ Please check your details and try again.",
        LOGIN_FAILED:
            "We couldn’t log you in just yet 🌥️ Please review your details and try again.",
        LOGOUT_FAILED:
            "Logging out didn’t go as planned 🌾 Please try again in a moment.",
        PASSWORD_CHANGE_FAILED:
            "We couldn’t update your password right now 🌧️ Please try again later.",
        INVALID_CREDENTIALS:
            "These credentials don’t match our garden records 🌿 Double-check and try again.",
        ACCOUNT_LOCKED:
            "Too many login attempts 🌒 Please reset your password to continue.",
        ACCOUNT_INACTIVE:
            "Your account is resting like a seed 🌱 Contact support to help it grow again.",
        ACCOUNT_ALREADY_DEACTIVATED:
            "This account has already returned to the soil 🌾 You’ll need a fresh start or contact support.",
        PROFILE_DISPLAY_FAILED:
            "We couldn’t fetch your profile from the greenhouse 🌫️ Please try again soon.",
        TOKEN_EXPIRED:
            "The breeze carried you away for too long 🍃 Please log in again to continue.",
        INVALID_TOKEN:
            "Something went wrong with your access 🌾 Please log in again.",
        SESSION_EXPIRED:
            "The garden gates rested for a while 🌙 Please start fresh by logging in again.",
        UNAUTHORIZED_ACCESS:
            "You don’t have permission to access this garden 🌿",
        NOT_LOGGED_IN: "You’re not logged in yet 🌱 Please sign in to continue."
    },
    ORDERS: {
        ORDER_FAILED:
            "Something interrupted the bloom 🌧️ Please try placing your order again.",
        ORDER_NOT_FOUND:
            "We couldn’t find your order in our greenhouse 🌾 Please check the details.",
        ORDER_UPDATE_FAILED:
            "We couldn’t refresh your order 🌧️ Try again in a moment.",
        ORDER_CANCELLATION_FAILED:
            "This order didn’t want to be cancelled yet 🌪️ Please try again.",
        ORDER_ACCESS_DENIED:
            "This order isn’t part of your greenhouse 🌱 Access denied."
    },

    PROMOTIONS: {
        PROMO_INVALID:
            "Hmm... that code doesn’t seem to sprout 🌱 Try another one.",
        PROMO_EXPIRED: "This promotional bloom has wilted 🥀 Try a fresh code.",
        PROMO_NOT_FOUND:
            "That offer couldn’t be found in our garden 🌾 Please double-check.",
        PROMO_APPLY_FAILED:
            "We couldn’t apply this promo 🌥️ Give it another shot.",
        PROMO_USAGE_LIMIT:
            "You’ve reached the limit for this bloom 🌼 Try a different offer."
    },

    PRODUCTS: {
        PLANTS: {
            PRODUCT_NOT_FOUND: "We couldn’t locate this plant in our garden 🌱",
            OUT_OF_STOCK:
                "This green gem is currently out of stock 🌧️ Check again soon!",
            ADD_FAILED:
                "We couldn’t add this plant 🌾 Please recheck and try again.",
            UPDATE_FAILED: "We couldn’t refresh this plant’s details 🌧️"
        },
        POTS: {
            PRODUCT_NOT_FOUND: "We couldn’t find this pot in our collection 🏺",
            OUT_OF_STOCK:
                "This stylish pot is out of stock for now ⏳ Check back later!",
            ADD_FAILED: "Adding this pot didn’t go as planned 🍂 Try again.",
            UPDATE_FAILED: "We couldn’t update this pot’s info 🌧️"
        }
    },

    REVIEWS: {
        REVIEW_NOT_FOUND:
            "We couldn’t locate that review in the feedback garden 📝",
        SUBMISSION_FAILED:
            "We couldn't plant your review 🌧️ Try again shortly.",
        UPDATE_FAILED: "We couldn’t update this review 🍂 Please retry.",
        DELETE_FAILED: "We couldn’t remove your review this time 🌿"
    },

    WAREHOUSES: {
        STOCK_DEPLETED: "This stock has run out 🌧️ Refill is on the way!",
        WAREHOUSE_NOT_FOUND:
            "That warehouse couldn’t be found in our system 🌾 Please verify.",
        STOCK_UPDATE_FAILED:
            "We couldn’t trim or update this stock 🌿 Try again.",
        ASSIGNMENT_FAILED: "Assigning the warehouse didn’t root well 🌧️",
        INVENTORY_SYNC_FAILED:
            "Something interrupted the warehouse sync 🌪️ Try again soon.",
        INVENTORY_FETCH_FAILED:
            "We couldn’t fetch the inventory list 🌧️ Please refresh the page.",
        INVENTORY_UPDATE_FAILED: "The update didn’t sprout 🌿 Try again later."
    },

    SUPPLIERS: {
        PROFILE_NOT_FOUND: "Supplier profile not found in the greenhouse 🌿",
        PROFILE_UPDATE_FAILED:
            "We couldn’t update the supplier info this time 🌧️",
        DOCUMENT_UPLOAD_FAILED: "The document didn’t upload as expected 📄🌧️",
        VERIFICATION_FAILED:
            "Verification didn’t go through this time 🌱 Please try again.",
        PRODUCT_SUBMISSION_FAILED:
            "We couldn’t submit your product 🌧️ Let’s try again.",
        PAYOUT_FAILED:
            "We couldn’t process the payout right now 🌾 Please retry.",
        GSTIN_ALREADY_EXISTS:
            "This GSTIN is already rooted in our garden records 🌿 Try a different one to avoid overlap."
    },

    USERS: {
        PROFILE_NOT_FOUND:
            "Hmm... we couldn’t find your profile in the garden 🌾",
        PROFILE_DEACTIVATED: "This profile has been gently put to rest 🌙",
        PROFILE_UPDATE_FAILED: "We couldn’t update your profile this time 🌿",
        PROFILE_ALREADY_EXISTS:
            "A profile with these details is already blooming 🌷",
        PROFILE_UNAUTHORIZED:
            "You’re not allowed to tend to this part of the garden 🛑",
        PROFILE_FETCH_FAILED:
            "We couldn’t load your profile right now. Please try again shortly 🌧️"
    },

    COMMON: {
        INTERNAL_SERVER_ERROR:
            "Oh no! Something went wrong on our end. We're already on it 🌱",
        BAD_REQUEST:
            "Hmm... some details seem off. Let’s double-check and try again 🌼",
        ACCESS_DENIED: "You don’t have access to this garden path 🌿",
        RESOURCE_NOT_FOUND:
            "We couldn’t find what you were looking for. It may have withered away 🍂",
        ACTION_FAILED:
            "We couldn’t complete this action. Let's give it another shot 🍃"
    },

    CLOUDINARY: {
        UPLOAD_FAILED:
            "Oops! The file didn’t take flight 🌧️ Let’s try lifting it to the cloud again.",
        DELETE_FAILED:
            "We couldn’t clear the clouds this time 🌫️ The media is still hanging around.",
        MISSING_FILE_PATH:
            "No file path provided 🌿 We need something to lift into the sky.",
        INVALID_FILE_PATH:
            "That file path doesn’t seem quite right 🌾 Let’s double-check the trail.",
        PUBLIC_ID_MISSING:
            "We need the cloud's name tag (publicId) to remove this file 🌤️"
    },

    OTP: {
        INVALID: "Hmm... that OTP doesn't match 🌾 Please check and try again.",
        EXPIRED: "This OTP has wilted 🌸 Please request a fresh one.",
        MAX_ATTEMPTS:
            "Too many attempts 🌧️ Let’s take a pause and try again with a new OTP.",
        ERROR: "We ran into a little hiccup while verifying 🌿 Please try again shortly."
    },

    RESET_PASSWORD: {
        ERROR: "Something got tangled in the process 🌾 Let’s try resetting again.",
        EXPIRED: "This reset link has dried up 🌿 Please request a new one.",
        DATA_MISSING:
            "We couldn't find your reset info 🌱 Try requesting a fresh link."
    },

    CART: {
        ADD_FAILED: "We couldn’t add this item to your cart 🍂 Try again.",
        REMOVE_FAILED: "Something stopped us from removing this item 🌧️",
        UPDATE_FAILED: "We couldn’t update your cart 🌱 Please try again.",
        ITEM_NOT_FOUND: "This item isn’t in your cart anymore 🛒🍃",
        EMPTY_CART: "Your cart is already empty 🍂 Nothing to clear!",
        OUT_OF_STOCK:
            "One of the items is out of stock 🌧️ Please update your cart."
    },

    WISHLIST: {
        ADD_FAILED:
            "We couldn’t add this to your wishlist 🌾 Try again shortly.",
        REMOVE_FAILED: "This item didn’t want to leave your wishlist 🍂",
        ITEM_NOT_FOUND: "This item isn’t blooming in your wishlist 🌱"
    },

    PAYMENTS: {
        PAYMENT_FAILED: "The payment didn’t sprout 🌧️ Please try again.",
        PAYMENT_TIMEOUT:
            "Your payment took too long to process ⏳ Please try again.",
        INVALID_PAYMENT_METHOD: "This payment method isn’t supported 🌿",
        REFUND_FAILED: "The refund couldn’t bloom yet 🌧️ We’ll retry soon.",
        TRANSACTION_ERROR: "There was a hiccup in your transaction 🌾"
    },

    DELIVERIES: {
        DELIVERY_FAILED:
            "The delivery path hit a bump 🌧️ We’ll try again soon.",
        PICKUP_ERROR: "We couldn’t schedule the pickup 🌾 Please retry.",
        RETURN_FAILED: "The return didn’t process yet 🍂",
        DELIVERY_PARTNER_ISSUE:
            "We had trouble assigning a delivery partner 🚚🌧️"
    },

    FEEDBACK: {
        SUBMISSION_FAILED:
            "We couldn’t receive your thoughts 🌧️ Try again shortly.",
        SUPPORT_FAILURE: "Your request didn’t take root yet 🌾 Please retry.",
        FORM_INCOMPLETE: "Some fields are missing 🌱 Please complete the form."
    },

    SUBSCRIPTION: {
        ALREADY_SUBSCRIBED: "You’re already subscribed to our garden news 🌻",
        UNSUBSCRIBE_FAILED: "We couldn’t stop your subscription right now 🍃",
        ALERT_ENABLE_FAILED: "We couldn’t enable restock alerts just now 🌧️"
    },

    BULK_ACTIONS: {
        BULK_UPLOAD_FAILED:
            "Bulk upload didn’t go through 🌾 Check your file and try again.",
        BULK_UPDATE_FAILED:
            "Something went wrong while updating items in bulk 🌧️"
    },

    ROLES_PERMISSIONS: {
        ROLE_ASSIGN_FAILED:
            "The role couldn’t be assigned 🌱 Please check and retry.",
        PERMISSION_DENIED:
            "Permission denied 🌿 This area is off-limits for now."
    },

    ADMIN_ANALYTICS: {
        ANALYTICS_LOAD_FAILED:
            "Insight leaves didn’t grow 🌧️ Try refreshing your dashboard."
    },

    KEY_AREA_MANAGER: {
        AREA_FETCH_FAILED:
            "We couldn’t find your assigned zones 🌾 Try again later."
    },

    BILLING: {
        INVOICE_GENERATION_FAILED:
            "The invoice couldn’t bloom 🌧️ Please try again.",
        BILLING_INFO_MISSING:
            "Billing details are incomplete 🌿 Let’s fill them in."
    }
};

module.exports = ERROR_MESSAGES;
