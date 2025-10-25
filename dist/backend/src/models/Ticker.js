"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticker = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("../lib/mongoose");
const tickerSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    expiry: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});
// Create indexes
tickerSchema.index({ expiry: 1 });
tickerSchema.index({ priority: -1, createdAt: -1 });
exports.Ticker = mongoose_2.mongoose.model('Ticker', tickerSchema);
//# sourceMappingURL=Ticker.js.map