const Joi = require("joi");

module.exports = [
    {
        method: "GET",
        path: "/test",
        options: {
            description: "Get welcome message",
            notes: "Returns a simple welcome message",
            tags: ["api", "Test"],
            response: {
                status: {
                    200: Joi.object({
                        message: Joi.string().required()
                    })
                }
            }
        },
        handler: (_, h) => {
            return h
                .response({ message: "Welcome to Mayavriksh API!" })
                .code(200);
        }
    }
];
