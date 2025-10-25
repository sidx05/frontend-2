"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("../lib/mongoose");
const sourceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    rssUrls: [{
            type: String,
            trim: true,
            required: true
        }],
    lang: {
        type: String,
        required: true,
        default: 'en'
    },
    categories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category'
        }],
    active: {
        type: Boolean,
        default: true
    },
    lastScraped: {
        type: Date
    },
    type: { type: String, enum: ['rss', 'api'], default: 'rss' }
}, {
    timestamps: true
});
// Create indexes
sourceSchema.index({ active: 1, lang: 1 });
sourceSchema.index({ categories: 1 });
sourceSchema.index({ lastScraped: 1 });
exports.Source = mongoose_2.mongoose.model('Source', sourceSchema);
//# sourceMappingURL=Source.js.map