const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Optional
  conversationKey: { type: String },
  initialMessage: { type: String },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

chatRequestSchema.index({ conversationKey: 1 }, { unique: true, sparse: true });
chatRequestSchema.index({ sender: 1, receiver: 1 });
chatRequestSchema.index({ receiver: 1, status: 1 });
chatRequestSchema.index({ sender: 1, status: 1 });
chatRequestSchema.index({ createdAt: -1 });
chatRequestSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
chatRequestSchema.index({ receiver: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
