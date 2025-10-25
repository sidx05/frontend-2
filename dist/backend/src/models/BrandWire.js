"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandWire = void 0;
// backend/src/models/BrandWire.ts
const mongoose_1 = require("../lib/mongoose");
const mongoose_2 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const brandWireSchema = new mongoose_2.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: false,
        unique: true
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    content: {
        type: String,
        required: true
    },
    images: [{
            url: {
                type: String,
                required: true,
                trim: true
            },
            alt: {
                type: String,
                required: false,
                trim: true
            },
            caption: {
                type: String,
                trim: true
            },
            width: {
                type: Number
            },
            height: {
                type: Number
            }
        }],
    category: {
        type: String,
        required: true,
        enum: ['influential-personalities', 'brand-spotlight', 'industry-insights', 'thought-leadership', 'company-news'],
        default: 'influential-personalities'
    },
    tags: [{
            type: String,
            trim: true
        }],
    author: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        required: true,
        default: 'en',
        validate: {
            validator: function (v) {
                return /^[a-z]{2,3}$/.test(v);
            },
            message: 'Language must be a valid ISO language code'
        }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    publishedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    seo: {
        metaDescription: {
            type: String,
            trim: true,
            maxlength: 160
        },
        keywords: [{
                type: String,
                trim: true
            }]
    },
    socialMedia: {
        posts: {
            type: Map,
            of: String
        },
        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Generate slug before saving
brandWireSchema.pre('save', function (next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = (0, slugify_1.default)(this.title, { lower: true, strict: true });
    }
    next();
});
// Indexes
brandWireSchema.index({ status: 1, publishedAt: -1 });
brandWireSchema.index({ category: 1, status: 1 });
brandWireSchema.index({ featured: 1, priority: -1 });
brandWireSchema.index({ language: 1, status: 1 });
brandWireSchema.index({ slug: 1 });
exports.BrandWire = mongoose_1.mongoose.model('BrandWire', brandWireSchema);
//# sourceMappingURL=BrandWire.js.map