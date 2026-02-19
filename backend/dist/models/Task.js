import mongoose, { Schema } from 'mongoose';
const TaskSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    dueDate: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });
TaskSchema.index({ owner: 1 });
TaskSchema.index({ status: 1 });
export const Task = mongoose.model('Task', TaskSchema);
