"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
// backend/src/models/Category.ts
const mongoose_1 = require("mongoose");
const mongoose_2 = require("../lib/mongoose");
const categorySchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    label: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        required: true,
        default: 'newspaper',
    },
    color: {
        type: String,
        required: true,
        default: '#6366f1',
    },
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    order: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
    language: {
        type: String,
        trim: true,
        lowercase: true,
    },
    isDynamic: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // automatically adds createdAt & updatedAt
});
// Indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ order: 1 });
exports.Category = mongoose_2.mongoose.model('Category', categorySchema);
//# sourceMappingURL=Category.js.map