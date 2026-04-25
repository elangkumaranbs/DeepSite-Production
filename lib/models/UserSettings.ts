import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  username: string;
  netlifyToken?: string;
  vercelToken?: string;
}

const UserSettingsSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  netlifyToken: { type: String },
  vercelToken: { type: String },
}, { timestamps: true });

export default mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
