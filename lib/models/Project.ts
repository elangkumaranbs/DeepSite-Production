import mongoose, { Schema, Document } from 'mongoose';

export interface IFile {
  path: string;
  content: string;
}

export interface IProject extends Document {
  name: string;
  owner: string;
  files: IFile[];
  prompt?: string;
  lastModified: Date;
  isDraft: boolean;
  repoId?: string;
  brandKit?: {
    primaryColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  netlifyDeploy?: {
    siteId: string;
    url: string;
  };
  vercelDeploy?: {
    projectId: string;
    url: string;
  };
}

const FileSchema: Schema = new Schema({
  path: { type: String, required: true },
  content: { type: String, required: true },
});

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true, index: true },
  files: [FileSchema],
  prompt: { type: String },
  lastModified: { type: Date, default: Date.now },
  isDraft: { type: Boolean, default: true },
  repoId: { type: String },
  brandKit: {
    primaryColor: { type: String },
    fontFamily: { type: String },
    borderRadius: { type: String },
  },
  netlifyDeploy: {
    siteId: { type: String },
    url: { type: String },
  },
  vercelDeploy: {
    projectId: { type: String },
    url: { type: String },
  },
}, { timestamps: true });

// Ensure unique project names per owner
ProjectSchema.index({ name: 1, owner: 1 }, { unique: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
