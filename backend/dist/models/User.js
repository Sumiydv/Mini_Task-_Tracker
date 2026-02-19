import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });
UserSchema.index({ email: 1 }, { unique: true });
export const User = mongoose.model('User', UserSchema);
