import mongoose, { Schema, Document, Types } from 'mongoose';

export type TaskStatus = 'pending' | 'completed';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  owner: Types.ObjectId;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    dueDate: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

TaskSchema.index({ owner: 1 });
TaskSchema.index({ status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
