"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const swaggerDocument = yamljs_1.default.load('./src/config/swagger.yaml');
// This function sets up all Swagger-related routes and should be exported once.
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    // Swagger in JSON format
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocument);
    });
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map