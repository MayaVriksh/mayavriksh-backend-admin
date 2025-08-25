// Name Field Constants
const FIRST_NAME = "FIRST_NAME";
const LAST_NAME = "LAST_NAME";

// Address Field Constants
const STREET_ADDRESS = "STREET_ADDRESS";
const LANDMARK = "LANDMARK";
const CITY = "CITY";
const STATE = "STATE";
const COUNTRY = "COUNTRY";
const PIN_CODE = "PIN_CODE";
const LATITUDE = "LATITUDE";
const LONGITUDE = "LONGITUDE";

// Grouped Address Fields
const ADDRESS_FIELDS = [
    STREET_ADDRESS,
    LANDMARK,
    CITY,
    STATE,
    COUNTRY,
    PIN_CODE,
    LATITUDE,
    LONGITUDE
];

// Product Type Constants
const PRODUCT_TYPES = {
    PLANT: "PLANT",
    PLANT_VARIANT: "PLANT_VARIANT",
    PLANT_SIZE:"PLANT_SIZE",
    POT: "POT",
    POT_VARIANT: "POT_VARIANT"
};

// Media Type Constants
const MEDIA_TYPES = {
    IMAGE: "IMAGE",
    VIDEO: "VIDEO",
    DOCUMENT: "DOCUMENT"
};

module.exports = {
    FIRST_NAME,
    LAST_NAME,
    STREET_ADDRESS,
    LANDMARK,
    CITY,
    STATE,
    COUNTRY,
    PIN_CODE,
    LATITUDE,
    LONGITUDE,
    ADDRESS_FIELDS,
    PRODUCT_TYPES,
    MEDIA_TYPES
};
