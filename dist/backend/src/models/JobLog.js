"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const jobLogSchema = new mongoose_1.Schema({
    jobType: {
        type: String,
        required: true,
        enum: ['scraping', 'moderation', 'publishing']
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed'],
        default: 'pending'
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number
    },
    meta: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});
// Calculate duration before saving
jobLogSchema.pre('save', function (next) {
    if (this.startTime && this.endTime && !this.duration) {
        this.duration = this.endTime.getTime() - this.startTime.getTime();
    }
    next();
});
// Create indexes
jobLogSchema.index({ jobType: 1, createdAt: -1 });
jobLogSchema.index({ status: 1, createdAt: -1 });
jobLogSchema.index({ 'meta.sourceId': 1 });
jobLogSchema.index({ 'meta.articleId': 1 });
exports.JobLog = mongoose_1.default.model('JobLog', jobLogSchema);
//# sourceMappingURL=JobLog.js.map