const { ROLES } = require("../../constants/roles.constant.js");

const {
    FIRST_NAME,
    LAST_NAME,
    STREET_ADDRESS,
    LANDMARK,
    CITY,
    STATE,
    COUNTRY,
    PIN_CODE,
    LATITUDE,
    LONGITUDE
} = require("../../constants/general.constant.js");

const adminUsers = [
    {
        role: ROLES.ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Arjun",
                [LAST_NAME]: "Sharma"
            },
            email: "arjun.sharma.admin@example.com",
            phoneNumber: "+919876543210",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "123 Admin Lane",
                [CITY]: "Delhi",
                [STATE]: "Delhi",
                [COUNTRY]: "India",
                [PIN_CODE]: "110001",
                [LANDMARK]: "Near Connaught Place",
                [LATITUDE]: "28.6139",
                [LONGITUDE]: "77.2090"
            }
        }
    },
    {
        role: ROLES.SUPPLIER,
        user: {
            fullName: {
                [FIRST_NAME]: "Maya",
                [LAST_NAME]: "Vriksh"
            },
            email: "maya.vriksh2025@gmail.com",
            phoneNumber: "+919876543211",
            password: "Maya@1234",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "456 Admin Nagar",
                [CITY]: "Mumbai",
                [STATE]: "Maharashtra",
                [COUNTRY]: "India",
                [PIN_CODE]: "400001",
                [LANDMARK]: "Near Marine Drive",
                [LATITUDE]: "18.9388",
                [LONGITUDE]: "72.8354"
            }
        }
    },
    {
        role: ROLES.ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Sameer",
                [LAST_NAME]: "Desai"
            },
            email: "sameer.desai.admin@example.com",
            phoneNumber: "+919876543212",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "789 Admin Path",
                [CITY]: "Bangalore",
                [STATE]: "Karnataka",
                [COUNTRY]: "India",
                [PIN_CODE]: "560001",
                [LANDMARK]: "Near MG Road",
                [LATITUDE]: "12.9716",
                [LONGITUDE]: "77.5946"
            }
        }
    },
    {
        role: ROLES.ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Vivek",
                [LAST_NAME]: "Patel"
            },
            email: "vivek.patel.admin@example.com",
            phoneNumber: "+919876543213",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "101 Admin Road",
                [CITY]: "Ahmedabad",
                [STATE]: "Gujarat",
                [COUNTRY]: "India",
                [PIN_CODE]: "380001",
                [LANDMARK]: "Near Law Garden",
                [LATITUDE]: "23.0225",
                [LONGITUDE]: "72.5714"
            }
        }
    },
    {
        role: ROLES.ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Nihar",
                [LAST_NAME]: "Bhatt"
            },
            email: "nihar.bhatt.admin@example.com",
            phoneNumber: "+919876543214",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "102 Admin Street",
                [CITY]: "Chandigarh",
                [STATE]: "Punjab",
                [COUNTRY]: "India",
                [PIN_CODE]: "160017",
                [LANDMARK]: "Near Rock Garden",
                [LATITUDE]: "30.7333",
                [LONGITUDE]: "76.7794"
            }
        }
    }
];

const superAdminUsers = [
    {
        role: ROLES.SUPER_ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Amit",
                [LAST_NAME]: "Khanna"
            },
            email: "amit.khanna.superadmin@example.com",
            phoneNumber: "+919876543215",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "1 Supreme Avenue",
                [CITY]: "New Delhi",
                [STATE]: "Delhi",
                [COUNTRY]: "India",
                [PIN_CODE]: "110002",
                [LANDMARK]: "Near India Gate",
                [LATITUDE]: "28.6129",
                [LONGITUDE]: "77.2295"
            }
        }
    },
    {
        role: ROLES.SUPER_ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Kunal",
                [LAST_NAME]: "Sen"
            },
            email: "kunal.sen.superadmin@example.com",
            phoneNumber: "+919876543216",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "2 Super Block",
                [CITY]: "Hyderabad",
                [STATE]: "Telangana",
                [COUNTRY]: "India",
                [PIN_CODE]: "500001",
                [LANDMARK]: "Near Charminar",
                [LATITUDE]: "17.3850",
                [LONGITUDE]: "78.4867"
            }
        }
    },
    {
        role: ROLES.SUPER_ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Rahul",
                [LAST_NAME]: "Goyal"
            },
            email: "rahul.goyal.superadmin@example.com",
            phoneNumber: "+919876543217",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "3 Supreme Lane",
                [CITY]: "Jaipur",
                [STATE]: "Rajasthan",
                [COUNTRY]: "India",
                [PIN_CODE]: "302001",
                [LANDMARK]: "Near Hawa Mahal",
                [LATITUDE]: "26.9124",
                [LONGITUDE]: "75.7873"
            }
        }
    },
    {
        role: ROLES.SUPER_ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Siddharth",
                [LAST_NAME]: "Mehta"
            },
            email: "siddharth.mehta.superadmin@example.com",
            phoneNumber: "+919876543218",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "4 Supreme Path",
                [CITY]: "Pune",
                [STATE]: "Maharashtra",
                [COUNTRY]: "India",
                [PIN_CODE]: "411001",
                [LANDMARK]: "Near Shaniwar Wada",
                [LATITUDE]: "18.5204",
                [LONGITUDE]: "73.8567"
            }
        }
    },
    {
        role: ROLES.SUPER_ADMIN,
        user: {
            fullName: {
                [FIRST_NAME]: "Varun",
                [LAST_NAME]: "Rathi"
            },
            email: "varun.rathi.superadmin@example.com",
            phoneNumber: "+919876543219",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "5 Supreme Tower",
                [CITY]: "Chennai",
                [STATE]: "Tamil Nadu",
                [COUNTRY]: "India",
                [PIN_CODE]: "600001",
                [LANDMARK]: "Near Marina Beach",
                [LATITUDE]: "13.0827",
                [LONGITUDE]: "80.2707"
            }
        }
    }
];

const customerUsers = [
    {
        role: ROLES.CUSTOMER,
        user: {
            fullName: {
                [FIRST_NAME]: "Rohan",
                [LAST_NAME]: "Sharma"
            },
            email: "rohan.sharma.customer@example.com",
            phoneNumber: "+919876543220",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "101 Lotus Apartments",
                [CITY]: "Mumbai",
                [STATE]: "Maharashtra",
                [COUNTRY]: "India",
                [PIN_CODE]: "400001",
                [LANDMARK]: "Near Marine Drive",
                [LATITUDE]: "18.9388",
                [LONGITUDE]: "72.8354"
            }
        }
    },
    {
        role: ROLES.CUSTOMER,
        user: {
            fullName: {
                [FIRST_NAME]: "Prateek",
                [LAST_NAME]: "Saxena"
            },
            email: "prateek.saxena.customer@example.com",
            phoneNumber: "+919876543221",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "202 Sunrise Residency",
                [CITY]: "Bangalore",
                [STATE]: "Karnataka",
                [COUNTRY]: "India",
                [PIN_CODE]: "560001",
                [LANDMARK]: "Near Lal Bagh",
                [LATITUDE]: "12.9716",
                [LONGITUDE]: "77.5946"
            }
        }
    },
    {
        role: ROLES.CUSTOMER,
        user: {
            fullName: {
                [FIRST_NAME]: "Saurabh",
                [LAST_NAME]: "Mishra"
            },
            email: "saurabh.mishra.customer@example.com",
            phoneNumber: "+919876543222",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "303 Royal Garden",
                [CITY]: "Lucknow",
                [STATE]: "Uttar Pradesh",
                [COUNTRY]: "India",
                [PIN_CODE]: "226001",
                [LANDMARK]: "Near Ambedkar Park",
                [LATITUDE]: "26.8467",
                [LONGITUDE]: "80.9462"
            }
        }
    },
    {
        role: ROLES.CUSTOMER,
        user: {
            fullName: {
                [FIRST_NAME]: "Aakash",
                [LAST_NAME]: "Verma"
            },
            email: "aakash.verma.customer@example.com",
            phoneNumber: "+919876543223",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "404 Green Villas",
                [CITY]: "Chandigarh",
                [STATE]: "Punjab",
                [COUNTRY]: "India",
                [PIN_CODE]: "160017",
                [LANDMARK]: "Near Rock Garden",
                [LATITUDE]: "30.7333",
                [LONGITUDE]: "76.7794"
            }
        }
    },
    {
        role: ROLES.CUSTOMER,
        user: {
            fullName: {
                [FIRST_NAME]: "Manish",
                [LAST_NAME]: "Yadav"
            },
            email: "manish.yadav.customer@example.com",
            phoneNumber: "+919876543224",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "505 Sky Heights",
                [CITY]: "Indore",
                [STATE]: "Madhya Pradesh",
                [COUNTRY]: "India",
                [PIN_CODE]: "452001",
                [LANDMARK]: "Near Rajwada Palace",
                [LATITUDE]: "22.7196",
                [LONGITUDE]: "75.8577"
            }
        }
    }
];

const supplierUsers = [
    {
        role: ROLES.SUPPLIER,
        user: {
            fullName: {
                [FIRST_NAME]: "Arjun",
                [LAST_NAME]: "Verma"
            },
            email: "restaurant@gmail.com",
            phoneNumber: "+919090902345",
            password: "res@12345",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "78 Lotus Garden Road",
                [CITY]: "Delhi",
                [STATE]: "Delhi",
                [COUNTRY]: "India",
                [PIN_CODE]: "110001",
                [LANDMARK]: "Near Lodhi Garden",
                [LATITUDE]: "28.6139",
                [LONGITUDE]: "77.2090"
            }
        },
        supplier: {
            nurseryName: "Nature’s Bloom Nursery",
            contactPerson: "Arjun Verma",
            businessCategory: "Plant Nursery",
            gstin: "07AAACV9023B1Z1"
        }
    },
    {
        role: ROLES.SUPPLIER,
        user: {
            fullName: {
                [FIRST_NAME]: "Rajeev",
                [LAST_NAME]: "Singhania"
            },
            email: "rajeev.singhania@mayavriksh.com",
            phoneNumber: "+919876543230",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "101 Green Nursery Road",
                [CITY]: "Pune",
                [STATE]: "Maharashtra",
                [COUNTRY]: "India",
                [PIN_CODE]: "411001",
                [LANDMARK]: "Near Osho Garden",
                [LATITUDE]: "18.5204",
                [LONGITUDE]: "73.8567"
            }
        },
        supplier: {
            nurseryName: "GreenLeaf Nursery",
            contactPerson: "Rajeev Singhania",
            businessCategory: "Plant Nursery",
            gstin: "27AAACG9123K1Z2"
        }
    },
    {
        role: ROLES.SUPPLIER,
        user: {
            fullName: {
                [FIRST_NAME]: "Ashok",
                [LAST_NAME]: "Patel"
            },
            email: "ashok.patel@mayavriksh.com",
            phoneNumber: "+919876543231",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "22 MG Road",
                [CITY]: "Ahmedabad",
                [STATE]: "Gujarat",
                [COUNTRY]: "India",
                [PIN_CODE]: "380001",
                [LANDMARK]: "Opposite Law Garden",
                [LATITUDE]: "23.0225",
                [LONGITUDE]: "72.5714"
            }
        },
        supplier: {
            nurseryName: "Flora World",
            contactPerson: "Ashok Patel",
            businessCategory: "Garden Supplies",
            gstin: "24AAACP4567N1Z3"
        }
    },
    {
        role: ROLES.SUPPLIER,
        user: {
            fullName: {
                [FIRST_NAME]: "Satyam",
                [LAST_NAME]: "Mehta"
            },
            email: "satyam.mehta@mayavriksh.com",
            phoneNumber: "+919876543232",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "88 Garden Lane",
                [CITY]: "Delhi",
                [STATE]: "Delhi",
                [COUNTRY]: "India",
                [PIN_CODE]: "110001",
                [LANDMARK]: "Near India Gate",
                [LATITUDE]: "28.6139",
                [LONGITUDE]: "77.2090"
            }
        },
        supplier: {
            nurseryName: "Urban Botanica",
            contactPerson: "Satyam Mehta",
            businessCategory: "Landscape Plants",
            gstin: "07AAACU6789L1Z4"
        }
    },
    {
        role: ROLES.SUPPLIER,
        user: {
            fullName: {
                [FIRST_NAME]: "Karan",
                [LAST_NAME]: "Bhagat"
            },
            email: "karan.bhagat@mayavriksh.com",
            phoneNumber: "+919876543233",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "45 Plant Street",
                [CITY]: "Jaipur",
                [STATE]: "Rajasthan",
                [COUNTRY]: "India",
                [PIN_CODE]: "302001",
                [LANDMARK]: "Near Hawa Mahal",
                [LATITUDE]: "26.9124",
                [LONGITUDE]: "75.7873"
            }
        },
        supplier: {
            nurseryName: "Pink City Nursery",
            contactPerson: "Karan Bhagat",
            businessCategory: "Plant Nursery",
            gstin: "08AAACK1234R1Z5"
        }
    },
    {
        role: ROLES.SUPPLIER,
        user: {
            fullName: {
                [FIRST_NAME]: "Deepak",
                [LAST_NAME]: "Rao"
            },
            email: "deepak.rao@mayavriksh.com",
            phoneNumber: "+919876543234",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "36 Tree Corner",
                [CITY]: "Kochi",
                [STATE]: "Kerala",
                [COUNTRY]: "India",
                [PIN_CODE]: "682001",
                [LANDMARK]: "Near Marine Drive",
                [LATITUDE]: "9.9312",
                [LONGITUDE]: "76.2673"
            }
        },
        supplier: {
            nurseryName: "Coco Gardens",
            contactPerson: "Deepak Rao",
            businessCategory: "Exotic Plants",
            gstin: "32AAACD5678P1Z6"
        }
    }
];

const keyAreaManagerUsers = [
    {
        role: ROLES.KEY_AREA_MANAGER,
        user: {
            fullName: {
                [FIRST_NAME]: "Ravindra",
                [LAST_NAME]: "Pratap"
            },
            email: "ravindra.pratap.kam@example.com",
            phoneNumber: "+919876543240",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "91 Manager Complex",
                [CITY]: "Nagpur",
                [STATE]: "Maharashtra",
                [COUNTRY]: "India",
                [PIN_CODE]: "440001",
                [LANDMARK]: "Near Zero Mile",
                [LATITUDE]: "21.1458",
                [LONGITUDE]: "79.0882"
            }
        }
    },
    {
        role: ROLES.KEY_AREA_MANAGER,
        user: {
            fullName: {
                [FIRST_NAME]: "Umesh",
                [LAST_NAME]: "Dwivedi"
            },
            email: "umesh.dwivedi.kam@example.com",
            phoneNumber: "+919876543241",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "B-22 Operations Zone",
                [CITY]: "Bhopal",
                [STATE]: "Madhya Pradesh",
                [COUNTRY]: "India",
                [PIN_CODE]: "462001",
                [LANDMARK]: "Near Upper Lake",
                [LATITUDE]: "23.2599",
                [LONGITUDE]: "77.4126"
            }
        }
    },
    {
        role: ROLES.KEY_AREA_MANAGER,
        user: {
            fullName: {
                [FIRST_NAME]: "Dinesh",
                [LAST_NAME]: "Saxena"
            },
            email: "dinesh.saxena.kam@example.com",
            phoneNumber: "+919876543242",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "75 Logistics Lane",
                [CITY]: "Kanpur",
                [STATE]: "Uttar Pradesh",
                [COUNTRY]: "India",
                [PIN_CODE]: "208001",
                [LANDMARK]: "Near Z Square Mall",
                [LATITUDE]: "26.4499",
                [LONGITUDE]: "80.3319"
            }
        }
    },
    {
        role: ROLES.KEY_AREA_MANAGER,
        user: {
            fullName: {
                [FIRST_NAME]: "Sanjay",
                [LAST_NAME]: "Goyal"
            },
            email: "sanjay.goyal.kam@example.com",
            phoneNumber: "+919876543243",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "22 Supply Square",
                [CITY]: "Ranchi",
                [STATE]: "Jharkhand",
                [COUNTRY]: "India",
                [PIN_CODE]: "834001",
                [LANDMARK]: "Near Rock Garden",
                [LATITUDE]: "23.3441",
                [LONGITUDE]: "85.3096"
            }
        }
    },
    {
        role: ROLES.KEY_AREA_MANAGER,
        user: {
            fullName: {
                [FIRST_NAME]: "Harsh",
                [LAST_NAME]: "Tripathi"
            },
            email: "harsh.tripathi.kam@example.com",
            phoneNumber: "+919876543244",
            password: "password@123",
            profileImageUrl: null,
            phoneVerified: true,
            emailVerified: true,
            isActive: true,
            address: {
                [STREET_ADDRESS]: "88 Distribution Colony",
                [CITY]: "Raipur",
                [STATE]: "Chhattisgarh",
                [COUNTRY]: "India",
                [PIN_CODE]: "492001",
                [LANDMARK]: "Near Magneto Mall",
                [LATITUDE]: "21.2514",
                [LONGITUDE]: "81.6296"
            }
        }
    }
];

module.exports = {
    adminUsers,
    superAdminUsers,
    customerUsers,
    supplierUsers,
    keyAreaManagerUsers
};
